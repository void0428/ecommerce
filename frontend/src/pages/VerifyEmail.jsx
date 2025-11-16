import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  
  const [email, setEmail] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendDisabled, setResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    } else if (resendTimer === 0 && resendDisabled) {
      setResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [resendTimer, resendDisabled]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !otp) {
      setError('Please enter your email and OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/verify_email/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Email verified successfully! Refreshing your profile...');
        // Refresh auth context to get updated email_verified status
        await checkAuth();
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }

    setResendLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/users/resend_otp/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('OTP resent to your email');
        setResendDisabled(true);
        setResendTimer(20);
      } else if (response.status === 429) {
        setError(data.error || 'Please wait before requesting another OTP');
      } else {
        setError(data.error || 'Failed to resend OTP');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Verify Your Email</h1>
        <p className="text-sm text-gray-600 mb-6">
          We've sent a verification code to your email. Enter it below to confirm your account.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-extrabold text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm font-extrabold text-gray-700 mb-1">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              maxLength="10"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-extrabold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400 text-base"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendDisabled || resendLoading}
            className="w-full bg-gray-200 text-gray-800 font-extrabold py-2 px-4 rounded-lg hover:bg-gray-300 transition disabled:bg-gray-100 disabled:text-gray-400 text-base"
          >
            {resendLoading ? 'Sending...' : resendDisabled ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
