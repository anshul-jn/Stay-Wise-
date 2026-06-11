import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchBookings, cancelBooking } from '../redux/bookingSlice.js';

export const BookingsDashboard = () => {
  const dispatch = useDispatch();
  const { list, loading, error } = useSelector((state) => state.bookings);

  useEffect(() => {
    dispatch(fetchBookings());
  }, [dispatch]);

  const handleCancelBooking = (bookingId) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      dispatch(cancelBooking(bookingId));
    }
  };

  return (
    <div className="min-h-screen bg-surface pt-32 pb-16">
      <main className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop flex flex-col gap-6">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary font-bold">My Reservations</h1>
          <p className="font-body-md text-body-md text-slate-500 mt-1">
            Track and manage your upcoming and past stay reservations.
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {list?.length > 0 ? (
              list.map((booking) => (
                <div 
                  key={booking._id} 
                  className="bg-white border border-outline-variant/30 rounded-xl overflow-hidden shadow-[0px_4px_12px_rgba(0,59,149,0.08)] flex flex-col sm:flex-row items-center justify-between"
                >
                  {/* Left Column: Image & Details */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-6 w-full">
                    <div className="w-full sm:w-[160px] h-[100px] rounded-lg overflow-hidden shrink-0">
                      <img 
                        src={booking.hotelId?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'} 
                        alt={booking.hotelId?.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-grow flex flex-col gap-1 w-full text-center sm:text-left">
                      <h3 className="font-semibold text-primary text-lg">{booking.hotelId?.name}</h3>
                      <p className="text-slate-500 text-sm flex items-center justify-center sm:justify-start gap-1">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {booking.hotelId?.location}
                      </p>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-on-surface-variant mt-2 font-medium">
                        <span>Check-in: <strong>{new Date(booking.checkIn).toLocaleDateString()}</strong></span>
                        <span>Check-out: <strong>{new Date(booking.checkOut).toLocaleDateString()}</strong></span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Status & Price */}
                  <div className="flex sm:flex-col items-center justify-between sm:items-end gap-4 p-6 border-t sm:border-t-0 sm:border-l border-outline-variant/10 w-full sm:w-auto shrink-0 bg-surface-container-lowest">
                    <div className="text-right">
                      <span className="text-slate-500 text-xs block">Amount paid</span>
                      <strong className="text-primary text-xl font-bold">${booking.totalAmount}</strong>
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end gap-2">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                        booking.bookingStatus === 'confirmed' 
                          ? 'bg-teal-vibrant/10 text-teal-vibrant' 
                          : 'bg-error/10 text-error'
                      }`}>
                        {booking.bookingStatus}
                      </span>
                      
                      {booking.bookingStatus === 'confirmed' && (
                        <button 
                          onClick={() => handleCancelBooking(booking._id)}
                          className="text-xs text-error hover:underline font-semibold"
                        >
                          Cancel Booking
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl border border-outline-variant/30 p-12 text-center text-slate-500 shadow-sm">
                <span className="material-symbols-outlined text-5xl text-outline mb-4">book_online</span>
                <h3 className="font-semibold text-lg text-primary mb-2">No Bookings Yet</h3>
                <p className="max-w-md mx-auto mb-6">
                  You haven't made any hotel reservations yet. Head back to the search page to discover and book your perfect stay.
                </p>
                <Link to="/" className="bg-teal-vibrant text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-teal-vibrant/90">
                  Search Hotels
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
export default BookingsDashboard;
