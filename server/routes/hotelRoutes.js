import express from 'express';
import { getHotels, getHotelById, createHotel, updateHotel, deleteHotel } from '../controllers/hotelController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', protect, isAdmin, createHotel);
router.put('/:id', protect, isAdmin, updateHotel);
router.delete('/:id', protect, isAdmin, deleteHotel);

export default router;
