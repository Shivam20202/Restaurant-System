import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import Popup from '../components/Popup'

const TIME_SLOTS = [
  '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
  '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00',
]
const DURATION = 90

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function toMinutes(time) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function overlaps(startA, durA, startB, durB) {
  return startA < startB + durB && startB < startA + durA
}

export default function Reserve() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [tables, setTables] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [popup, setPopup] = useState({ type: '', message: '' })

  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('')
  const [partySize, setPartySize] = useState(2)
  const [tableId, setTableId] = useState('')
  const [specialRequest, setSpecialRequest] = useState('')

  const loadData = useCallback(async (selectedDate) => {
    try {
      const [tablesRes, bookedRes] = await Promise.all([
        api.getTables(),
        api.getAvailability(selectedDate),
      ])
      setTables(tablesRes.filter((t) => t.isActive))
      setBookings(bookedRes)
    } catch {
      setTables([])
      setBookings([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData(date)
  }, [date, loadData])

  // Check if a specific table+time slot conflicts with any existing booking
  function isSlotBooked(tableIdVal, slotTime) {
    const slotStart = toMinutes(slotTime)
    return bookings.some((b) => {
      if (b.tableId !== tableIdVal) return false
      const bStart = toMinutes(b.time)
      return overlaps(slotStart, DURATION, bStart, DURATION)
    })
  }

  // For time slot buttons: check if ALL qualifying tables are booked at that time
  function isTimeFullyBooked(slotTime) {
    const qualifying = tables.filter((t) => t.seats >= partySize)
    if (qualifying.length === 0) return true
    return qualifying.every((t) => isSlotBooked(t._id, slotTime))
  }

  const availableTables = tables.filter((t) => {
    if (t.seats < partySize) return false
    if (!time) return true
    return !isSlotBooked(t._id, time)
  })

  async function handleSubmit(e) {
    e.preventDefault()
    setPopup({ type: '', message: '' })
    setSubmitting(true)
    try {
      await api.createReservation({
        tableId,
        date,
        time,
        partySize,
        specialRequest: specialRequest || undefined,
      })
      setPopup({ type: 'success', message: 'Reservation confirmed! Redirecting to your reservations…' })
      setSubmitting(false)
      setTimeout(() => navigate('/my-reservations'), 2000)
    } catch (err) {
      setPopup({ type: 'error', message: err.message })
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-neutral-400 animate-pulse">Loading…</div>
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 animate-fade-in">
      <Popup type={popup.type} message={popup.message} onClose={() => setPopup({ type: '', message: '' })} />

      <h1 className="font-display text-3xl font-bold text-neutral-900 mb-2">Make a Reservation</h1>
      <p className="text-neutral-500 mb-8">Hi {user?.name}, book your table below</p>

      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="date">Date</label>
            <input id="date" type="date" required min={todayStr()} value={date} onChange={(e) => { setDate(e.target.value); setTime(''); setTableId('') }} className="input cursor-pointer" />
          </div>
          <div>
            <label className="label" htmlFor="partySize">Party Size</label>
            <select id="partySize" value={partySize} onChange={(e) => { setPartySize(Number(e.target.value)); setTableId('') }} className="input cursor-pointer">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label">Time Slot</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {TIME_SLOTS.map((slot) => {
              const fullyBooked = isTimeFullyBooked(slot)
              return (
                <button
                  key={slot}
                  type="button"
                  disabled={fullyBooked}
                  onClick={() => { setTime(slot); setTableId('') }}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${time === slot ? 'bg-primary-600 text-white shadow-sm' : fullyBooked ? 'bg-neutral-100 text-neutral-300 cursor-not-allowed' : 'bg-white border border-neutral-300 text-neutral-700 hover:border-primary-400 hover:bg-primary-50 cursor-pointer'}`}
                >
                  {slot}
                </button>
              )
            })}
          </div>
          {!time && <p className="text-xs text-neutral-400 mt-2">Select a time to see available tables</p>}
        </div>

        {time && (
          <div className="animate-fade-in">
            <label className="label">Available Tables</label>
            {availableTables.length === 0 ? (
              <p className="text-sm text-neutral-500 p-4 bg-neutral-50 rounded-lg">
                No tables available for {partySize} guests at {time}. Try a different time or party size.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {availableTables.map((t) => (
                  <button
                    key={t._id}
                    type="button"
                    onClick={() => setTableId(t._id)}
                    className={`p-4 rounded-lg border text-left transition-all cursor-pointer ${tableId === t._id ? 'border-primary-600 bg-primary-50 ring-2 ring-primary-500' : 'border-neutral-300 bg-white hover:border-primary-400'}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-900">{t.name}</span>
                      <span className="badge bg-neutral-100 text-neutral-600">{t.seats} seats</span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">{t.location}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div>
          <label className="label" htmlFor="special">Special Requests <span className="text-neutral-400 font-normal">(optional)</span></label>
          <textarea id="special" value={specialRequest} onChange={(e) => setSpecialRequest(e.target.value)} className="input" rows={3} placeholder="Allergies, celebration, seating preference…" />
        </div>

        <button type="submit" disabled={submitting || !tableId || !time} className="btn-primary w-full cursor-pointer">
          {submitting ? 'Booking…' : 'Confirm Reservation'}
        </button>
      </form>
    </div>
  )
}
