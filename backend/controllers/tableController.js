import { Table } from '../models/Table.js'

export async function getAllTables(req, res) {
  try {
    const tables = await Table.find().sort({ name: 1 })
    res.json(tables)
  } catch {
    res.status(500).json({ error: 'Failed to fetch tables' })
  }
}

export async function createTable(req, res) {
  try {
    const { name, seats, location, isActive, restaurantId } = req.body
    if (!name || !seats || !location) {
      return res.status(400).json({ error: 'Name, seats, and location are required' })
    }
    const table = await Table.create({
      name,
      seats: Number(seats),
      location,
      isActive: isActive !== undefined ? isActive : true,
      restaurantId: restaurantId || null,
    })
    res.status(201).json(table)
  } catch {
    res.status(500).json({ error: 'Failed to create table' })
  }
}

export async function updateTable(req, res) {
  try {
    const { name, seats, location, isActive } = req.body
    const updates = {}
    if (name !== undefined) updates.name = name
    if (seats !== undefined) updates.seats = Number(seats)
    if (location !== undefined) updates.location = location
    if (isActive !== undefined) updates.isActive = isActive

    const updated = await Table.findByIdAndUpdate(req.params.id, updates, { new: true })
    if (!updated) return res.status(404).json({ error: 'Table not found' })
    res.json(updated)
  } catch {
    res.status(500).json({ error: 'Failed to update table' })
  }
}

export async function deleteTable(req, res) {
  try {
    const deleted = await Table.findByIdAndDelete(req.params.id)
    if (!deleted) return res.status(404).json({ error: 'Table not found' })
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: 'Failed to delete table' })
  }
}
