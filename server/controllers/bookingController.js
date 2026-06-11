import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import Hotel from '../models/Hotel.js';

export const createBooking = async (req, res) => {
  const { hotelId, roomId, checkIn, checkOut, guests, guestDetails, totalAmount, paymentMethod } = req.body;

  try {
    // Check if room availability
    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }

    if (!room.availability) {
      return res.status(400).json({ success: false, message: 'Room is not available for booking' });
    }

    // Create reservation
    const booking = await Booking.create({
      userId: req.user._id,
      hotelId,
      roomId,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      guests: guests || 1,
      guestDetails,
      totalAmount,
      bookingStatus: 'confirmed', // Confirmed automatically since we capture mock transaction
      paymentStatus: 'paid',
      paymentMethod: paymentMethod || 'UNKNOWN'
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookings = async (req, res) => {
  try {
    let filter = {};

    // Customers can only see their own bookings; admins see all
    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }

    const bookings = await Booking.find(filter)
      .populate('hotelId', 'name location images')
      .populate('roomId', 'roomType price')
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: bookings.length, data: bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('hotelId', 'name location description images rating amenities')
      .populate('roomId', 'roomType price capacity')
      .populate('userId', 'name email');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this booking' });
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateBooking = async (req, res) => {
  const { bookingStatus, paymentStatus } = req.body;
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();
    res.json({ success: true, data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Auth check: Admin or the customer who booked it
    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to cancel this booking' });
    }

    booking.bookingStatus = 'cancelled';
    await booking.save();

    res.json({ success: true, message: 'Booking cancelled successfully', data: booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
