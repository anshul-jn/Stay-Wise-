import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice.js';
import hotelReducer from './hotelSlice.js';
import bookingReducer from './bookingSlice.js';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    hotels: hotelReducer,
    bookings: bookingReducer
  }
});
export default store;
