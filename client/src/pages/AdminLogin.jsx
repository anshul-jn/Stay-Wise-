import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, clearError } from '../redux/authSlice.js';

export const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
        // Log out or show error if not admin
        dispatch(clearError());
        alert('Access denied. This workspace is restricted to platform administrators.');
      }
    }
  }, [user, navigate, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="min-h-screen w-full bg-background text-on-background font-body-md text-body-md antialiased overflow-hidden flex items-center justify-center p-margin-mobile md:p-margin-desktop relative">
      {/* Ambient background elements */}
      <div 
        className="absolute top-[-10%] left-[-5%] w-96 h-96 bg-primary-fixed rounded-full mix-blend-multiply filter blur-[128px] opacity-60 animate-pulse" 
        style={{ animationDuration: '8s' }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-tertiary-fixed-dim rounded-full mix-blend-multiply filter blur-[128px] opacity-40 animate-pulse" 
        style={{ animationDuration: '10s', animationDelay: '2s' }}
      />

      <main className="w-full max-w-md relative z-10">
        {/* Logo Area */}
        <div className="text-center mb-8">
          <h1 className="font-display-lg text-display-lg text-primary tracking-tight font-bold">
            StayWise<span className="text-teal-vibrant">.ai</span>
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Admin Workspace
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white/85 backdrop-blur-md border border-white/45 rounded-xl shadow-[0px_12px_32px_rgba(0,39,104,0.08)] p-8">
          <div className="mb-8 text-center">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-2 font-bold">
              Welcome back
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Please enter your details to sign in.
            </p>
          </div>

          {error && (
            <div className="bg-error/10 border border-error/20 text-error px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="email">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">mail</span>
                </div>
                <input 
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 h-[56px] bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-slate-500 focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all duration-200" 
                  placeholder="admin@staywise.ai"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-2 font-semibold" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                </div>
                <input 
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-12 h-[56px] bg-white border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder-slate-500 focus:border-teal-vibrant focus:ring-1 focus:ring-teal-vibrant outline-none transition-all duration-200" 
                  placeholder="••••••••"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-500 hover:text-primary transition-colors focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? 'visibility' : 'visibility_off'}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between pt-2 pb-4">
              <div className="flex items-center">
                <input 
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-teal-vibrant focus:ring-teal-vibrant border-outline-variant rounded transition-colors cursor-pointer"
                />
                <label className="ml-2 block font-body-md text-body-md text-on-surface-variant cursor-pointer text-sm" htmlFor="remember-me">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a 
                  href="#" 
                  onClick={(e) => { e.preventDefault(); alert('Reset password function is simulated.'); }}
                  className="font-label-md text-label-md text-primary hover:text-teal-vibrant transition-colors font-semibold"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            {/* Action Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md text-white bg-teal-vibrant hover:bg-teal-vibrant/90 hover:shadow-[0px_4px_12px_rgba(0,191,179,0.3)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-vibrant font-semibold"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          {/* Seeded credentials note */}
          <div className="mt-6 border-t border-outline-variant/30 pt-4 text-center">
            <p className="text-xs text-slate-500 mb-1">
              Secure administrative access only.
            </p>
            <p className="text-xs text-slate-400">
              Demo Admin: <strong>admin@staywise.ai</strong> / <strong>admin123</strong>
            </p>
          </div>
        </div>

        {/* Link back to User Login */}
        <p className="text-center font-body-md text-body-md text-slate-500 mt-6 text-sm">
          Are you a traveler?{' '}
          <Link to="/login" className="text-teal-vibrant hover:underline font-semibold">
            Go to User Login
          </Link>
        </p>
      </main>
    </div>
  );
};

export default AdminLogin;
