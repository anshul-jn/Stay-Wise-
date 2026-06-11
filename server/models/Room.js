import mongoose from 'mongoose';

const RoomSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  roomType: {
    type: String,
    required: true,
    enum: ['Standard', 'Deluxe', 'Suite']
  },
  capacity: {
    type: Number,
    required: true,
    default: 2
  },
  price: {
    type: Number,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Room', RoomSchema);
