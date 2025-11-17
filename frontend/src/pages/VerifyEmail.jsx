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
    <div className="pt-32 pb-20 min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-lg w-full px-4">
        <h1 className="font-serif-heading text-4xl font-extrabold text-[#2b3349] mb-4 text-center tracking-wider">
          Verify Your Email
        </h1>
        <p className="text-center text-sm text-gray-600 mb-8">
          We've sent a verification code to your email. Enter it below to confirm your account.
        </p>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 border border-red-200 text-base font-sans-body mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 bg-green-50 text-green-700 border border-green-200 text-base font-sans-body mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleVerify} className="space-y-6">
          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-base font-extrabold text-gray-700 mb-2 font-sans-body uppercase tracking-wider">
              Verification Code
            </label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="123456"
              maxLength="10"
              className="w-full border-b border-gray-300 px-4 py-2 text-base font-sans-body focus:border-[#2b3349] outline-none bg-transparent"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            className="w-full border border-[#2b3349] text-[#2b3349] px-8 py-4 text-base uppercase tracking-wider font-sans-body hover:bg-[#2b3349] hover:text-white transition-colors"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center mt-2 text-base text-gray-600 font-sans-body mb-3">Didn't receive the code?</p>
          <button
            onClick={handleResend}
            disabled={resendDisabled || resendLoading}
            className="w-full border border-gray-300 text-gray-800 px-8 py-3 text-base uppercase tracking-wider font-sans-body hover:bg-gray-100 transition-colors disabled:opacity-60"
          >
            {resendLoading ? 'Sending...' : resendDisabled ? `Resend in ${resendTimer}s` : 'Resend Code'}
          </button>
        </div>
      </div>
    </div>
  );
}
