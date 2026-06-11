import express from 'express';
import { register, login, logout, getProfile, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.get('/verify-email/:token', verifyEmail);

export default router;
