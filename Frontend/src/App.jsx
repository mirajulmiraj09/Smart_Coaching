import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './stores/authStore'

// Pages
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardLayout from './layouts/DashboardLayout'
import StudentDashboard from './pages/dashboards/StudentDashboard'
import TeacherDashboard from './pages/dashboards/TeacherDashboard'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import NotFoundPage from './pages/NotFoundPage'
import CentersPage from './pages/CentersPage'
import AcademicsPage from './pages/AcademicsPage'
import ExamsPage from './pages/ExamsPage'
import ResultsPage from './pages/ResultsPage'
import TeachingPage from './pages/TeachingPage'
import AIEnginePage from './pages/AIEnginePage'
import NotificationsPage from './pages/NotificationsPage'
import ProfilePage from './pages/ProfilePage'

// Components
import PrivateRoute from './components/PrivateRoute'
import Loading from './components/Loading'

function App() {
  const { isInitialized, isAuthenticated, user } = useAuthStore()

  useEffect(() => {
    useAuthStore.getState().initAuth()
  }, [])

  if (!isInitialized) {
    return <Loading />
  }

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <Routes>
          {/* Home Page */}
          <Route path="/" element={<HomePage />} />

          {/* Public Routes */}
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
          />

          {/* Protected Routes */}
          <Route element={<PrivateRoute />}>
            <Route element={<DashboardLayout />}>
              {/* Role-based dashboards */}
              <Route path="/dashboard" element={<RoleBasedDashboard />} />

              {/* Generic dashboard pages */}
              <Route path="/dashboard/centers" element={<CentersPage />} />
              <Route path="/dashboard/academics" element={<AcademicsPage />} />
              <Route path="/dashboard/exams" element={<ExamsPage />} />
              <Route path="/dashboard/results" element={<ResultsPage />} />
              <Route path="/dashboard/teaching" element={<TeachingPage />} />
              <Route path="/dashboard/ai" element={<AIEnginePage />} />
              <Route path="/dashboard/notifications" element={<NotificationsPage />} />
              <Route path="/dashboard/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Router>
    </>
  )
}

// Role-based dashboard router
function RoleBasedDashboard() {
  const { user } = useAuthStore()

  if (!user || !user.role_name) {
    return <Navigate to="/login" />
  }

  switch (user.role_name) {
    case 'student':
      return <StudentDashboard />
    case 'teacher':
      return <TeacherDashboard />
    case 'coaching_admin':
    case 'coaching_manager':
    case 'coaching_staff':
      return <AdminDashboard />
    default:
      return <Navigate to="/login" />
  }
}

export default App
