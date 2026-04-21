import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

// Layouts
import AppLayout from '../components/layout/AppLayout'
import ProtectedRoute from './ProtectedRoute'

// Auth pages
import LoginPage    from '../pages/auth/LoginPage'
import RegisterPage from '../pages/auth/RegisterPage'

// Student pages
import StudentDashboard  from '../pages/student/StudentDashboard'
import StudentProfile    from '../pages/student/StudentProfile'
import AcademicRecords   from '../pages/student/AcademicRecords'
import AttendanceRecords from '../pages/student/AttendanceRecords'
import SkillGap          from '../pages/student/SkillGap'
import Recommendations   from '../pages/student/Recommendations'
import ProgressTracking  from '../pages/student/ProgressTracking'

// Faculty pages
import FacultyDashboard from '../pages/faculty/FacultyDashboard'
import StudentDetail    from '../pages/faculty/StudentDetail'

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminUsers     from '../pages/admin/AdminUsers'
import AdminMappings  from '../pages/admin/AdminMappings'
import AdminTracks    from '../pages/admin/AdminTracks'

function RoleRedirect() {
  const { isAuthenticated, role, isLoading } = useAuth()
  if (isLoading) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  const home = { student: '/student', faculty: '/faculty', admin: '/admin' }
  return <Navigate to={home[role] ?? '/login'} replace />
}

export default function AppRouter() {
  return (
    <Routes>
      {/* ── Public ─────────────────────────────────────────────────── */}
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* ── Student ────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<AppLayout />}>
          <Route path="/student"                 element={<StudentDashboard />} />
          <Route path="/student/profile"         element={<StudentProfile />} />
          <Route path="/student/academic"        element={<AcademicRecords />} />
          <Route path="/student/attendance"      element={<AttendanceRecords />} />
          <Route path="/student/skill-gap"       element={<SkillGap />} />
          <Route path="/student/recommendations" element={<Recommendations />} />
          <Route path="/student/progress"        element={<ProgressTracking />} />
        </Route>
      </Route>

      {/* ── Faculty ────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['faculty']} />}>
        <Route element={<AppLayout />}>
          <Route path="/faculty"                    element={<FacultyDashboard />} />
          <Route path="/faculty/students/:id"       element={<StudentDetail />} />
        </Route>
      </Route>

      {/* ── Admin ──────────────────────────────────────────────────── */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<AppLayout />}>
          <Route path="/admin"          element={<AdminDashboard />} />
          <Route path="/admin/users"    element={<AdminUsers />} />
          <Route path="/admin/mappings" element={<AdminMappings />} />
          <Route path="/admin/tracks"   element={<AdminTracks />} />
        </Route>
      </Route>

      {/* ── Root redirect ──────────────────────────────────────────── */}
      <Route path="/" element={<RoleRedirect />} />

      {/* ── 404 fallback ───────────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
