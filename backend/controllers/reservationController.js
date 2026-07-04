import { Reservation } from '../models/Reservation.js'
import { Table } from '../models/Table.js'

const VALID_STATUSES = ['confirmed', 'cancelled', 'completed', 'no_show']
const DEFAULT_DURATION = 90 // minutes

/**
 * Find a conflicting reservation for the same table, date, and overlapping time.
 * Each reservation occupies [time, time + durationMinutes).
 */
async function findConflictingReservation({ tableId, date, time, durationMinutes, excludeId = null }) {
  const [h, m] = time.split(':').map(Number)
  const startMinutes = h * 60 + m
  const endMinutes = startMinutes + durationMinutes

  const query = { tableId, date, status: 'confirmed' }
  if (excludeId) query._id = { $ne: excludeId }

  const reservations = await Reservation.find(query)

  return reservations.find((r) => {
    const [rh, rm] = r.time.split(':').map(Number)
    const rStart = rh * 60 + rm
    const rEnd = rStart + r.durationMinutes
    return startMinutes < rEnd && rStart < endMinutes
  })
}

/**
 * GET /api/reservations/availability?date=YYYY-MM-DD
 * Returns confirmed reservations for a given date (tableId + time only).
 * Used by the customer reservation form to show real-time availability.
 * Any authenticated user can call this.
 */
export async function getAvailability(req, res) {
  try {
    const { date } = req.query
    if (!date) {
      return res.status(400).json({ error: 'Date query parameter is required' })
    }
    const reservations = await Reservation.find({ date, status: 'confirmed' })
      .select('tableId time')
      .lean()
    res.json(reservations)
  } catch {
    res.status(500).json({ error: 'Failed to fetch availability' })
  }
}

/**
 * GET /api/reservations
 * Customers see their own reservations; admins see all (optional ?date= filter).
 * Admin results are populated with table and user info for the dashboard.
 */
export async function getReservations(req, res) {
  try {
    if (req.user.role === 'admin') {
      const filter = {}
      if (req.query.date) filter.date = req.query.date

      const reservations = await Reservation.find(filter)
        .populate('tableId', 'name location seats')
        .populate('userId', 'name email')
        .sort({ date: -1, time: -1 })
        .lean()

      const formatted = reservations.map((r) => ({
        ...r,
        tableId: r.tableId?._id ?? r.tableId,
        tableName: r.tableId?.name ?? null,
        tableLocation: r.tableId?.location ?? null,
        tableSeats: r.tableId?.seats ?? null,
        userId: r.userId?._id ?? r.userId,
        userName: r.userId?.name ?? null,
        userEmail: r.userId?.email ?? null,
      }))

      return res.json(formatted)
    }

    const reservations = await Reservation.find({ userId: req.user._id })
      .populate('tableId', 'name location seats')
      .sort({ date: -1, time: -1 })
      .lean()

    const formatted = reservations.map((r) => ({
      ...r,
      tableId: r.tableId?._id ?? r.tableId,
      tableName: r.tableId?.name ?? null,
      tableLocation: r.tableId?.location ?? null,
      tableSeats: r.tableId?.seats ?? null,
    }))

    res.json(formatted)
  } catch {
    res.status(500).json({ error: 'Failed to fetch reservations' })
  }
}

/**
 * POST /api/reservations
 * Creates a reservation after full validation:
 *   required fields, table existence, capacity, no past date, time format, overlap.
 */
export async function createReservation(req, res) {
  try {
    const { tableId, date, time, partySize, specialRequest } = req.body

    if (!tableId || !date || !time || !partySize) {
      return res.status(400).json({ error: 'Table, date, time, and party size are required' })
    }

    const table = await Table.findById(tableId)
    if (!table) {
      return res.status(404).json({ error: 'Table not found' })
    }
    if (!table.isActive) {
      return res.status(400).json({ error: 'This table is not available for booking' })
    }

    const guests = Number(partySize)
    if (!Number.isInteger(guests) || guests < 1) {
      return res.status(400).json({ error: 'Party size must be a positive integer' })
    }

    if (guests > table.seats) {
      return res.status(400).json({
        error: `Table "${table.name}" seats ${table.seats} guests — not enough for ${guests}`,
      })
    }

    const today = new Date().toISOString().split('T')[0]
    if (date < today) {
      return res.status(400).json({ error: 'Cannot make a reservation in the past' })
    }

    if (!/^\d{2}:\d{2}$/.test(time)) {
      return res.status(400).json({ error: 'Time must be in HH:MM format' })
    }

    const conflict = await findConflictingReservation({
      tableId,
      date,
      time,
      durationMinutes: DEFAULT_DURATION,
    })
    if (conflict) {
      return res.status(409).json({
        error: `This table is already booked at ${conflict.time}. Please choose a different time.`,
      })
    }

    const reservation = await Reservation.create({
      userId: req.user._id,
      tableId,
      restaurantId: table.restaurantId,
      date,
      time,
      partySize: guests,
      durationMinutes: DEFAULT_DURATION,
      specialRequest: specialRequest || null,
      guestName: req.user.name,
      status: 'confirmed',
    })

    res.status(201).json(reservation)
  } catch {
    res.status(500).json({ error: 'Failed to create reservation' })
  }
}

/**
 * PUT /api/reservations/:id
 * Customers can only cancel their own reservations.
 * Admins can update the status of any reservation.
 */
export async function updateReservation(req, res) {
  try {
    const { status } = req.body
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    const reservation = await Reservation.findById(req.params.id)
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' })
    }

    if (req.user.role !== 'admin') {
      if (!reservation.userId.equals(req.user._id)) {
        return res.status(403).json({ error: 'You can only cancel your own reservations' })
      }
      if (status !== 'cancelled') {
        return res.status(403).json({ error: 'Customers can only cancel reservations' })
      }
    }

    reservation.status = status
    await reservation.save()
    res.json(reservation)
  } catch {
    res.status(500).json({ error: 'Failed to update reservation' })
  }
}

/**
 * DELETE /api/reservations/:id — admin only
 */
export async function deleteReservation(req, res) {
  try {
    const deleted = await Reservation.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Reservation not found' })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete reservation' })
  }
}
