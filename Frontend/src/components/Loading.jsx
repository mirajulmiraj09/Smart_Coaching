import React from 'react';
import { FiCpu } from 'react-icons/fi';

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#030712] text-white relative overflow-hidden font-sans selection:bg-blue-500 selection:text-white">
      
      {/* --- Background Effects --- */}
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      {/* Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none"></div>

      {/* --- Reactor Loader --- */}
      <div className="relative z-10 flex flex-col items-center">
        
        {/* 1. Outer Slow Ring */}
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 flex items-center justify-center">
          <div className="absolute inset-0 border-2 border-white/5 rounded-full border-t-white/10 animate-[spin_8s_linear_infinite]"></div>
          
          {/* 2. Middle Accent Ring */}
          <div className="absolute inset-4 border-2 border-blue-500/20 rounded-full border-b-blue-500 animate-[spin_4s_linear_infinite_reverse]"></div>
          
          {/* 3. Inner Fast Ring */}
          <div className="absolute inset-8 border-2 border-indigo-500/40 rounded-full border-t-indigo-500 animate-[spin_2s_linear_infinite]"></div>
          
          {/* 4. Core Glow */}
          <div className="absolute inset-10 bg-blue-500 rounded-full blur-xl opacity-20 animate-pulse"></div>
          
          {/* 5. Central Icon */}
          <div className="relative w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.5)] animate-bounce-slow">
            <FiCpu className="text-white text-xl" />
          </div>
        </div>

        {/* Text Loading */}
        <div className="mt-10 flex flex-col items-center space-y-2">
          <h2 className="text-xl font-semibold tracking-wide text-white/90">Initializing System</h2>
          
          {/* Dots Animation */}
          <div className="flex space-x-1 h-4 items-center">
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_ease-in-out]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-[bounce_1.4s_infinite_ease-in-out_0.4s]"></span>
          </div>
        </div>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Loading;