import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    default: 0.0,
    min: 0,
    max: 5
  },
  amenities: [String],
  images: [String],
  tags: [String], // for recommendation system matching (e.g. "beach", "luxury", "budget", "romantic")
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create text index for search matching
HotelSchema.index({ name: 'text', location: 'text', description: 'text' });

export default mongoose.model('Hotel', HotelSchema);
