import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const BASE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const Confirmation = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await axios.get(`${BASE_API_URL}/api/bookings/${bookingId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        if (response.data.success) {
          setBooking(response.data.data);
        }
      } catch (error) {
        console.error('Failed to load booking details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-surface pt-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-surface pt-32 pb-16 flex flex-col items-center justify-center text-center">
        <span className="material-symbols-outlined text-error text-6xl mb-4">cancel</span>
        <h2 className="text-xl font-bold text-[#0b1c30] mb-2">Booking Not Found</h2>
        <p className="text-slate-500 mb-6 max-w-sm">We couldn't retrieve the details for this reservation request.</p>
        <Link to="/" className="bg-teal-vibrant text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-teal-vibrant/90">
          Return Home
        </Link>
      </div>
    );
  }

  const { guestDetails, hotelId, roomId } = booking;
  const roomCost = roomId?.price || 0;
  const taxes = Math.round(roomCost * 0.12);
  const serviceCharge = 15;

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16 print:bg-white print:pt-0 print:pb-0">
      <main className="max-w-3xl mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-6 print:px-0">
        
        {/* Success Banner (Hidden on Print) */}
        <div className="bg-teal-vibrant/10 border border-teal-vibrant/20 rounded-xl p-4 flex items-center gap-4 print:hidden">
          <div className="w-12 h-12 rounded-full bg-teal-vibrant text-white flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <h2 className="font-bold text-primary text-lg">Booking Confirmed!</h2>
            <p className="text-sm text-slate-600">Your reservation has been successfully processed. A confirmation email has been sent to <strong className="text-primary">{guestDetails?.email}</strong>.</p>
          </div>
        </div>

        {/* Invoice Container */}
        <div className="bg-white border border-outline-variant/30 rounded-2xl p-8 shadow-sm print:border-none print:shadow-none print:p-0">
          
          {/* Invoice Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-outline-variant/20 pb-6 mb-6">
            <div>
              <h1 className="text-3xl font-black text-teal-vibrant tracking-tight mb-1">StayWise<span className="text-primary">.ai</span></h1>
              <p className="text-sm text-slate-500">Premium Hotel Reservations</p>
            </div>
            <div className="mt-4 md:mt-0 text-left md:text-right">
              <h2 className="text-2xl font-bold text-primary uppercase tracking-widest mb-1">Invoice</h2>
              <p className="text-sm text-slate-600"><span className="font-semibold text-primary">Booking ID:</span> {booking._id}</p>
              <p className="text-sm text-slate-600"><span className="font-semibold text-primary">Date of Issue:</span> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Guest Information Section */}
          <div className="mb-8">
            <h3 className="font-bold text-primary text-lg uppercase tracking-wide border-b border-outline-variant/10 pb-2 mb-4">Guest Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Full Name</span>
                <strong className="text-primary text-base">{guestDetails?.name}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Contact Info</span>
                <span className="text-primary block">{guestDetails?.email}</span>
                <span className="text-primary block">{guestDetails?.phone}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Booking Date & Time</span>
                <span className="text-primary">{new Date(booking.createdAt).toLocaleString()}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Number of Guests</span>
                <span className="text-primary">{booking.guests} Adult(s)</span>
              </div>
              
              {/* Payment Details */}
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Payment Method</span>
                <span className="text-primary font-medium">{booking.paymentMethod === 'CARD' ? 'Credit/Debit Card' : booking.paymentMethod}</span>
              </div>
              <div>
                <span className="text-slate-500 block text-xs uppercase font-semibold">Payment Status</span>
                <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold mt-1 ${booking.paymentStatus === 'paid' ? 'bg-teal-vibrant/10 text-teal-vibrant' : 'bg-warning/10 text-warning'}`}>
                  {booking.paymentStatus?.toUpperCase()}
                </span>
              </div>

              {/* Conditional Fields */}
              {guestDetails?.billingAddress && (
                <div className="md:col-span-2">
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Billing Address</span>
                  <span className="text-primary block max-w-md">{guestDetails.billingAddress}</span>
                </div>
              )}
              {guestDetails?.specialRequests && (
                <div className="md:col-span-2">
                  <span className="text-slate-500 block text-xs uppercase font-semibold">Special Requests</span>
                  <span className="text-primary block max-w-md p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 italic mt-1">{guestDetails.specialRequests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Reservation Details */}
          <div className="mb-8">
            <h3 className="font-bold text-primary text-lg uppercase tracking-wide border-b border-outline-variant/10 pb-2 mb-4">Reservation Details</h3>
            
            <div className="bg-surface-container rounded-xl p-5 border border-outline-variant/20">
              <div className="mb-4">
                <h4 className="font-bold text-primary text-lg">{hotelId?.name}</h4>
                <p className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  {hotelId?.location}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-4 border-t border-outline-variant/10">
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Check-in</span>
                  <strong className="text-primary">{new Date(booking.checkIn).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Check-out</span>
                  <strong className="text-primary">{new Date(booking.checkOut).toLocaleDateString()}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Room Type</span>
                  <strong className="text-primary">{roomId?.roomType}</strong>
                </div>
                <div>
                  <span className="text-slate-500 block text-xs uppercase font-semibold mb-1">Duration</span>
                  <strong className="text-primary">
                    {Math.ceil((new Date(booking.checkOut) - new Date(booking.checkIn)) / (1000 * 60 * 60 * 24))} Night(s)
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Breakdown */}
          <div>
            <h3 className="font-bold text-primary text-lg uppercase tracking-wide border-b border-outline-variant/10 pb-2 mb-4">Financial Details</h3>
            
            <div className="w-full md:w-1/2 ml-auto">
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-500">Room Charge (per night)</span>
                <span className="text-primary font-medium">${roomCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-500">Service Fee</span>
                <span className="text-primary font-medium">${serviceCharge.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm py-2">
                <span className="text-slate-500">Taxes (12%)</span>
                <span className="text-primary font-medium">${taxes.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold py-3 border-t-2 border-primary mt-2">
                <span className="text-primary">Total Paid</span>
                <span className="text-teal-vibrant">${booking.totalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          {/* Footer note */}
          <div className="mt-12 pt-6 border-t border-outline-variant/20 text-center text-xs text-slate-400">
            <p>Thank you for choosing StayWise.ai. For support, please contact support@staywise.ai</p>
            <p>This is a computer-generated invoice and requires no signature.</p>
          </div>

        </div>

        {/* Action triggers */}
        <div className="flex gap-4 print:hidden pb-10">
          <button 
            onClick={handlePrint}
            className="flex-1 h-12 border border-outline text-primary font-label-md text-label-md rounded-xl hover:bg-white flex items-center justify-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">print</span>
            Print / Save as PDF
          </button>
          <Link 
            to="/my-bookings"
            className="flex-1 h-12 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white font-label-md text-label-md rounded-xl shadow-md flex items-center justify-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[20px]">book_online</span>
            My Bookings
          </Link>
        </div>
      </main>
    </div>
  );
};
export default Confirmation;
