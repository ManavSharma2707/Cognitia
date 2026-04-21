import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Bars3Icon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { useAuth } from '../../hooks/useAuth'
import { getHealth } from '../../services/healthService'
import Avatar from '../ui/Avatar'

const PAGE_TITLES = {
  '/student': 'Dashboard',
  '/student/profile': 'Profile',
  '/student/academic': 'Academic',
  '/student/attendance': 'Attendance',
  '/student/skill-gap': 'Skill Gap',
  '/student/recommendations': 'Learning Path',
  '/student/progress': 'Progress',
  '/faculty': 'Dashboard',
  '/admin': 'Dashboard',
  '/admin/users': 'Users',
  '/admin/mappings': 'Mappings',
  '/admin/tracks': 'Tracks',
}

function getPageTitle(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  if (pathname.startsWith('/faculty/students/')) return 'Student Detail'
  return 'Dashboard'
}

export default function Header({ onToggleSidebar }) {
  const { pathname } = useLocation()
  const { user, role, logout, roleHome } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [isConnected, setIsConnected] = useState(null)
  const menuRef = useRef(null)

  const title = getPageTitle(pathname)

  const roleLabel = useMemo(() => {
    if (!role) return 'User'
    return role.charAt(0).toUpperCase() + role.slice(1)
  }, [role])

  const breadcrumbRoot = roleLabel

  const profilePath = role === 'student' ? '/student/profile' : (roleHome[role] ?? '/login')

  useEffect(() => {
    function onDocClick(event) {
      if (!menuRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    let mounted = true

    async function checkHealth() {
      try {
        await getHealth()
        if (mounted) setIsConnected(true)
      } catch {
        if (mounted) setIsConnected(false)
      }
    }

    checkHealth()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <header className="h-[60px] bg-white border-b border-cognitia-border px-6 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="lg:hidden h-9 w-9 rounded-lg border border-cognitia-border text-cognitia-muted hover:text-cognitia-dark hover:bg-cognitia-bg flex items-center justify-center"
          onClick={onToggleSidebar}
          aria-label="Open navigation"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div>
        <p className="text-xs text-cognitia-muted">
          {breadcrumbRoot} / {title}
        </p>
        <h1 className="text-lg font-semibold text-cognitia-dark leading-tight">{title}</h1>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            isConnected === true ? 'bg-green-500' : isConnected === false ? 'bg-red-500' : 'bg-gray-300'
          }`}
          title={
            isConnected === true
              ? 'Connected'
              : isConnected === false
                ? 'API Unavailable'
                : 'Checking connection'
          }
        />

        <div className="relative" ref={menuRef}>
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-cognitia-bg transition-colors"
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <Avatar name={user?.full_name} size="sm" src={user?.avatar_url} />
          <div className="text-left">
            <p className="text-sm font-medium text-cognitia-dark leading-tight">{user?.full_name ?? 'User'}</p>
            <span className="inline-flex items-center rounded-full bg-cognitia-teal/10 px-2 py-0.5 text-[11px] font-medium text-cognitia-teal mt-0.5">
              {roleLabel}
            </span>
          </div>
          <ChevronDownIcon className="h-4 w-4 text-cognitia-muted" />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute right-0 mt-2 w-44 rounded-lg border border-cognitia-border bg-white shadow-lg p-1.5 z-50"
            >
              <Link
                to={profilePath}
                className="block rounded-md px-3 py-2 text-sm text-cognitia-dark hover:bg-cognitia-bg"
              >
                Profile
              </Link>
              <button
                type="button"
                onClick={logout}
                className="w-full text-left rounded-md px-3 py-2 text-sm text-cognitia-dark hover:bg-cognitia-bg"
              >
                Logout
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
