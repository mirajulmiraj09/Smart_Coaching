import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiLogOut, FiUser, FiCpu } from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';

const Header = ({ onMenuToggle }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setDropdownOpen(false);
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Helper to get initials if no image
  const getInitials = (name) => {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <header className="fixed top-0 w-full z-40 bg-[#030712]/70 backdrop-blur-lg border-b border-white/5 transition-all duration-300">
      <div className="flex items-center justify-between px-6 py-4 max-w-[100%]">
        
        {/* Mobile Menu Toggle */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden text-gray-300 hover:text-white transition-colors p-2 -ml-2"
        >
          <FiMenu size={24} />
        </button>

        {/* Logo Section */}
        <div className="flex items-center flex-1 lg:flex-none lg:ml-0 ml-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiCpu className="text-white text-sm" />
            </div>
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Smart Coaching
            </h1>
          </div>
        </div>

        {/* User Profile Area */}
        <div className="flex items-center space-x-4 md:space-x-6">
          
          {/* User Info (Hidden on very small screens for space) */}
          <div className="hidden sm:block text-right">
            <p className="text-sm font-semibold text-white leading-tight">{user?.name || 'User'}</p>
            <p className="text-xs text-blue-400 uppercase tracking-wider font-medium">
              {user?.role_name?.replace('_', ' ') || 'Member'}
            </p>
          </div>

          {/* Avatar & Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation(); // Prevent closing immediately
                setDropdownOpen(!dropdownOpen);
              }}
              className="w-10 h-10 sm:w-10 sm:h-10 rounded-full bg-[#1e293b] border border-white/10 flex items-center justify-center hover:border-blue-500/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-blue-400">
                  {getInitials(user?.name)}
                </span>
              )}
            </button>

            {/* Dropdown Menu */}
            <div
              className={`absolute right-0 mt-3 w-56 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 transform origin-top-right transition-all duration-200 z-50 ${
                dropdownOpen
                  ? 'opacity-100 scale-100 visible translate-y-0'
                  : 'opacity-0 scale-95 invisible -translate-y-2'
              }`}
            >
              <button
                onClick={() => {
                  navigate('/dashboard/profile');
                  setDropdownOpen(false);
                }}
                className="w-full flex items-center px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mr-3 group-hover:bg-blue-500/20 group-hover:text-blue-400 transition-colors">
                  <FiUser size={16} />
                </div>
                <span className="font-medium">My Profile</span>
              </button>
              
              <div className="h-px bg-white/5 my-1"></div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-red-500/5 flex items-center justify-center mr-3 group-hover:bg-red-500/20 transition-colors">
                  <FiLogOut size={16} />
                </div>
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;