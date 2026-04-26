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
  FiTrendingUp
} from 'react-icons/fi';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-900 to-slate-900">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-slate-900 bg-opacity-95 backdrop-blur-md z-50 border-b border-blue-500 border-opacity-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
              <FiCpu className="text-white text-xl" />
            </div>
            <span className="text-2xl font-bold text-white">Smart Coaching</span>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/login')}
              className="px-6 py-2 text-white hover:text-blue-300 transition"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/register')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg"
            >
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Smart Coaching
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
                Center Management
              </span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Transform your coaching center with our AI-powered management system. 
              Manage students, teachers, exams, and results all in one place.
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center space-x-2 font-semibold"
              >
                <span>Get Started</span>
                <FiArrowRight />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3 border border-blue-400 text-blue-300 rounded-lg hover:bg-blue-400 hover:bg-opacity-10 transition"
              >
                Login
              </button>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur-3xl opacity-20"></div>
              <div className="relative bg-slate-800 border border-blue-500 border-opacity-30 rounded-lg p-8">
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded opacity-30 w-full"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Powerful Features for Modern Coaching Centers
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            {
              icon: FiUsers,
              title: 'Student Management',
              description: 'Manage student profiles, track progress, and monitor attendance'
            },
            {
              icon: FiBook,
              title: 'Course Management',
              description: 'Organize classes, subjects, and academic materials efficiently'
            },
            {
              icon: FiAward,
              title: 'Exam & Results',
              description: 'Schedule exams, manage results, and track student performance'
            },
            {
              icon: FiCpu,
              title: 'AI Analytics',
              description: 'AI-powered insights for student success and predictions'
            },
            {
              icon: FiBarChart2,
              title: 'Advanced Analytics',
              description: 'Track center performance with detailed reports and insights'
            },
            {
              icon: FiTrendingUp,
              title: 'Growth Tracking',
              description: 'Monitor growth metrics and identify improvement opportunities'
            },
            {
              icon: FiCheckCircle,
              title: 'Quality Assurance',
              description: 'Maintain quality standards with automated monitoring'
            },
            {
              icon: FiArrowRight,
              title: '24/7 Support',
              description: 'Round-the-clock support for all your coaching needs'
            }
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-slate-800 bg-opacity-50 border border-blue-500 border-opacity-30 rounded-lg p-6 hover:border-opacity-100 transition hover:bg-opacity-70"
              >
                <Icon className="text-blue-400 text-3xl mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-based Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white text-center mb-16">
          Tailored for Every Role
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              role: 'Students',
              features: ['View courses & exams', 'Track results', 'Check attendance', 'Access materials'],
              color: 'blue'
            },
            {
              role: 'Teachers',
              features: ['Manage classes', 'Create assignments', 'Grade students', 'Share materials'],
              color: 'purple'
            },
            {
              role: 'Administrators',
              features: ['Center management', 'User management', 'Analytics & reports', 'System configuration'],
              color: 'pink'
            }
          ].map((item, index) => (
            <div
              key={index}
              className={`bg-gradient-to-br from-${item.color}-600 to-${item.color}-800 rounded-lg p-8 text-white`}
            >
              <h3 className="text-2xl font-bold mb-6">{item.role}</h3>
              <ul className="space-y-3">
                {item.features.map((feature, i) => (
                  <li key={i} className="flex items-center space-x-3">
                    <FiCheckCircle className="text-green-300 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Coaching Center?
          </h2>
          <p className="text-blue-100 mb-8">
            Join thousands of coaching centers using Smart Coaching to manage their operations efficiently.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="px-10 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition shadow-lg inline-flex items-center space-x-2"
          >
            <span>Get Started Free</span>
            <FiArrowRight />
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-500 border-opacity-30 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400">Features</a></li>
                <li><a href="#" className="hover:text-blue-400">Pricing</a></li>
                <li><a href="#" className="hover:text-blue-400">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400">About</a></li>
                <li><a href="#" className="hover:text-blue-400">Blog</a></li>
                <li><a href="#" className="hover:text-blue-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Resources</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400">Documentation</a></li>
                <li><a href="#" className="hover:text-blue-400">API</a></li>
                <li><a href="#" className="hover:text-blue-400">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#" className="hover:text-blue-400">Privacy</a></li>
                <li><a href="#" className="hover:text-blue-400">Terms</a></li>
                <li><a href="#" className="hover:text-blue-400">License</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Smart Coaching Center. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
