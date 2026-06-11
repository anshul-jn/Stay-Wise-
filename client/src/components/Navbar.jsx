import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/authSlice.js';

export const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="bg-white/95 backdrop-blur-md shadow-[0px_4px_12px_rgba(0,59,149,0.06)] fixed top-0 w-full z-50 transition-all border-b border-outline-variant/15">
      <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop h-20 w-full max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-headline-md text-headline-md font-bold text-primary hover:opacity-80 transition-opacity">
            StayWise.ai
          </Link>
          
          <div className="hidden md:flex gap-6 h-full items-center">
            <Link 
              to="/" 
              className={`font-body-md text-body-md pb-1 border-b-2 transition-all ${
                isActive('/') 
                  ? 'text-teal-vibrant font-semibold border-teal-vibrant' 
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/search-results" 
              className={`font-body-md text-body-md pb-1 border-b-2 transition-all ${
                isActive('/search-results') 
                  ? 'text-teal-vibrant font-semibold border-teal-vibrant' 
                  : 'text-on-surface-variant border-transparent hover:text-primary'
              }`}
            >
              Hotels
            </Link>
            {user && user.role === 'customer' && (
              <Link 
                to="/my-bookings" 
                className={`font-body-md text-body-md pb-1 border-b-2 transition-all ${
                  isActive('/my-bookings') 
                    ? 'text-teal-vibrant font-semibold border-teal-vibrant' 
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                My Bookings
              </Link>
            )}
            {user && user.role === 'admin' && (
              <Link 
                to="/admin/dashboard" 
                className={`font-body-md text-body-md pb-1 border-b-2 transition-all ${
                  isActive('/admin/dashboard') 
                    ? 'text-teal-vibrant font-semibold border-teal-vibrant' 
                    : 'text-on-surface-variant border-transparent hover:text-primary'
                }`}
              >
                Admin Dashboard
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="font-label-md text-label-md text-on-surface-variant hidden sm:inline">
                Hi, <strong className="text-primary">{user.name}</strong>
              </span>
              <button 
                onClick={handleLogout}
                className="font-label-md text-label-md border border-outline text-on-surface-variant hover:border-error hover:text-error transition-colors px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link 
                to="/login" 
                className="font-label-md text-label-md text-primary hover:text-teal-vibrant transition-colors px-4 py-2"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                className="font-label-md text-label-md bg-teal-vibrant text-white rounded-lg px-6 py-2.5 shadow-[0_4px_14px_0_rgba(0,191,179,0.39)] hover:shadow-[0_6px_20px_rgba(0,191,179,0.23)] hover:-translate-y-0.5 transition-all duration-200"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
