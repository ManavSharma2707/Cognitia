import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const ROLE_HOME = {
  student: '/student',
  faculty: '/faculty',
  admin:   '/admin',
}

/**
 * ProtectedRoute
 * @param {string[]} allowedRoles - roles that may access this subtree
 */
export default function ProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, role, isLoading } = useAuth()

  // While hydrating from localStorage, render nothing to avoid flicker
  if (isLoading) return null

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own home instead of an error page
    return <Navigate to={ROLE_HOME[role] ?? '/login'} replace />
  }

  return <Outlet />
}
