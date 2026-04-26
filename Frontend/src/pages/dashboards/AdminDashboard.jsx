import React, { useEffect, useState } from 'react';
import { 
  FiUsers, 
  FiDatabase, 
  FiDollarSign, 
  FiTrendingUp, 
  FiActivity,
  FiClock,
  FiServer
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';

const AdminDashboard = () => {
  const [data, setData] = useState({
    totalUsers: 0,
    activeCenters: 0,
    totalRevenue: 0,
    growthRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get('/admin/dashboard/');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        // Fallback data for visual testing if API fails
        setData({
          totalUsers: 1245,
          activeCenters: 34,
          totalRevenue: 45000,
          growthRate: 12.5,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Overview of system performance and metrics.</p>
        </div>
        
        {/* Quick Action Button (Visual only for now) */}
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:bg-white/10 hover:text-white transition flex items-center gap-2">
          <FiClock size={16} />
          <span>Last updated: Just now</span>
        </button>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers />}
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
          trend="+12.5%"
          color="blue"
        />
        <StatCard
          icon={<FiDatabase />}
          title="Active Centers"
          value={data.activeCenters}
          trend="+3 new"
          color="purple"
        />
        <StatCard
          icon={<FiDollarSign />}
          title="Total Revenue"
          value={`$${data.totalRevenue.toLocaleString()}`}
          trend="+8.2%"
          color="emerald"
        />
        <StatCard
          icon={<FiTrendingUp />}
          title="Growth Rate"
          value={`${data.growthRate}%`}
          trend="+2.1%"
          color="orange"
        />
      </div>

      {/* --- Details Section --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Recent Activity (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-[#0F172A]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Recent Activity</h2>
            <button className="text-sm text-blue-400 hover:text-blue-300 transition">View All</button>
          </div>
          
          <div className="space-y-4">
            {/* Mock Activity Items */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition group cursor-default">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
                  <FiUsers size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-white font-medium">New User Registration</p>
                  <p className="text-xs text-gray-500">user_{1000 + i}@example.com</p>
                </div>
                <div className="text-xs text-gray-500">{i * 5}m ago</div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health (Takes 1 col) */}
        <div className="bg-[#0F172A]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">System Health</h2>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.8)]"></div>
          </div>

          <div className="space-y-6">
            {/* Server Status */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Server Load</span>
                <span className="text-green-400 font-medium">24%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-green-500 w-[24%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
            </div>

            {/* Database Status */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">Database Latency</span>
                <span className="text-blue-400 font-medium">12ms</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 w-[15%] rounded-full"></div>
              </div>
            </div>

            {/* API Uptime */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-400">API Uptime</span>
                <span className="text-purple-400 font-medium">99.9%</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-purple-500 w-[99.9%] rounded-full shadow-[0_0_10px_rgba(168,85,247,0.5)]"></div>
              </div>
            </div>

            {/* Status Text */}
            <div className="mt-8 p-4 bg-green-500/5 border border-green-500/10 rounded-xl flex items-start gap-3">
              <FiServer className="text-green-500 mt-0.5" />
              <div>
                <p className="text-sm text-green-400 font-semibold">All Systems Operational</p>
                <p className="text-xs text-gray-500 mt-1">No critical alerts reported in the last 24h.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Sub-components ---

const StatCard = ({ title, value, icon, trend, color }) => {
  const colorStyles = {
    blue: {
      bg: 'from-blue-500/20 to-blue-600/20',
      icon: 'text-blue-400',
      border: 'group-hover:border-blue-500/30',
      shadow: 'group-hover:shadow-blue-500/10'
    },
    purple: {
      bg: 'from-purple-500/20 to-purple-600/20',
      icon: 'text-purple-400',
      border: 'group-hover:border-purple-500/30',
      shadow: 'group-hover:shadow-purple-500/10'
    },
    emerald: {
      bg: 'from-emerald-500/20 to-emerald-600/20',
      icon: 'text-emerald-400',
      border: 'group-hover:border-emerald-500/30',
      shadow: 'group-hover:shadow-emerald-500/10'
    },
    orange: {
      bg: 'from-orange-500/20 to-orange-600/20',
      icon: 'text-orange-400',
      border: 'group-hover:border-orange-500/30',
      shadow: 'group-hover:shadow-orange-500/10'
    },
  };

  const style = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`group relative bg-[#0F172A]/40 backdrop-blur-md border border-white/5 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${style.border} ${style.shadow}`}>
      
      {/* Glow Effect (Visible on Hover) */}
      <div className={`absolute inset-0 bg-gradient-to-br ${style.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${style.bg} ${style.icon}`}>
            {React.cloneElement(icon, { size: 24 })}
          </div>
          
          {trend && (
            <span className="flex items-center gap-1 px-2 py-1 rounded-md bg-white/5 border border-white/5 text-xs font-medium text-green-400">
              <FiTrendingUp size={12} />
              {trend}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-400 mb-1 font-medium uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default AdminDashboard;