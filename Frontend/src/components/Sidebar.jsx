import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome, FiBook, FiUsers, FiBarChart2, FiAward,
  FiFileText, FiCpu, FiBell, FiShield, FiX, FiChevronRight
} from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();
  const isActive = (path) => location.pathname === path;

  // ── System Admin (superuser): only sees application management ──────
  const systemAdminItems = [
    { path: '/dashboard',               label: 'Applications',   icon: FiShield },
    { path: '/dashboard/notifications', label: 'Notifications',  icon: FiBell },
  ];

  // ── Coaching roles: full coaching menu ──────────────────────────────
  const coachingAdminItems = [
    { path: '/dashboard',               label: 'Dashboard',      icon: FiHome },
    { path: '/dashboard/centers',       label: 'Centers',        icon: FiUsers },
    { path: '/dashboard/academics',     label: 'Academics',      icon: FiBook },
    { path: '/dashboard/exams',         label: 'Exams',          icon: FiAward },
    { path: '/dashboard/results',       label: 'Results',        icon: FiBarChart2 },
    { path: '/dashboard/teaching',      label: 'Teaching',       icon: FiFileText },
    { path: '/dashboard/ai',            label: 'AI Engine',      icon: FiCpu },
    { path: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  ];

  // ── Teacher ──────────────────────────────────────────────────────────
  const teacherItems = [
    { path: '/dashboard',               label: 'Dashboard',      icon: FiHome },
    { path: '/dashboard/academics',     label: 'Academics',      icon: FiBook },
    { path: '/dashboard/exams',         label: 'Exams',          icon: FiAward },
    { path: '/dashboard/results',       label: 'Results',        icon: FiBarChart2 },
    { path: '/dashboard/teaching',      label: 'Teaching',       icon: FiFileText },
    { path: '/dashboard/ai',            label: 'AI Engine',      icon: FiCpu },
    { path: '/dashboard/notifications', label: 'Notifications',  icon: FiBell },
  ];

  // ── Student ──────────────────────────────────────────────────────────
  const studentItems = [
    { path: '/dashboard',               label: 'Dashboard',      icon: FiHome },
    { path: '/dashboard/academics',     label: 'Academics',      icon: FiBook },
    { path: '/dashboard/exams',         label: 'Exams',          icon: FiAward },
    { path: '/dashboard/results',       label: 'Results',        icon: FiBarChart2 },
    { path: '/dashboard/ai',            label: 'AI Engine',      icon: FiCpu },
    { path: '/dashboard/notifications', label: 'Notifications',  icon: FiBell },
  ];

  const getMenuItems = () => {
    if (user?.is_superuser) return systemAdminItems;
    switch (user?.role_name) {
      case 'coaching_admin':
      case 'coaching_manager':
      case 'coaching_staff':
        return coachingAdminItems;
      case 'teacher':
        return teacherItems;
      case 'student':
        return studentItems;
      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed left-0 top-0 h-full w-72 bg-[#0F172A]/80 backdrop-blur-xl border-r border-white/5 transition-transform duration-300 z-50 lg:relative lg:z-auto lg:translate-x-0 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Close Button */}
        <button 
          onClick={onClose} 
          className="absolute top-5 right-4 lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
        >
          <FiX size={20} />
        </button>

        {/* Header Section */}
        <div className="p-8 pb-4 border-b border-white/5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <FiCpu className="text-white text-sm" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Coaching Hub
            </h2>
          </div>

          {/* Role Badge */}
          {user?.is_superuser ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] font-bold text-yellow-400 uppercase tracking-wider">
              <FiShield size={10} />
              System Admin
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
              {user?.role_name?.replace(/_/g, ' ') || 'Member'}
            </span>
          )}
        </div>

        {/* Navigation Scrollable Area */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1 scrollbar-hide">
          {menuItems.map(({ path, label, icon: Icon }) => {
            const active = isActive(path);
            return (
              <Link
                key={label}
                to={path}
                onClick={onClose}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 relative ${
                  active
                    ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Icon Container */}
                  <div className={`p-1.5 rounded-lg transition-colors ${
                    active 
                      ? 'bg-blue-500/20 text-blue-400' 
                      : 'text-gray-500 group-hover:text-gray-300'
                  }`}>
                    <Icon size={18} />
                  </div>
                  <span className={`font-medium ${active ? 'text-white' : 'text-gray-300'}`}>
                    {label}
                  </span>
                </div>
                
                {/* Active Indicator Arrow */}
                {active && (
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer (Optional aesthetic) */}
        <div className="p-4 border-t border-white/5 text-center">
            <p className="text-[10px] text-gray-600 font-medium">
              v2.4.0 &bull; Secure Environment
            </p>
        </div>
      </aside>

      {/* Custom Scrollbar Styles */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
            width: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar-track {
            background: transparent;
        }
        .scrollbar-hide::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.1);
            border-radius: 20px;
        }
      `}</style>
    </>
  );
};

export default Sidebar;