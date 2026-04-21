import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AcademicCapIcon,
  ArrowLeftOnRectangleIcon,
  AdjustmentsHorizontalIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ChartPieIcon,
  HomeIcon,
  LightBulbIcon,
  LinkIcon,
  UserIcon,
  UsersIcon,
} from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'

const STUDENT_NAV = [
  { path: '/student', label: 'Dashboard', icon: HomeIcon },
  { path: '/student/profile', label: 'Profile', icon: UserIcon },
  { path: '/student/academic', label: 'Academic', icon: AcademicCapIcon },
  { path: '/student/attendance', label: 'Attendance', icon: CalendarDaysIcon },
  { path: '/student/skill-gap', label: 'Skill Gap', icon: ChartBarIcon },
  { path: '/student/recommendations', label: 'Learning Path', icon: LightBulbIcon },
  { path: '/student/progress', label: 'Progress', icon: ChartPieIcon },
]

const FACULTY_NAV = [
  { path: '/faculty', label: 'Dashboard', icon: HomeIcon },
]

const ADMIN_NAV = [
  { path: '/admin', label: 'Dashboard', icon: HomeIcon },
  { path: '/admin/users', label: 'Users', icon: UsersIcon },
  { path: '/admin/mappings', label: 'Mappings', icon: LinkIcon },
  { path: '/admin/tracks', label: 'Tracks', icon: AdjustmentsHorizontalIcon },
]

const NAV_BY_ROLE = {
  student: STUDENT_NAV,
  faculty: FACULTY_NAV,
  admin: ADMIN_NAV,
}

function isRouteActive(pathname, path) {
  if (path === '/student' || path === '/faculty' || path === '/admin') {
    return pathname === path
  }
  return pathname === path || pathname.startsWith(`${path}/`)
}

function SidebarBody({ navItems, pathname, logout, onCloseMobile }) {
  return (
    <>
      <div className="h-16 w-full flex items-center justify-center">
        <span className="h-9 w-9 rounded-xl bg-cognitia-teal/10 text-cognitia-teal flex items-center justify-center">
          <AcademicCapIcon className="h-6 w-6" />
        </span>
      </div>

      <nav className="flex-1 w-full flex items-center justify-center">
        <ul className="w-full flex flex-col items-center gap-2">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = isRouteActive(pathname, path)
            return (
              <li key={path} className="relative group">
                <Link
                  to={path}
                  title={label}
                  aria-label={label}
                  onClick={onCloseMobile}
                  className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${
                    active
                      ? 'bg-cognitia-teal/10 text-cognitia-teal'
                      : 'text-cognitia-muted hover:text-cognitia-dark hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-6 w-6" />
                </Link>
                <span className="pointer-events-none absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-cognitia-dark px-2 py-1 text-xs text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                  {label}
                </span>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="w-full pb-4 flex justify-center">
        <button
          type="button"
          onClick={logout}
          title="Logout"
          aria-label="Logout"
          className="h-10 w-10 rounded-full flex items-center justify-center text-cognitia-muted hover:text-cognitia-dark hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftOnRectangleIcon className="h-6 w-6" />
        </button>
      </div>
    </>
  )
}

export default function Sidebar({ mobileOpen = false, onCloseMobile = () => null }) {
  const { pathname } = useLocation()
  const { role, logout } = useAuth()

  const navItems = NAV_BY_ROLE[role] ?? []

  return (
    <>
      <aside className="hidden lg:flex fixed left-0 top-0 z-40 h-screen w-16 bg-white border-r border-cognitia-border flex-col items-center">
        <SidebarBody navItems={navItems} pathname={pathname} logout={logout} onCloseMobile={onCloseMobile} />
      </aside>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/35 lg:hidden"
              onClick={onCloseMobile}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />

            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen w-72 bg-white border-r border-cognitia-border flex flex-col items-center lg:hidden"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ duration: 0.24, ease: 'easeOut' }}
            >
              <SidebarBody navItems={navItems} pathname={pathname} logout={logout} onCloseMobile={onCloseMobile} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
