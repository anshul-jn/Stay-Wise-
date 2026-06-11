import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { fetchHotelDetails } from '../redux/hotelSlice.js';
import { createBooking } from '../redux/bookingSlice.js';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const BookingCheckout = () => {
  const { hotelId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const queryParams = new URLSearchParams(location.search);
  const roomId = queryParams.get('roomId');

  const { details } = useSelector((state) => state.hotels);
  const { user } = useSelector((state) => state.auth);

  // Form states
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestEmail, setGuestEmail] = useState(user?.email || '');
  const [guestPhone, setGuestPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Payment modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [simulatedOrderId, setSimulatedOrderId] = useState('');

  // Selected room details
  const selectedRoom = details?.rooms?.find(r => r._id === roomId);

  useEffect(() => {
    if (!details || details._id !== hotelId) {
      dispatch(fetchHotelDetails(hotelId));
    }
  }, [dispatch, hotelId, details]);

  if (!details || !selectedRoom) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
      </div>
    );
  }

  // Cost calculations
  const roomCost = selectedRoom.price;
  const taxes = Math.round(roomCost * 0.12);
  const serviceCharge = 15;
  const totalAmount = roomCost + taxes + serviceCharge;

  const handleProceedToPay = async (e) => {
    e.preventDefault();
    setPaymentLoading(true);
    
    try {
      // 1. Create order on backend
      const response = await axios.post(`${BASE_API_URL}/api/payment/create-order`, {
        amount: totalAmount
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.data.success) {
        setSimulatedOrderId(response.data.data.id);
        setShowPaymentModal(true);
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        alert('Your session has expired or the database restarted. Please log in again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      } else {
        alert('Failed to initiate payment. Please try again.');
      }
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleSimulatePaymentSuccess = async () => {
    setPaymentLoading(true);
    try {
      // 1. Create Booking First
      const bookingResponse = await axios.post(`${BASE_API_URL}/api/bookings`, {
        hotelId,
        roomId,
        checkIn: new Date(),
        checkOut: new Date(Date.now() + 86400000), // Default 1 night
        guests: 1,
        guestDetails: {
          name: guestName,
          email: guestEmail,
          phone: guestPhone,
          billingAddress: billingAddress || undefined,
          specialRequests: specialRequests || undefined
        },
        totalAmount,
        paymentMethod
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      if (bookingResponse.data.success) {
        const booking = bookingResponse.data.data;
        
        // 2. Verify payment on backend
        const verifyResponse = await axios.post(`${BASE_API_URL}/api/payment/verify`, {
          bookingId: booking._id,
          razorpay_order_id: simulatedOrderId,
          razorpay_payment_id: `pay_${Math.random().toString(36).substring(2, 12)}`,
          razorpay_signature: `sig_${Math.random().toString(36).substring(2, 16)}`
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });

        if (verifyResponse.data.success) {
          setShowPaymentModal(false);
          // Redirect to confirmation screen with the booking ID
          navigate(`/booking/confirmation/${booking._id}`);
        }
      }
    } catch (error) {
      alert('Payment simulation failed.');
    } finally {
      setPaymentLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop grid grid-cols-1 lg:grid-cols-12 gap-gutter items-start">
        
        {/* Left Column - Checkout Form */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm">
            <h2 className="font-headline-md text-headline-md text-primary font-bold mb-6">Guest Details</h2>
            
            <form onSubmit={handleProceedToPay} className="flex flex-col gap-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    className="w-full h-12 px-4 border border-outline-variant rounded-lg outline-none focus:border-teal-vibrant"
                    placeholder="Guest name"
                  />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="w-full h-12 px-4 border border-outline-variant rounded-lg outline-none focus:border-teal-vibrant"
                    placeholder="Guest email"
                  />
                </div>
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Phone Number</label>
                <input 
                  type="tel"
                  required
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full h-12 px-4 border border-outline-variant rounded-lg outline-none focus:border-teal-vibrant"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Billing Address (Optional)</label>
                <input 
                  type="text"
                  value={billingAddress}
                  onChange={(e) => setBillingAddress(e.target.value)}
                  className="w-full h-12 px-4 border border-outline-variant rounded-lg outline-none focus:border-teal-vibrant"
                  placeholder="123 Main St, City, Country"
                />
              </div>

              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Special Requests (Optional)</label>
                <textarea 
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  className="w-full h-24 p-4 border border-outline-variant rounded-lg outline-none focus:border-teal-vibrant resize-none"
                  placeholder="Any special requests? (e.g. Early check-in, dietary requirements)"
                />
              </div>

              <button 
                type="submit"
                disabled={paymentLoading}
                className="w-full h-14 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 mt-2"
              >
                {paymentLoading ? 'Initiating Transaction...' : 'Proceed to Pay'}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column - Booking Summary */}
        <div className="lg:col-span-4 bg-white border border-outline-variant/30 rounded-xl p-6 shadow-sm flex flex-col gap-6">
          <h2 className="font-headline-md text-label-md text-primary font-bold text-lg border-b border-outline-variant/10 pb-4">Booking Summary</h2>
          
          <div>
            <h3 className="font-semibold text-primary text-base mb-1">{details.name}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">location_on</span>
              {details.location}
            </p>
          </div>

          <div className="bg-surface-container rounded-lg p-4 border border-outline-variant/20 flex flex-col gap-2">
            <p className="text-sm font-semibold text-primary">{selectedRoom.roomType} Room</p>
            <p className="text-xs text-slate-500">Sleeps up to {selectedRoom.capacity} guests</p>
          </div>

          <div className="flex flex-col gap-3 border-t border-outline-variant/10 pt-4">
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Room Cost (1 night)</span>
              <span>${roomCost}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Taxes (12%)</span>
              <span>${taxes}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant text-sm">
              <span>Service Charge</span>
              <span>${serviceCharge}</span>
            </div>
            <div className="flex justify-between font-bold text-primary text-base border-t border-outline-variant/10 pt-3 mt-1">
              <span>Total Amount</span>
              <span>${totalAmount}</span>
            </div>
          </div>
        </div>
      </main>

      {/* Premium Simulated Razorpay Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-outline-variant/20 animate-fade-in-up">
            {/* Razorpay Brand Header */}
            <div className="bg-[#0b1c30] text-white p-6 flex justify-between items-center">
              <div>
                <p className="text-xs uppercase tracking-wider text-teal-vibrant font-bold">Razorpay checkout</p>
                <h3 className="text-lg font-bold">StayWise.ai Reservation</h3>
              </div>
              <span className="material-symbols-outlined text-4xl text-teal-vibrant">credit_card</span>
            </div>

            <div className="p-6 flex flex-col gap-6">
              <div className="flex justify-between items-center bg-surface-container-low p-4 rounded-xl border border-outline-variant/25">
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Amount to pay</p>
                  <p className="text-2xl font-bold text-[#0b1c30]">${totalAmount}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Order Reference</p>
                  <p className="text-sm font-semibold text-primary">{simulatedOrderId?.substring(0, 12)}...</p>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="flex flex-col gap-3">
                <p className="font-label-md text-label-md text-[#0b1c30] font-bold">Choose Payment Method</p>
                
                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer hover:bg-surface transition-colors ${
                  paymentMethod === 'UPI' ? 'border-teal-vibrant bg-teal-vibrant/5' : 'border-outline-variant/50'
                }`}>
                  <input 
                    type="radio" 
                    name="method"
                    value="UPI"
                    checked={paymentMethod === 'UPI'}
                    onChange={() => setPaymentMethod('UPI')}
                    className="text-teal-vibrant focus:ring-teal-vibrant" 
                  />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">currency_rupee</span>
                    <span className="font-semibold text-sm">UPI (Google Pay, PhonePe)</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer hover:bg-surface transition-colors ${
                  paymentMethod === 'CARD' ? 'border-teal-vibrant bg-teal-vibrant/5' : 'border-outline-variant/50'
                }`}>
                  <input 
                    type="radio" 
                    name="method" 
                    value="CARD"
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="text-teal-vibrant focus:ring-teal-vibrant"
                  />
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">credit_card</span>
                    <span className="font-semibold text-sm">Credit / Debit Card</span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-2">
                <button 
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 h-12 border border-outline-variant text-[#0b1c30] font-label-md text-label-md rounded-xl hover:bg-surface"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSimulatePaymentSuccess}
                  disabled={paymentLoading}
                  className="flex-1 h-12 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white font-label-md text-label-md rounded-xl shadow-md flex items-center justify-center gap-1.5"
                >
                  {paymentLoading ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default BookingCheckout;
