import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiArrowRight, 
  FiBook, 
  FiUsers, 
  FiAward, 
  FiBarChart2,
  FiCheckCircle,
  FiCpu,
  FiTrendingUp,
  FiZap,
  FiLayers
} from 'react-icons/fi';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#030712] text-white selection:bg-blue-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* --- Ambient Background Glows --- */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[40%] w-[300px] h-[300px] bg-cyan-500/10 rounded-full blur-[100px]"></div>
      </div>

      {/* --- Navigation Bar --- */}
      <nav className="fixed top-0 w-full z-50 transition-all duration-300 border-b border-white/5 bg-[#030712]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-20 flex justify-between items-center">
          <div className="flex items-center space-x-3 cursor-pointer group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform duration-300">
              <FiCpu className="text-white text-lg" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Smart Coaching
            </span>
          </div>
          <div className="hidden md:flex items-center space-x-6">
            <button
              onClick={() => navigate('/login')}
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Log in
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2.5 bg-white text-gray-900 text-sm font-semibold rounded-full hover:bg-gray-100 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)]"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-40 pb-24 relative">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8 animate-fade-in-up">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              <span>AI-Powered V2.0</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Elevate Your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
                Coaching Center
              </span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-lg">
              The all-in-one management ecosystem designed for modern education. 
              Streamline operations, boost student engagement, and drive growth with actionable AI insights.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/register')}
                className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:shadow-[0_0_30px_rgba(79,70,229,0.4)] transition-all duration-300 flex items-center justify-center gap-2"
              >
                Start Free Trial
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 text-white rounded-lg font-medium hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                View Live Demo
              </button>
            </div>
            
            <div className="pt-8 flex items-center gap-6 text-sm text-gray-500">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-[#030712] bg-gray-${i * 100 + 200}`}></div>
                ))}
              </div>
              <p>Trusted by <span className="text-white font-semibold">1,200+</span> institutes</p>
            </div>
          </div>

          {/* Hero Visual - Abstract Dashboard */}
          <div className="relative hidden lg:block animate-float">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl blur-[60px] opacity-30"></div>
            <div className="relative bg-[#0F172A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden">
              {/* Simulated Header */}
              <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
                </div>
                <div className="w-24 h-2 bg-white/10 rounded-full"></div>
              </div>
              {/* Simulated Content */}
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-3">
                  <div className="h-24 bg-gradient-to-r from-blue-500/10 to-blue-600/5 rounded-lg border border-white/5 p-4">
                    <div className="w-1/3 h-2 bg-blue-400/30 rounded mb-2"></div>
                    <div className="w-full h-2 bg-white/10 rounded"></div>
                    <div className="w-2/3 h-2 bg-white/10 rounded mt-1"></div>
                  </div>
                  <div className="h-32 bg-white/5 rounded-lg border border-white/5 p-4 flex items-end justify-between gap-1">
                    {[30, 50, 40, 70, 60, 90, 80].map((h, i) => (
                      <div key={i} className="w-full bg-blue-500/20 rounded-t-sm" style={{height: `${h}%`}}></div>
                    ))}
                  </div>
                </div>
                <div className="col-span-1 space-y-3">
                  <div className="h-16 bg-purple-500/10 rounded-lg border border-purple-500/20 p-3">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 mb-2"></div>
                    <div className="w-full h-1.5 bg-white/10 rounded"></div>
                  </div>
                  <div className="h-24 bg-white/5 rounded-lg border border-white/5"></div>
                </div>
              </div>
            </div>
            
            {/* Floating Badge */}
            <div className="absolute -bottom-6 -right-6 bg-[#0F172A] border border-white/10 p-4 rounded-xl shadow-xl flex items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center text-green-400">
                <FiTrendingUp />
              </div>
              <div>
                <p className="text-xs text-gray-400">Performance</p>
                <p className="text-sm font-bold text-white">+24.5%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Features Section --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24 relative">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">
            Everything you need to <span className="text-blue-400">scale</span>
          </h2>
          <p className="text-gray-400 text-lg">
            Replace fragmented tools with a unified platform designed for efficiency and growth.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: FiUsers,
              title: 'Student CRM',
              desc: '360-degree view of student profiles, history, and journey.',
              color: 'text-blue-400',
              bg: 'bg-blue-500/10'
            },
            {
              icon: FiLayers,
              title: 'Smart Batches',
              desc: 'Automated scheduling and resource allocation.',
              color: 'text-purple-400',
              bg: 'bg-purple-500/10'
            },
            {
              icon: FiAward,
              title: 'Exams & Grading',
              desc: 'Digital assessments with instant AI-driven feedback.',
              color: 'text-pink-400',
              bg: 'bg-pink-500/10'
            },
            {
              icon: FiBarChart2,
              title: 'Financials',
              desc: 'Track fees, payroll, and revenue in real-time.',
              color: 'text-cyan-400',
              bg: 'bg-cyan-500/10'
            },
            {
              icon: FiZap,
              title: 'AI Insights',
              desc: 'Predict dropouts and identify top performers.',
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10'
            },
            {
              icon: FiBook,
              title: 'LMS Integration',
              desc: 'Distribute notes and video content seamlessly.',
              color: 'text-emerald-400',
              bg: 'bg-emerald-500/10'
            },
            {
              icon: FiCpu,
              title: 'Automated Admin',
              desc: 'Reduce paperwork with smart workflows.',
              color: 'text-indigo-400',
              bg: 'bg-indigo-500/10'
            },
            {
              icon: FiArrowRight,
              title: 'API Access',
              desc: 'Connect with your existing tools effortlessly.',
              color: 'text-gray-400',
              bg: 'bg-gray-500/10'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group p-6 rounded-2xl bg-[#0F172A]/40 border border-white/5 hover:bg-[#0F172A]/80 transition-all duration-300 hover:border-white/10 hover:-translate-y-1"
              >
                <div className={`w-12 h-12 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="text-xl" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- Role-based Section (Revised for Cohesion) --- */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-24">
        <div className="bg-gradient-to-b from-white/5 to-transparent border border-white/10 rounded-3xl p-8 lg:p-16 relative overflow-hidden">
          {/* Background Decor */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none"></div>
          
          <h2 className="text-3xl lg:text-4xl font-bold mb-12 relative z-10">
            A dedicated space for everyone
          </h2>

          <div className="grid lg:grid-cols-3 gap-8 relative z-10">
            {[
              {
                role: 'For Students',
                desc: 'Access materials, track growth, and stay connected.',
                list: ['Video Lectures', 'Progress Reports', 'Doubt Solving'],
                accent: 'from-blue-500 to-cyan-500'
              },
              {
                role: 'For Teachers',
                desc: 'Focus on teaching while we handle the admin.',
                list: ['Smart Attendance', 'Auto-Grading', 'Content Sharing'],
                accent: 'from-purple-500 to-pink-500'
              },
              {
                role: 'For Admins',
                desc: 'Complete control over your institution\'s pulse.',
                list: ['Revenue Analytics', 'Staff Management', 'Bulk Communication'],
                accent: 'from-orange-500 to-red-500'
              }
            ].map((item, index) => (
              <div key={index} className="bg-[#030712]/60 backdrop-blur-md rounded-2xl p-8 border border-white/5 hover:border-white/10 transition-all group">
                <div className={`w-12 h-1 mb-8 rounded-full bg-gradient-to-r ${item.accent} w-24 group-hover:w-full transition-all duration-500`}></div>
                <h3 className="text-2xl font-bold text-white mb-3">{item.role}</h3>
                    <p className="text-gray-400 mb-6 text-sm">{item.desc}</p>
                <ul className="space-y-4">
                  {item.list.map((listItem, i) => (
                    <li key={i} className="flex items-center text-gray-300 text-sm group-hover:text-white transition-colors">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${item.accent} flex items-center justify-center mr-3 shadow-lg shadow-${item.accent.split('-')[1]}-500/20`}>
                        <FiCheckCircle className="text-[10px] text-white" />
                      </div>
                      {listItem}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CTA Section --- */}
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-20">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-16 md:px-16 md:py-20 text-center shadow-2xl shadow-blue-900/40">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
              Ready to upgrade your center?
            </h2>
            <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
              Join the revolution in education management. Setup takes less than 5 minutes.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => navigate('/register')}
                className="px-10 py-4 bg-white text-indigo-700 rounded-full font-bold text-lg hover:bg-blue-50 transition shadow-xl hover:scale-105 transform duration-300 flex items-center justify-center gap-2"
              >
                Get Started Now <FiArrowRight />
              </button>
              <button className="px-10 py-4 bg-transparent border border-white/30 text-white rounded-full font-bold text-lg hover:bg-white/10 transition">
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Footer --- */}
      <footer className="border-t border-white/10 bg-[#030712] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                  <FiCpu className="text-white text-sm" />
                </div>
                <span className="text-lg font-bold text-white">Smart Coaching</span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                Empowering education institutes with next-generation management tools.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4">
                {['Features', 'Integrations', 'Pricing', 'Changelog'].map(item => (
                  <li key={item}><a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4">
                {['About Us', 'Careers', 'Blog', 'Contact'].map(item => (
                  <li key={item}><a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(item => (
                  <li key={item}><a href="#" className="text-gray-500 hover:text-blue-400 transition-colors text-sm">{item}</a></li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">&copy; 2026 Smart Coaching Inc. All rights reserved.</p>
            <div className="flex space-x-6">
              {[1,2,3].map(i => (
                <div key={i} className="w-5 h-5 bg-gray-800 rounded-full hover:bg-blue-500 transition-colors cursor-pointer"></div>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* --- Custom Animation Styles --- */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 40px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
          100% { transform: translateY(0px); }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default HomePage;