import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { connectDB } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import tableRoutes from './routes/tableRoutes.js'
import reservationRoutes from './routes/reservationRoutes.js'

const app = express()

app.use(cors({
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
}))
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

app.use('/api/auth', authRoutes)
app.use('/api/tables', tableRoutes)
app.use('/api/reservations', reservationRoutes)

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
})

const PORT = process.env.PORT || 5000

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`)
  })
}).catch((err) => {
  console.error('Failed to start server:', err.message)
  process.exit(1)
})
