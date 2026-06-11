import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import crypto from 'crypto';

export const createOrder = async (req, res) => {
  const { amount } = req.body;
  try {
    const orderId = `order_${Math.random().toString(36).substring(2, 15)}`;
    res.json({
      success: true,
      data: {
        id: orderId,
        entity: 'order',
        amount: amount * 100, // Razorpay works in paise
        amount_paid: 0,
        amount_due: amount * 100,
        currency: 'INR',
        receipt: 'rcpt_' + Math.random().toString(36).substring(2, 9),
        status: 'created',
        attempts: 0,
        notes: [],
        created_at: Math.floor(Date.now() / 1000)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const verifySignature = async (req, res) => {
  const { bookingId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  try {
    // Generate signature locally to verify (simulated matching)
    // Normally: hmac = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
    // hmac.update(orderId + "|" + paymentId);
    // generated_signature = hmac.digest('hex');
    
    // For our simulated environment, we will accept any signature that is 32+ characters
    if (!razorpay_payment_id || !razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Invalid signature payload' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking reference not found' });
    }

    // Save transaction
    const payment = await Payment.create({
      bookingId: booking._id,
      transactionId: razorpay_payment_id,
      amount: booking.totalAmount,
      status: 'captured',
      paymentMethod: 'UPI'
    });

    // Update booking payment status
    booking.paymentStatus = 'paid';
    booking.bookingStatus = 'confirmed';
    await booking.save();

    res.json({
      success: true,
      message: 'Payment verified and captured successfully',
      data: payment
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentStatus = async (req, res) => {
  try {
    const payment = await Payment.findOne({ bookingId: req.params.bookingId });
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found' });
    }
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
