import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../stores/authStore';
import { FiMail, FiUser, FiLock, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ── client-side guard ──────────────────────────────────────────────────
    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match.');
      return;
    }
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    // ──────────────────────────────────────────────────────────────────────

    setLoading(true);
    try {
      // Send all fields; backend picks what it needs
      await register(formData);

      toast.success('Registration successful! Check your email for the OTP.');

      // ✅ Must go to verify-otp — backend sets is_active=False until OTP confirmed
      //    Pass email so VerifyOTPPage can pre-fill it
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      // Backend wraps errors as: { success, message, data: { field: [...] } }
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

  // Live password-match indicator
  const passwordMismatch =
    formData.confirm_password.length > 0 &&
    formData.password !== formData.confirm_password;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden py-12">
      {/* Animated blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="w-full max-w-md p-8 bg-slate-800 bg-opacity-50 backdrop-blur-md rounded-2xl shadow-2xl border border-blue-500 border-opacity-30 relative z-10">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <FiUser className="text-white text-2xl" />
          </div>
          <h1 className="text-3xl font-bold text-white">Get Started</h1>
          <p className="text-gray-300 mt-2">Create your Smart Coaching account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
                className="w-full pl-12 pr-4 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full pl-12 pr-4 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Phone (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Phone Number <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <div className="relative">
              <FiPhone className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 1XXX-XXXXXX"
                className="w-full pl-12 pr-4 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
          </div>

          {/* Role
              ✅ PUBLIC_ALLOWED_ROLES = { STUDENT, TEACHER } only
              coaching_staff / coaching_manager / coaching_admin → internal creation only */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Register as</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            >
              <option value="student" className="bg-slate-800">Student</option>
              <option value="teacher" className="bg-slate-800">Teacher</option>
            </select>
            <p className="text-xs text-gray-400 mt-1">
              For Coaching Staff / Admin access, contact your administrator.
            </p>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full pl-12 pr-12 py-3 bg-slate-700 bg-opacity-50 border border-blue-400 border-opacity-30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-200 transition"
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
          </div>

          {/* Confirm Password ✅ maps to confirm_password in RegisterSerializer */}
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">Confirm Password</label>
            <div className="relative">
              <FiLock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                required
                minLength={8}
                placeholder="Re-enter your password"
                className={`w-full pl-12 pr-12 py-3 bg-slate-700 bg-opacity-50 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ${
                  passwordMismatch ? 'border-red-500 border-opacity-80' : 'border-blue-400 border-opacity-30'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-200 transition"
              >
                {showConfirm ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            </div>
            {passwordMismatch && (
              <p className="text-xs text-red-400 mt-1">Passwords do not match.</p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || passwordMismatch}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-700 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-800 transition shadow-lg disabled:opacity-50 mt-2"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Creating account...</span>
              </span>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition">
            Login here
          </Link>
        </p>
        <div className="mt-4 text-center">
          <Link to="/" className="text-sm text-gray-400 hover:text-gray-300 transition">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;