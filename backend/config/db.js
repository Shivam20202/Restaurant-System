import 'dotenv/config'
import mongoose from 'mongoose'

const uri = process.env.MONGODB_URI

if (!uri) {
  console.error('MONGODB_URI is not set. Copy .env.example to .env and add your Atlas connection string.')
  process.exit(1)
}

export async function connectDB() {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 10000,
  })
  console.log('Connected to MongoDB Atlas')
  return mongoose.connection
}

export { mongoose }
