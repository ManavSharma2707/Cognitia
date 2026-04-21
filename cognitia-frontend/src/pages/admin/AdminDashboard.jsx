import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRightIcon,
  ChartBarIcon,
  LinkIcon,
  UserGroupIcon,
  UsersIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline'
import { listUsers } from '../../services/adminService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleDateString()
}

function roleVariant(role) {
  if (role === 'student') return 'student'
  if (role === 'faculty') return 'faculty'
  if (role === 'admin') return 'admin'
  return 'active'
}

const QUICK_LINKS = [
  {
    to: '/admin/users',
    title: 'Manage Users',
    description: 'View users, filter roles, and deactivate inactive accounts.',
    icon: UsersIcon,
  },
  {
    to: '/admin/mappings',
    title: 'Subject-Skill Mapping',
    description: 'Create mappings that power recommendation generation.',
    icon: LinkIcon,
  },
  {
    to: '/admin/tracks',
    title: 'Career Tracks',
    description: 'Attach modules to active tracks with sequence control.',
    icon: AdjustmentsHorizontalIcon,
  },
]

async function fetchAllUsers() {
  const limit = 100
  let page = 1
  let total = 0
  const all = []

  do {
    const data = await listUsers(page, limit)
    total = data?.total ?? 0
    all.push(...(data?.users ?? []))
    page += 1
  } while (all.length < total)

  return all
}

export default function AdminDashboard() {
  const [users, setUsers] = useState([])
  const [totalUsers, setTotalUsers] = useState(0)
  const [studentsCount, setStudentsCount] = useState(0)
  const [facultyCount, setFacultyCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true)
      setError('')

      try {
        const [allUsers, studentRes, facultyRes] = await Promise.all([
          fetchAllUsers(),
          listUsers(1, 1, 'student'),
          listUsers(1, 1, 'faculty'),
        ])

        setUsers(allUsers)
        setTotalUsers(allUsers.length)
        setStudentsCount(studentRes?.total ?? 0)
        setFacultyCount(facultyRes?.total ?? 0)
      } catch {
        setError('Unable to load dashboard data right now.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  const inactiveCount = useMemo(
    () => users.filter((user) => !user.is_active).length,
    [users],
  )

  const recentUsers = useMemo(
    () => [...users].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
    [users],
  )

  const stats = [
    { label: 'Total Users', value: totalUsers, icon: UsersIcon },
    { label: 'Students', value: studentsCount, icon: UserGroupIcon },
    { label: 'Faculty', value: facultyCount, icon: ChartBarIcon },
    { label: 'Inactive Accounts', value: inactiveCount, icon: UsersIcon },
  ]

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Overview of users and key admin actions."
      />

      {error && (
        <Card className="border border-red-200 bg-red-50">
          <p className="text-sm text-red-700">{error}</p>
        </Card>
      )}

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} className="p-5" delay={0.03}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-cognitia-muted">{stat.label}</p>
                  <p className="text-3xl font-bold text-cognitia-dark mt-2">
                    {loading ? '-' : stat.value}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-xl bg-cognitia-teal/10 text-cognitia-teal flex items-center justify-center">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          )
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <Card title="Recent Users" subtitle="5 most recently created users" className="xl:col-span-2">
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-cognitia-muted bg-gray-50">
                  <th className="px-3 py-2">Name</th>
                  <th className="px-3 py-2">Role</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Status</th>
                  <th className="px-3 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-cognitia-muted">
                      Loading recent users...
                    </td>
                  </tr>
                ) : recentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-cognitia-muted">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  recentUsers.map((user) => (
                    <tr key={user.user_id} className="border-t border-cognitia-border">
                      <td className="px-3 py-3 text-cognitia-dark font-medium">{user.full_name}</td>
                      <td className="px-3 py-3">
                        <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                      </td>
                      <td className="px-3 py-3 text-cognitia-dark">{user.email}</td>
                      <td className="px-3 py-3">
                        <Badge variant={user.is_active ? 'active' : 'inactive'}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-3 py-3 text-cognitia-muted">{formatDate(user.created_at)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Quick Links" subtitle="Jump to common admin actions">
          <div className="space-y-3">
            {QUICK_LINKS.map(({ to, title, description, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="group block rounded-xl border border-cognitia-border p-4 hover:border-cognitia-teal hover:bg-cognitia-teal/5 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 rounded-lg bg-cognitia-teal/10 text-cognitia-teal flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-cognitia-dark">{title}</p>
                      <p className="text-xs text-cognitia-muted mt-1">{description}</p>
                    </div>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-cognitia-muted group-hover:text-cognitia-teal transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
