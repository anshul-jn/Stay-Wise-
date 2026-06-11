import React, { useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmail, clearError } from '../redux/authSlice.js';

export const VerifyEmail = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const { loading, error, successMessage } = useSelector((state) => state.auth);
  const hasVerified = useRef(false);

  useEffect(() => {
    dispatch(clearError());
    if (token && !hasVerified.current) {
      dispatch(verifyEmail(token));
      hasVerified.current = true;
    }
  }, [dispatch, token]);

  return (
    <div className="min-h-[calc(100vh-80px)] pt-32 pb-16 flex items-center justify-center bg-surface px-margin-mobile">
      <div className="w-full max-w-md bg-white rounded-xl shadow-[0px_4px_12px_rgba(0,59,149,0.08)] border border-outline-variant/30 p-8 text-center">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-6">Email Verification</h2>

        {loading && (
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-vibrant"></div>
            <p className="text-slate-500 font-body-md">Verifying your email...</p>
          </div>
        )}

        {!loading && error && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center text-error mb-2">
              <span className="material-symbols-outlined text-[32px]">error</span>
            </div>
            <p className="text-error font-semibold">{error}</p>
            <p className="text-slate-500 text-sm">The verification link may have expired or is invalid.</p>
            <Link to="/register" className="w-full h-14 bg-primary hover:bg-primary/90 text-white rounded-lg font-label-md text-label-md flex items-center justify-center shadow-md transition-all">
              Back to Registration
            </Link>
          </div>
        )}

        {!loading && successMessage && (
          <div className="flex flex-col items-center space-y-6">
            <div className="w-16 h-16 bg-teal-vibrant/10 rounded-full flex items-center justify-center text-teal-vibrant mb-2">
              <span className="material-symbols-outlined text-[32px]">check_circle</span>
            </div>
            <p className="text-teal-vibrant font-semibold text-lg">{successMessage}</p>
            <Link to="/login" className="w-full h-14 bg-teal-vibrant hover:bg-teal-vibrant/90 text-white rounded-lg font-label-md text-label-md flex items-center justify-center shadow-md transition-all">
              Go to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
export default VerifyEmail;
