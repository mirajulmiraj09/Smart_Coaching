import React, { useEffect, useState } from 'react';
import { 
  FiBook, 
  FiAward, 
  FiClock, 
  FiTarget,
  FiMoreVertical,
  FiCheckCircle,
  FiBarChart
} from 'react-icons/fi';
import api from '../../services/api';
import Loading from '../../components/Loading';
import { useAuthStore } from '../../stores/authStore';

const StudentDashboard = () => {
  const { user } = useAuthStore();
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
        const response = await api.get('/academics/student/dashboard/');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setData({
          enrolledCourses: 4,
          upcomingExams: 1,
          averageScore: 78,
          attendancePercentage: 88,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loading />;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-fade-in">
      
      {/* --- Header --- */}
      <div className="flex justify-between items-end pb-4 border-b border-white/10">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Overview of your academic progress.</p>
        </div>
        <div className="hidden sm:block text-right">
          <p className="text-xs text-blue-400 uppercase tracking-wider font-semibold">Current Semester</p>
          <p className="text-lg font-bold text-white font-mono">Fall 2024</p>
        </div>
      </div>

      {/* --- Stats Grid --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox 
          label="Courses Enrolled" 
          value={data.enrolledCourses} 
          icon={<FiBook />} 
          accent="text-blue-400"
          bg="bg-blue-500/10"
          border="border-blue-500/20"
        />
        <StatBox 
          label="GPA / Score" 
          value={`${data.averageScore}%`} 
          icon={<FiAward />} 
          accent="text-purple-400"
          bg="bg-purple-500/10"
          border="border-purple-500/20"
        />
        <StatBox 
          label="Attendance" 
          value={`${data.attendancePercentage}%`} 
          icon={<FiTarget />} 
          accent="text-emerald-400"
          bg="bg-emerald-500/10"
          border="border-emerald-500/20"
        />
        <StatBox 
          label="Pending Exams" 
          value={data.upcomingExams} 
          icon={<FiClock />} 
          accent="text-orange-400"
          bg="bg-orange-500/10"
          border="border-orange-500/20"
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Wide) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Performance Chart Area */}
          <div className="bg-[#0F172A] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Performance History</h2>
              <FiMoreVertical className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
            </div>
            
            {/* CSS-Only Bar Chart with Gradient */}
            <div className="h-48 flex items-end justify-between gap-2 md:gap-4 px-2">
              {[45, 60, 55, 70, 65, 80, 75, 85, 82, 90, 88, data.averageScore].map((h, i) => (
                <div key={i} className="w-full flex flex-col group">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-900 to-blue-500 rounded-t-sm relative overflow-hidden transition-all duration-500 group-hover:from-blue-800 group-hover:to-cyan-400 shadow-[0_0_10px_rgba(59,130,246,0.2)]"
                    style={{ height: `${h}%` }}
                  >
                  </div>
                  <span className="text-[10px] text-gray-500 mt-2 font-mono">{i + 1}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-500 border-t border-white/5 pt-2">
              <span>Jan</span>
              <span>Dec</span>
            </div>
          </div>

          {/* Course List */}
          <div className="bg-[#0F172A] rounded-xl border border-white/10 overflow-hidden shadow-lg">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Courses</h2>
              <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded border border-blue-400">{data.enrolledCourses} Active</span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { name: 'Physics I', teacher: 'Dr. Smith', progress: 75 },
                { name: 'Calculus II', teacher: 'Prof. Johnson', progress: 60 },
                { name: 'Organic Chem', teacher: 'Dr. Lee', progress: 82 },
              ].map((course, i) => (
                <div key={i} className="p-4 hover:bg-white/[0.05] transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 font-bold group-hover:bg-blue-500 group-hover:text-white group-hover:border-blue-500 transition-all">
                      {course.name.substring(0, 2)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{course.name}</h4>
                      <p className="text-xs text-gray-400">{course.teacher}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{width: `${course.progress}%`}}></div>
                    </div>
                    <span className="text-xs font-mono font-bold text-gray-300">{course.progress}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (Narrow) */}
        <div className="space-y-6">
          
          {/* Attendance Card */}
          <div className="bg-[#0F172A] rounded-xl border border-white/10 p-6 shadow-lg">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Attendance</h3>
            <div className="flex items-center gap-6">
              {/* SVG Circle Chart */}
              <div className="relative w-24 h-24">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path className="text-gray-800" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3" />
                  <path 
                    className="text-emerald-500" 
                    strokeDasharray={`${data.attendancePercentage}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3"
                    strokeLinecap="round"
                    style={{ filter: 'drop-shadow(0 0 4px rgba(16, 185, 129, 0.4))' }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold text-white">{data.attendancePercentage}</span>
                  <span className="text-[10px] text-gray-500 uppercase">%</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-gray-300">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.6)]"></div>
                  <span>Present Classes</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-gray-400">
                  <div className="w-2 h-2 rounded-full bg-gray-700"></div>
                  <span>Absent Classes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Tasks */}
          <div className="bg-[#0F172A] rounded-xl border border-white/10 p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Next Up</h3>
              <FiBarChart className="text-gray-500" size={16} />
            </div>
            <div className="space-y-4">
              <div className="flex gap-3 pb-4 border-b border-white/5">
                <div className="flex flex-col items-center min-w-[3rem]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">OCT</span>
                  <span className="text-lg font-bold text-white">24</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Physics Mid-Term</p>
                  <p className="text-xs text-gray-400">Chapter 4 • 09:00 AM</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center min-w-[3rem]">
                  <span className="text-[10px] font-bold text-gray-500 uppercase">OCT</span>
                  <span className="text-lg font-bold text-white">26</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Math Quiz</p>
                  <p className="text-xs text-gray-400">Online • 11:00 AM</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Components ---

const StatBox = ({ label, value, icon, accent, bg, border }) => (
  <div className={`bg-[#0F172A] rounded-xl border ${border} p-5 flex items-center justify-between shadow-md hover:bg-white/[0.02] transition-all group`}>
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
    </div>
    <div className={`p-3 ${bg} rounded-lg border border-white/5 ${accent} shadow-inner`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
  </div>
);

export default StudentDashboard;