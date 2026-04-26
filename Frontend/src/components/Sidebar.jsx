import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  FiHome,
  FiBook,
  FiUsers,
  FiBarChart2,
  FiAward,
  FiFileText,
  FiCpu,
  FiBell,
  FiX,
} from 'react-icons/fi';
import { useAuthStore } from '../stores/authStore';

const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { user } = useAuthStore();

  const isActive = (path) => location.pathname === path;

  const commonMenuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FiHome },
    { path: '/dashboard/centers', label: 'Centers', icon: FiUsers },
    { path: '/dashboard/academics', label: 'Academics', icon: FiBook },
    { path: '/dashboard/exams', label: 'Exams', icon: FiAward },
    { path: '/dashboard/results', label: 'Results', icon: FiBarChart2 },
    { path: '/dashboard/teaching', label: 'Teaching', icon: FiFileText },
    { path: '/dashboard/ai', label: 'AI Engine', icon: FiCpu },
    { path: '/dashboard/notifications', label: 'Notifications', icon: FiBell },
  ];

  const getMenuItems = () => {
    const roleMenuMap = {
      student: commonMenuItems.slice(0, 6),
      teacher: commonMenuItems,
      coaching_admin: commonMenuItems,
      coaching_manager: commonMenuItems,
      coaching_staff: commonMenuItems,
    };
    return roleMenuMap[user?.role_name] || commonMenuItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-dark text-white transition-transform duration-300 z-50 lg:relative lg:z-auto lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 lg:hidden text-white"
        >
          <FiX size={24} />
        </button>

        {/* Logo */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold">Coaching Hub</h2>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-2">
          {menuItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              onClick={onClose}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                isActive(path)
                  ? 'bg-blue-600'
                  : 'hover:bg-gray-700'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
