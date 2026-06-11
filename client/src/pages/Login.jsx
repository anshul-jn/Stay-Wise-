import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../redux/authSlice.js';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginRole, setLoginRole] = useState('user'); // 'user' or 'admin'
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password, loginRole }));
  };

  return (
    <div className="min-h-[calc(100vh-80px)] pt-32 pb-16 flex items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.08)] border border-outline-variant/30 p-8">
        
        {/* Role Toggle Tabs */}
        <div className="flex border-b border-outline-variant/20 mb-8 bg-surface-container-low p-1 rounded-lg">
          <button
            type="button"
            onClick={() => {
              setLoginRole('user');
              dispatch(clearError());
            }}
            className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all flex justify-center items-center gap-1.5 ${
              loginRole === 'user'
                ? 'bg-white text-primary shadow-sm font-semibold'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            Traveler Login
          </button>
          <button
            type="button"
            onClick={() => {
              setLoginRole('admin');
              dispatch(clearError());
            }}
            className={`flex-1 py-2 text-center rounded-md font-label-md text-label-md transition-all flex justify-center items-center gap-1.5 ${
              loginRole === 'admin'
                ? 'bg-primary text-white shadow-sm font-semibold'
                : 'text-slate-500 hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">admin_panel_settings</span>
            Admin Portal
          </button>
        </div>

        <h2 className="font-headline-lg text-headline-lg text-primary text-center mb-2 font-bold">
          {loginRole === 'user' ? 'Welcome Back' : 'Admin Workspace'}
        </h2>
        <p className="font-body-md text-body-md text-slate-500 text-center mb-8">
          {loginRole === 'user' 
            ? 'Login to manage your bookings and find personalized stays.' 
            : 'Secure administrative access only.'}
        </p>

        {error && (
          <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                placeholder={loginRole === 'user' ? 'you@example.com' : 'anshuljn@gmail.com'}
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
                placeholder="Enter your password"
              />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full h-14 text-white rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-95 duration-200 font-semibold ${
              loginRole === 'user' ? 'bg-teal-vibrant hover:bg-teal-vibrant/90' : 'bg-primary hover:bg-primary/95'
            }`}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>



        {loginRole === 'user' && (
          <p className="text-center font-body-md text-body-md text-slate-500 mt-8">
            Don't have an account? <Link to="/register" className="text-teal-vibrant hover:underline font-semibold">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};
export default Login;
