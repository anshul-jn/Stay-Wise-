import express from 'express';
import { createOrder, verifySignature, getPaymentStatus } from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/create-order', protect, createOrder);
router.post('/verify', protect, verifySignature);
router.get('/status/:bookingId', protect, getPaymentStatus);

export default router;
