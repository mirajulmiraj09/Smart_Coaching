import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { FiMail, FiRefreshCw } from 'react-icons/fi';

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

const VerifyOTPPage = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { verifyOTP } = useAuthStore();

  // Email may come from RegisterPage or LoginPage via navigate state
  // If not provided, user can type it manually
  const [email, setEmail]           = useState(location.state?.email || '');
  const [otp, setOtp]               = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [cooldown, setCooldown]     = useState(0);

  const inputRefs = useRef([]);

  // Auto-focus first OTP box on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  // Resend cooldown countdown
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  // ── OTP input handlers ────────────────────────────────────────────────
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const updated = [...otp];

    // Handle paste — spread digits across boxes
    if (value.length > 1) {
      const digits = value.slice(0, OTP_LENGTH - index).split('');
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) updated[index + i] = d;
      });
      setOtp(updated);
      const next = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[next]?.focus();
      return;
    }

    updated[index] = value;
    setOtp(updated);
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const updated = [...otp];
        updated[index] = '';
        setOtp(updated);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
    if (e.key === 'ArrowLeft'  && index > 0)              inputRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const otpString  = otp.join('');
  const isComplete = otpString.length === OTP_LENGTH && !otp.includes('');

  // ── Verify OTP submit ─────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('Please enter your email address.'); return; }
    if (!isComplete) { toast.error('Please enter the complete 6-digit OTP.'); return; }
    if (loading) return;

    setLoading(true);
    try {
      // authStore.verifyOTP → POST /accounts/register/verify-otp/ { email, otp }
      await verifyOTP({ email, otp: otpString });
      toast.success('Email verified! Welcome 🎉');
      navigate('/');   // ✅ Redirect to Home
    } catch (error) {
      const data = error.response?.data?.data || error.response?.data || {};
      const msg =
        data.detail             ||
        data.non_field_errors?.[0] ||
        data.otp?.[0]           ||
        Object.values(data).flat().join(' · ') ||
        error.message           ||
        'Verification failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend OTP ────────────────────────────────────────────────────────
  // NOTE: Add  path("register/resend-otp/", ResendOTPView.as_view())
  //       to your urls.py if you want resend to work.
  const handleResend = async () => {
    if (!email) { toast.error('Please enter your email first.'); return; }
    if (cooldown > 0 || resendLoading) return;

    setResendLoading(true);
    try {
      const { default: api } = await import('../services/api');
      await api.post('/register/resend-otp/', { email });
      toast.success('New OTP sent! Check your email.');
      setCooldown(RESEND_COOLDOWN);
      setOtp(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    } catch (error) {
      const data = error.response?.data?.data || error.response?.data || {};
      toast.error(data.detail || data.email?.[0] || error.message || 'Could not resend OTP.');
    } finally {
      setResendLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden py-12">

      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div
          className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="w-full max-w-md p-8 bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500 border-opacity-30 relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiMail className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white">Verify Your Email</h1>
          <p className="text-gray-300 mt-2">
            {email ? 'We sent a 6-digit code to' : 'Enter your email and the OTP we sent you'}
          </p>
          {email && (
            <p className="text-blue-400 font-semibold mt-1 break-all">{email}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Email input — shown when email was NOT passed via navigate state */}
          {!location.state?.email && (
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-3.5 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-12 pr-4 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>
          )}

          {/* OTP Boxes */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-4 text-center">
              Enter 6-digit OTP
            </label>
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={OTP_LENGTH}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onFocus={(e) => e.target.select()}
                  className={`
                    w-12 h-14 text-center text-2xl font-bold rounded-lg border-2 transition
                    bg-slate-700 bg-opacity-50 text-white
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    ${digit ? 'border-blue-400' : 'border-blue-400 border-opacity-30'}
                  `}
                />
              ))}
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading || !isComplete || !email}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Verifying...</span>
              </span>
            ) : (
              'Verify & Continue'
            )}
          </button>
        </form>

        {/* Resend OTP */}
        <div className="mt-5 text-center">
          {cooldown > 0 ? (
            <p className="text-gray-400 text-sm">
              Resend OTP in{' '}
              <span className="text-blue-400 font-semibold">{cooldown}s</span>
            </p>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resendLoading}
              className="text-sm text-blue-400 hover:text-blue-300 font-semibold transition inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <FiRefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
              {resendLoading ? 'Sending...' : 'Resend OTP'}
            </button>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-gray-300 transition">
            ← Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default VerifyOTPPage;