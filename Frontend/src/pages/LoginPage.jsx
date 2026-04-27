import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
// ✅ FIXED: Added FiArrowRight to imports
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn, FiArrowRight } from 'react-icons/fi';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      const data = error.response?.data?.data || error.response?.data || {};

      const errorMessage = String(
        data.detail ||
        data.non_field_errors?.[0] ||
        (data && typeof data === 'object' && Object.keys(data).length
          ? Object.values(data).flat().filter((v) => typeof v === 'string').join(' · ')
          : null) ||
        error.message ||
        'Login failed. Please check your email and password.'
      );

      if (
        errorMessage.toLowerCase().includes('inactive') ||
        errorMessage.toLowerCase().includes('not verified') ||
        errorMessage.toLowerCase().includes('verify')
      ) {
        toast.error('Please verify your email first.');
        navigate('/verify-otp', { state: { email: formData.email } });
        return;
      }

      console.error('Login failed:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- Background Effects --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Ambient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Login Card --- */}
      <div className="relative w-full max-w-lg p-1 animate-fade-in-up">
        {/* Gradient Border */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-2xl blur opacity-25"></div>
        
        <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 overflow-hidden">
          {/* Decorative Top Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 rotate-3 hover:rotate-6 transition-transform duration-300">
              <FiLogIn className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
            <p className="text-gray-400 text-sm">Enter your credentials to access the dashboard</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Input */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiMail className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider group-focus-within:text-blue-400 transition-colors">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <FiLock className="text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-11 pr-12 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full relative group py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-blue-500/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 group-hover:from-blue-500 group-hover:to-indigo-500"></div>
              <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Helper Links */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-500">Didn't get the OTP?</span>
              <Link to="/verify-otp" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Verify Email
              </Link>
            </div>
            
            <div className="w-full h-px bg-white/5"></div>
            
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-white font-semibold hover:text-blue-400 transition-colors">
                Create one now
              </Link>
            </p>
          </div>

          {/* Back Link */}
          <div className="mt-6 text-center">
             <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors">
              <span>←</span> Back to Home
            </Link>
          </div>
        </div>
      </div>
      
      {/* Standard CSS for Animation (No extra libraries needed) */}
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

export default LoginPage;