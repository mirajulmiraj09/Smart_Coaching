import React, { useEffect, useState } from 'react';
import { FiBook, FiAward, FiBarChart2, FiClock } from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';

const StudentDashboard = () => {
  const [data, setData] = useState({
    enrolledCourses: 0,
    upcomingExams: 0,
    averageScore: 0,
    attendancePercentage: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch student dashboard data
        const response = await api.get('/academics/student/dashboard/');
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
      <h1 className="text-3xl font-bold text-gray-800">Student Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<FiBook className="w-8 h-8" />}
          title="Enrolled Courses"
          value={data.enrolledCourses}
          color="blue"
        />
        <StatCard
          icon={<FiAward className="w-8 h-8" />}
          title="Upcoming Exams"
          value={data.upcomingExams}
          color="purple"
        />
        <StatCard
          icon={<FiBarChart2 className="w-8 h-8" />}
          title="Average Score"
          value={`${data.averageScore}%`}
          color="green"
        />
        <StatCard
          icon={<FiClock className="w-8 h-8" />}
          title="Attendance"
          value={`${data.attendancePercentage}%`}
          color="orange"
        />
      </div>

      {/* Recent Activities */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Activities</h2>
        <div className="text-gray-600">No recent activities</div>
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

export default StudentDashboard;
