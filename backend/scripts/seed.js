/**
 * Seed script — populates MongoDB Atlas with dummy data via Mongoose models:
 *   - 8 restaurants (with Pexels images)
 *   - 8 tables per restaurant
 *   - 2 admin users + 4 customer users
 *   - 12 sample reservations across restaurants
 *
 * Usage:  node scripts/seed.js
 * (Requires MONGODB_URI in backend/.env)
 */
import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { connectDB, mongoose } from '../src/config/db.js'
import { User } from '../src/models/User.js'
import { Table } from '../src/models/Table.js'
import { Restaurant } from '../src/models/Restaurant.js'
import { Reservation } from '../src/models/Reservation.js'

const RESTAURANTS = [
  { name: 'Saveur', cuisine: 'French Fine Dining', city: 'New York', image: 'https://images.pexels.com/photos/1813466/pexels-photo-1813466.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Bella Tavola', cuisine: 'Italian', city: 'Boston', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Sakura House', cuisine: 'Japanese', city: 'San Francisco', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'El Fuego', cuisine: 'Mexican', city: 'Austin', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'The Green Leaf', cuisine: 'Vegetarian', city: 'Portland', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Marina Bay', cuisine: 'Seafood', city: 'Seattle', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'Spice Route', cuisine: 'Indian', city: 'Chicago', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { name: 'La Petite Bistro', cuisine: 'French Bistro', city: 'Miami', image: 'https://images.pexels.com/photos/1581384/pexels-photo-1581384.jpeg?auto=compress&cs=tinysrgb&w=800' },
]

function makeTables(restaurantId) {
  return [
    { restaurantId, name: 'Window Booth 1', seats: 2, location: 'Window', isActive: true },
    { restaurantId, name: 'Window Booth 2', seats: 2, location: 'Window', isActive: true },
    { restaurantId, name: 'Table 3', seats: 4, location: 'Main Hall', isActive: true },
    { restaurantId, name: 'Table 4', seats: 4, location: 'Main Hall', isActive: true },
    { restaurantId, name: 'Table 5', seats: 6, location: 'Main Hall', isActive: true },
    { restaurantId, name: 'Patio 1', seats: 4, location: 'Patio', isActive: true },
    { restaurantId, name: 'Patio 2', seats: 8, location: 'Patio', isActive: true },
    { restaurantId, name: 'Private Room', seats: 10, location: 'Private', isActive: true },
  ]
}

async function seed() {
  await connectDB()

  console.log('Clearing existing data...')
  await Promise.all([
    User.deleteMany({}),
    Restaurant.deleteMany({}),
    Table.deleteMany({}),
    Reservation.deleteMany({}),
  ])

  // --- Users ---
  console.log('Creating users...')
  const userDefs = [
    { name: 'Admin User', email: 'admin@saveur.com', role: 'admin', password: 'admin123' },
    { name: 'Manager Jane', email: 'jane@saveur.com', role: 'admin', password: 'jane123' },
    { name: 'John Doe', email: 'john@example.com', role: 'customer', password: 'john123' },
    { name: 'Alice Smith', email: 'alice@example.com', role: 'customer', password: 'alice123' },
    { name: 'Bob Brown', email: 'bob@example.com', role: 'customer', password: 'bob123' },
    { name: 'Carol White', email: 'carol@example.com', role: 'customer', password: 'carol123' },
  ]
  const users = []
  for (const u of userDefs) {
    const hashed = await bcrypt.hash(u.password, 10)
    const user = await User.create({ ...u, password: hashed })
    users.push(user)
  }

  // --- Restaurants + Tables ---
  console.log('Creating restaurants and tables...')
  const allTables = []
  for (const r of RESTAURANTS) {
    const restaurant = await Restaurant.create(r)
    const tables = makeTables(restaurant._id)
    for (const t of tables) {
      const table = await Table.create(t)
      allTables.push(table)
    }
  }

  // --- Reservations ---
  console.log('Creating sample reservations...')
  const customers = users.filter((u) => u.role === 'customer')
  const today = new Date()
  const fmtDate = (offset) => {
    const d = new Date(today)
    d.setDate(d.getDate() + offset)
    return d.toISOString().split('T')[0]
  }

  const reservationDefs = [
    { tableIdx: 0, dateOffset: 0, time: '19:00', partySize: 2, customerIdx: 0, status: 'confirmed', request: 'Anniversary dinner' },
    { tableIdx: 2, dateOffset: 0, time: '18:30', partySize: 4, customerIdx: 1, status: 'confirmed', request: null },
    { tableIdx: 4, dateOffset: 1, time: '20:00', partySize: 6, customerIdx: 2, status: 'confirmed', request: 'Birthday celebration' },
    { tableIdx: 5, dateOffset: 1, time: '12:00', partySize: 3, customerIdx: 0, status: 'confirmed', request: null },
    { tableIdx: 1, dateOffset: 2, time: '19:30', partySize: 2, customerIdx: 3, status: 'confirmed', request: 'Window seat please' },
    { tableIdx: 3, dateOffset: 3, time: '18:00', partySize: 4, customerIdx: 1, status: 'confirmed', request: null },
    { tableIdx: 6, dateOffset: -1, time: '19:00', partySize: 8, customerIdx: 2, status: 'completed', request: 'Office party' },
    { tableIdx: 0, dateOffset: -2, time: '20:00', partySize: 2, customerIdx: 0, status: 'cancelled', request: null },
    { tableIdx: 2, dateOffset: 5, time: '13:00', partySize: 4, customerIdx: 3, status: 'confirmed', request: 'Lunch meeting' },
    { tableIdx: 7, dateOffset: 7, time: '19:00', partySize: 10, customerIdx: 0, status: 'confirmed', request: 'Large group — need quiet area' },
    { tableIdx: 4, dateOffset: -3, time: '18:30', partySize: 5, customerIdx: 1, status: 'no_show', request: null },
    { tableIdx: 1, dateOffset: 4, time: '20:30', partySize: 2, customerIdx: 2, status: 'confirmed', request: 'Date night' },
  ]

  for (const r of reservationDefs) {
    const table = allTables[r.tableIdx]
    const customer = customers[r.customerIdx]
    await Reservation.create({
      userId: customer._id,
      tableId: table._id,
      restaurantId: table.restaurantId,
      date: fmtDate(r.dateOffset),
      time: r.time,
      partySize: r.partySize,
      durationMinutes: 90,
      status: r.status,
      specialRequest: r.request,
      guestName: customer.name,
    })
  }

  console.log('\n=== Seed complete ===')
  console.log(`Restaurants: ${RESTAURANTS.length}`)
  console.log(`Tables: ${allTables.length}`)
  console.log(`Users: ${users.length} (2 admin, 4 customer)`)
  console.log(`Reservations: ${reservationDefs.length}`)
  console.log('\n--- Login credentials ---')
  console.log('Admin:  admin@saveur.com / admin123')
  console.log('Admin:  jane@saveur.com / jane123')
  console.log('Customer: john@example.com / john123')
  console.log('Customer: alice@example.com / alice123')
  console.log('Customer: bob@example.com / bob123')
  console.log('Customer: carol@example.com / carol123')

  await mongoose.connection.close()
}

seed().catch((err) => {
  console.error('Seed failed:', err.message)
  process.exit(1)
})
