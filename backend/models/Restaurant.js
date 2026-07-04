import { Schema, model } from 'mongoose'

const restaurantSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  cuisine: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
}, { timestamps: true })

export const Restaurant = model('Restaurant', restaurantSchema)
