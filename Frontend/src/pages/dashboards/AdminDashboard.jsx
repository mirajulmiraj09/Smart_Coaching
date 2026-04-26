// import React, { useEffect, useState } from 'react';
// import { FiUsers, FiBookOpen, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
// import api from '../../services/api';
// import Loading from '../../components/Loading';

// const AdminDashboard = () => {
//   const [data, setData] = useState({
//     totalUsers: 0,
//     activeCenters: 0,
//     totalRevenue: 0,
//     growthRate: 0,
//   });
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         // Fetch admin dashboard data
//         const response = await api.get('/admin/dashboard/');
//         setData(response.data.data);
//       } catch (error) {
//         console.error('Failed to fetch dashboard data:', error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, []);

//   if (loading) return <Loading />;

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>

//       {/* Stats Grid */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
//         <StatCard
//           icon={<FiUsers className="w-8 h-8" />}
//           title="Total Users"
//           value={data.totalUsers}
//           color="blue"
//         />
//         <StatCard
//           icon={<FiBookOpen className="w-8 h-8" />}
//           title="Active Centers"
//           value={data.activeCenters}
//           color="purple"
//         />
//         <StatCard
//           icon={<FiDollarSign className="w-8 h-8" />}
//           title="Total Revenue"
//           value={`$${data.totalRevenue}`}
//           color="green"
//         />
//         <StatCard
//           icon={<FiTrendingUp className="w-8 h-8" />}
//           title="Growth Rate"
//           value={`${data.growthRate}%`}
//           color="orange"
//         />
//       </div>

//       {/* System Overview */}
//       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//         <div className="card">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Users</h2>
//           <div className="text-gray-600">No recent users</div>
//         </div>

//         <div className="card">
//           <h2 className="text-xl font-bold text-gray-800 mb-4">System Health</h2>
//           <div className="text-gray-600">All systems operational</div>
//         </div>
//       </div>
//     </div>
//   );
// };

// const StatCard = ({ icon, title, value, color }) => {
//   const colorClasses = {
//     blue: 'bg-blue-50 text-blue-600',
//     purple: 'bg-purple-50 text-purple-600',
//     green: 'bg-green-50 text-green-600',
//     orange: 'bg-orange-50 text-orange-600',
//   };

//   return (
//     <div className={`card ${colorClasses[color] || colorClasses.blue}`}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-3xl font-bold mt-2">{value}</p>
//         </div>
//         <div className="text-4xl opacity-20">{icon}</div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;
