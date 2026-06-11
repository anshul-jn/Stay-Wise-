import express from 'express';
import { createBooking, getBookings, getBookingById, updateBooking, cancelBooking } from '../controllers/bookingController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/', protect, getBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id', protect, isAdmin, updateBooking);
router.delete('/:id', protect, cancelBooking);

export default router;
