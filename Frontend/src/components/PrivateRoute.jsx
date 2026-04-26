import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
// Import the Loading component we designed previously
import Loading from './Loading';

const PrivateRoute = () => {
  const { isAuthenticated, isInitialized } = useAuthStore();

  // 1. Show the Premium Loader while checking auth state
  if (!isInitialized) {
    return <Loading />;
  }

  // 2. If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 3. If authenticated, render the child routes wrapped in the Global Theme
  return (
    <div className="min-h-screen bg-[#030712] text-white font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      
      {/* --- Global Background (Persists across all private pages) --- */}
      {/* Grid Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40"></div>
      </div>

      {/* Ambient Glow for Dashboard Context */}
      <div className="fixed top-0 left-0 w-full h-96 bg-blue-900/5 rounded-b-[100px] blur-3xl pointer-events-none z-0"></div>

      {/* --- Main Content Area --- */}
      <div className="relative z-10 w-full h-full animate-fade-in">
        {/* This is where your Dashboard/Profile pages render */}
        <Outlet />
      </div>

      {/* Fade In Animation */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PrivateRoute;