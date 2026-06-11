import express from 'express';
import { getRooms, createRoom, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { protect, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getRooms);
router.post('/', protect, isAdmin, createRoom);
router.put('/:id', protect, isAdmin, updateRoom);
router.delete('/:id', protect, isAdmin, deleteRoom);

export default router;
