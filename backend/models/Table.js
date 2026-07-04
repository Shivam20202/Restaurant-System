import { Schema, model } from 'mongoose'

const tableSchema = new Schema({
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  seats: {
    type: Number,
    required: true,
    min: 1,
  },
  location: {
    type: String,
    required: true,
    default: 'Main Hall',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true })

export const Table = model('Table', tableSchema)
