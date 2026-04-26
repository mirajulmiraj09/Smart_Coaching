import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { FiMail, FiUser, FiLock, FiPhone, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student',
    password: '',
    confirm_password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (formData.password !== formData.confirm_password) {
  //     toast.error('Passwords do not match.');
  //     return;
  //   }
  //   if (formData.password.length < 8) {
  //     toast.error('Password must be at least 8 characters.');
  //     return;
  //   }

  //   setLoading(true);
  //   try {
  //     await register(formData);
  //     toast.success('Registration successful! Check your email for the OTP.');
  //     navigate('/verify-otp', { state: { email: formData.email } });
  //   } catch (error) {
  //     const data = error.response?.data?.data || error.response?.data || {};
  //     const errorMessage =
  //       data.detail ||
  //       data.non_field_errors?.[0] ||
  //       data.password?.[0] ||
  //       data.email?.[0] ||
  //       data.role?.[0] ||
  //       Object.values(data).flat().join(' · ') ||
  //       error.message ||
  //       'Registration failed. Please try again.';

  //     console.error('Register error:', errorMessage);
  //     toast.error(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      // 1. Call the register function
      const response = await register(formData);
      
      // --- TEST MODE BYPASS START ---
      // This logic captures the OTP we added to the backend response
      // TO BE REMOVED IN PRODUCTION
      const testOtp = response?.data?.test_otp_alert; 
      if (testOtp) {
        alert(`🧪 TEST MODE: Your OTP is ${testOtp}\n(Email verification is bypassed, but you can use this code to test the OTP screen.)`);
      }
      // --- TEST MODE BYPASS END ---

      toast.success('Registration successful! (Bypass Active)');
      
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      const data = error.response?.data?.data || error.response?.data || {};
      const errorMessage =
        data.detail ||
        data.non_field_errors?.[0] ||
        data.password?.[0] ||
        data.email?.[0] ||
        data.role?.[0] ||
        Object.values(data).flat().join(' · ') ||
        error.message ||
        'Registration failed. Please try again.';

      console.error('Register error:', errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (formData) => {
    try {
        const response = await axios.post('/api/v1/auth/register', formData);
        
        // This catches the 'test_otp_alert' we added to the backend response
        if (response.data.data.test_otp_alert) {
            alert(`🧪 TEST OTP: ${response.data.data.test_otp_alert}`);
        }

        console.log("Registered successfully!");
    } catch (err) {
        console.error(err);
    }
}

  const passwordMismatch =
    formData.confirm_password.length > 0 &&
    formData.password !== formData.confirm_password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] text-white relative overflow-hidden font-sans selection:bg-purple-500 selection:text-white">
      
      {/* --- Background Effects --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Ambient Orbs (Purple/Blue Theme) */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] pointer-events-none"></div>

      {/* --- Register Card --- */}
      <div className="relative w-full max-w-lg p-1 animate-fade-in-up">
        {/* Gradient Border Glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-blue-500 to-indigo-500 rounded-2xl blur opacity-25"></div>
        
        <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-8 md:p-10 overflow-hidden">
          {/* Decorative Top Line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

          {/* Header */}
          <div className="text-center mb-10">
            <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-3 hover:rotate-6 transition-transform duration-300">
              <FiUser className="text-white text-2xl" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join the next generation of coaching management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Name & Email Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-purple-400 transition-colors">
                  Full Name
                </label>
                <div className="relative">
                  <FiUser className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-purple-400 transition-colors" size={18} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 text-sm"
                  />
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-blue-400 transition-colors">
                  Email
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Phone */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-indigo-400 transition-colors">
                Phone <span className="text-gray-600 font-normal lowercase">(optional)</span>
              </label>
              <div className="relative">
                <FiPhone className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-indigo-400 transition-colors" size={18} />
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 234 567 890"
                  className="w-full pl-10 pr-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all duration-300 text-sm"
                />
              </div>
            </div>

            {/* Role Selector */}
            <div className="group">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                I am a...
              </label>
              <div className="relative">
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all duration-300 appearance-none cursor-pointer text-sm"
                >
                  <option value="student" className="bg-slate-900">Student</option>
                  <option value="teacher" className="bg-slate-900">Teacher</option>
                </select>
                {/* Custom Arrow Icon */}
                <div className="absolute right-4 top-3.5 pointer-events-none text-gray-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            {/* Passwords Group */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-pink-400 transition-colors">
                  Password
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-3 bg-[#0B1120]/50 border border-white/10 rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500 transition-all duration-300 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
              </div>

              <div className="group">
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 group-focus-within:text-pink-400 transition-colors">
                  Confirm
                </label>
                <div className="relative">
                  <FiLock className="absolute left-3.5 top-3.5 text-gray-500 group-focus-within:text-pink-400 transition-colors" size={18} />
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm_password"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    required
                    minLength={8}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-3 bg-[#0B1120]/50 border rounded-xl text-white placeholder-gray-600 focus:outline-none focus:ring-2 transition-all duration-300 text-sm ${
                      passwordMismatch
                        ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500'
                        : 'border-white/10 focus:ring-pink-500/50 focus:border-pink-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3.5 top-3.5 text-gray-500 hover:text-white transition-colors"
                  >
                    {showConfirm ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                  </button>
                </div>
                {passwordMismatch && (
                  <p className="text-[10px] text-red-400 mt-1 ml-1 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    Passwords don't match
                  </p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || passwordMismatch}
              className="w-full relative group py-3.5 px-4 rounded-xl font-semibold text-white shadow-lg overflow-hidden transition-all duration-300 hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 transition-all duration-300 group-hover:from-purple-500 group-hover:to-blue-500"></div>
              <div className="absolute inset-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
              <span className="relative flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Helper Links */}
          <div className="mt-8 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-white font-semibold hover:text-purple-400 transition-colors">
              Login here
            </Link>
          </div>
          
          <div className="mt-4 text-center">
             <Link to="/" className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-400 transition-colors">
              <span>←</span> Back to Home
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

export default RegisterPage;