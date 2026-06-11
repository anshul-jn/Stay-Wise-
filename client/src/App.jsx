import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';

// Pages
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';
import SearchResults from './pages/SearchResults.jsx';
import HotelDetails from './pages/HotelDetails.jsx';
import BookingCheckout from './pages/BookingCheckout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import BookingsDashboard from './pages/BookingsDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AdminLogin from './pages/AdminLogin.jsx';

function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {!isAdminRoute && <Navbar />}
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
          <Route path="/search-results" element={<SearchResults />} />
          <Route path="/hotel/:id" element={<HotelDetails />} />
          <Route path="/booking/:hotelId" element={<BookingCheckout />} />
          <Route path="/booking/confirmation/:bookingId" element={<Confirmation />} />
          <Route path="/my-bookings" element={<BookingsDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/rooms" element={<AdminDashboard />} />
          <Route path="/admin/bookings" element={<AdminDashboard />} />
          <Route path="/admin/revenue" element={<AdminDashboard />} />
          <Route path="/admin/settings" element={<AdminDashboard />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
      {!isAdminRoute && <Footer />}
    </div>
  );
}

export default App;
