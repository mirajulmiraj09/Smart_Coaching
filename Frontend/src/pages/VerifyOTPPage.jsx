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

    // Handle paste
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
      await verifyOTP({ email, otp: otpString });
      toast.success('Email verified! Welcome 🎉');
      navigate('/');   
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- Background Effects --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Card Container --- */}
      <div className="relative w-full max-w-lg p-1 animate-fade-in-up">
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl blur opacity-25"></div>
        
        <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-3 hover:rotate-6 transition-transform duration-300">
              <FiMail className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Verify Email</h1>
            <p className="text-gray-400 text-sm">
              {email ? 'Enter the code sent to your email' : 'Enter your email & verification code'}
            </p>
            {email && (
              <p className="text-blue-400 font-medium mt-1 break-all bg-blue-500/5 px-3 py-1 rounded-lg inline-block border border-blue-500/10">
                {email}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Email Input (Conditional) */}
            {!location.state?.email && (
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-4 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className="w-full pl-12 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  />
                </div>
              </div>
            )}

            {/* OTP Boxes */}
            <div>
              <label className="block text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                One-Time Password
              </label>
              <div className="flex justify-center gap-2 sm:gap-3">
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
                      w-10 h-14 sm:w-12 sm:h-16 text-center text-2xl font-bold rounded-xl
                      transition-all duration-200
                      bg-[#0B1120]/50 border border-white/10 text-white
                      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-[#0B1120]
                      ${digit ? 'bg-blue-500/10 border-blue-500/50 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'text-gray-600'}
                    `}
                  />
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !isComplete || !email}
              className="w-full relative group py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-indigo-500"></div>
              <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify & Continue</span>
                )}
              </span>
            </button>
          </form>

          {/* Resend Link */}
          <div className="mt-8 text-center text-sm">
            {cooldown > 0 ? (
              <div className="text-gray-500 flex items-center justify-center gap-2">
                <FiRefreshCw size={14} />
                <span>Resend in <span className="text-blue-400 font-bold">{cooldown}s</span></span>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors disabled:opacity-50"
              >
                <FiRefreshCw size={14} className={resendLoading ? 'animate-spin' : ''} />
                <span className="font-medium">{resendLoading ? 'Sending...' : 'Resend Code'}</span>
              </button>
            )}
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center border-t border-white/5 pt-6">
            <Link to="/login" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-1 group">
              <span className="group-hover:-translate-x-1 transition-transform">←</span>
              <span>Back to Login</span>
            </Link>
          </div>

        </div>
      </div>

      {/* Animation CSS */}
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 20px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default VerifyOTPPage;