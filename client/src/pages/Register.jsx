import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser, clearError } from '../redux/authSlice.js';

export const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer'); // Default to customer
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error, successMessage } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  // We no longer redirect to dashboard automatically since user needs to verify email.
  // user state is no longer set upon successful registration.

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(registerUser({ name, email, password, role }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] pt-32 pb-16 flex items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.08)] border border-outline-variant/30 p-8">
        <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-2">Create Account</h2>
        <p className="font-body-md text-body-md text-slate-500 text-center mb-8">
          Join StayWise.ai to find and reserve hotels.
        </p>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-teal-vibrant/10 border border-teal-vibrant/20 text-teal-vibrant px-4 py-3 rounded-lg mb-6 text-sm text-center font-semibold">
            {successMessage}
          </div>
        )}

        {!successMessage && (

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="relative">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Full Name</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">person</span>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md"
                placeholder="John Doe"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Email Address</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">mail</span>
              <input 
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">lock</span>
              <input 
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-4 bg-white border border-outline-variant rounded-lg focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all font-body-md text-body-md"
                placeholder="Create password"
              />
            </div>
          </div>

          <div className="relative mb-2">
            <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1 ml-1">I want to register as</label>
            <div className="flex gap-4">
              <label className="flex-1 flex items-center justify-center gap-2 h-14 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
                <input 
                  type="radio" 
                  name="role" 
                  value="customer"
                  checked={role === 'customer'}
                  onChange={() => setRole('customer')}
                  className="text-teal-vibrant focus:ring-teal-vibrant" 
                />
                <span className="font-body-md">Guest</span>
              </label>
              <label className="flex-1 flex items-center justify-center gap-2 h-14 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container-low transition-colors">
                <input 
                  type="radio" 
                  name="role" 
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="text-teal-vibrant focus:ring-teal-vibrant" 
                />
                <span className="font-body-md">Admin</span>
              </label>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full h-14 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>
        )}

        <p className="text-center font-body-md text-body-md text-slate-500 mt-8">
          Already have an account? <Link to="/login" className="text-teal-vibrant hover:underline font-semibold">Login</Link>
        </p>
      </div>
    </div>
  );
};
export default Register;
