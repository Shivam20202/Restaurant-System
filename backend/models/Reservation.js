import { Schema, model } from 'mongoose'

const reservationSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tableId: {
    type: Schema.Types.ObjectId,
    ref: 'Table',
    required: true,
  },
  restaurantId: {
    type: Schema.Types.ObjectId,
    ref: 'Restaurant',
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  partySize: {
    type: Number,
    required: true,
    min: 1,
  },
  durationMinutes: {
    type: Number,
    default: 90,
  },
  status: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed', 'no_show'],
    default: 'confirmed',
  },
  specialRequest: {
    type: String,
    default: null,
  },
  guestName: {
    type: String,
    default: '',
  },
}, { timestamps: true })

reservationSchema.index({ tableId: 1, date: 1, status: 1 })
reservationSchema.index({ userId: 1, date: -1, time: -1 })

export const Reservation = model('Reservation', reservationSchema)
