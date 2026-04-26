import React, { useEffect, useState } from 'react';
import { FiUsers, FiBook, FiCheckCircle, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';

const TeacherDashboard = () => {
  const [data, setData] = useState({
    totalStudents: 0,
    classesTeaching: 0,
    assignmentsCreated: 0,
    hoursTeaching: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch teacher dashboard data
        const response = await api.get('/teaching/teacher/dashboard/');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Teacher Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiUsers className="w-8 h-8" />}
          title="Total Students"
          value={data.totalStudents}
          color="blue"
        />
        <StatCard
          icon={<FiBook className="w-8 h-8" />}
          title="Classes Teaching"
          value={data.classesTeaching}
          color="purple"
        />
        <StatCard
          icon={<FiCheckCircle className="w-8 h-8" />}
          title="Assignments"
          value={data.assignmentsCreated}
          color="green"
        />
        <StatCard
          icon={<FiClock className="w-8 h-8" />}
          title="Teaching Hours"
          value={`${data.hoursTeaching}h`}
          color="orange"
        />
      </div>

      {/* Classes List */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">My Classes</h2>
        <div className="text-gray-600">No classes assigned yet</div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`card ${colorClasses[color] || colorClasses.blue}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>
        <div className="text-4xl opacity-20">{icon}</div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
