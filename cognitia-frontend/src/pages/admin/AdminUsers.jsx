import { useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { deactivateUser, listUsers } from '../../services/adminService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import Modal from '../../components/ui/Modal'
import PageHeader from '../../components/ui/PageHeader'

const LIMIT = 20

function formatDate(value) {
  if (!value) return '-'
  return new Date(value).toLocaleString()
}

function roleVariant(role) {
  if (role === 'student') return 'student'
  if (role === 'faculty') return 'faculty'
  if (role === 'admin') return 'admin'
  return 'active'
}

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [targetUser, setTargetUser] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  useEffect(() => {
    async function loadUsers() {
      setLoading(true)
      setError('')

      try {
        const data = await listUsers(page, LIMIT, roleFilter !== 'all' ? roleFilter : undefined)
        setUsers(data?.users ?? [])
        setTotal(data?.total ?? 0)
      } catch {
        setError('Unable to load users right now.')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [page, roleFilter])

  useEffect(() => {
    setPage(1)
  }, [roleFilter])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.full_name?.toLowerCase().includes(q) ||
        user.email?.toLowerCase().includes(q)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'inactive' && !user.is_active)

      return matchesSearch && matchesStatus
    })
  }, [users, search, statusFilter])

  function openDeactivateModal(user) {
    setTargetUser(user)
    setConfirmOpen(true)
  }

  async function handleDeactivate() {
    if (!targetUser) return
    setDeactivating(true)

    try {
      await deactivateUser(targetUser.user_id)
      toast.success('User deactivated')
      setConfirmOpen(false)
      setTargetUser(null)

      const data = await listUsers(page, LIMIT, roleFilter !== 'all' ? roleFilter : undefined)
      setUsers(data?.users ?? [])
      setTotal(data?.total ?? 0)
    } catch {
      toast.error('Could not deactivate user')
    } finally {
      setDeactivating(false)
    }
  }

  const hasPrevious = page > 1
  const hasNext = total > page * LIMIT

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Users"
        subtitle="Search, filter, and deactivate accounts."
      />

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name or email"
          />

          <Select
            label="Role"
            name="role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'student', label: 'Student' },
              { value: 'faculty', label: 'Faculty' },
              { value: 'admin', label: 'Admin' },
            ]}
          />

          <Select
            label="Status"
            name="status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
          />
        </div>

        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

        <div className="overflow-x-auto border border-cognitia-border rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-cognitia-muted">
                <th className="px-4 py-3">User ID</th>
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Created At</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-center text-cognitia-muted" colSpan={7}>
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-center text-cognitia-muted" colSpan={7}>
                    No users found for the current filters.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.user_id} className="border-t border-cognitia-border hover:bg-gray-50">
                    <td className="px-4 py-3 text-cognitia-dark">#{user.user_id}</td>
                    <td className="px-4 py-3 text-cognitia-dark font-medium">{user.full_name}</td>
                    <td className="px-4 py-3 text-cognitia-dark">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleVariant(user.role)}>{user.role}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={user.is_active ? 'active' : 'inactive'}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-cognitia-muted">{formatDate(user.created_at)}</td>
                    <td className="px-4 py-3 w-44">
                      <Button
                        variant="danger"
                        className="w-auto px-3 py-2"
                        disabled={!user.is_active}
                        onClick={() => openDeactivateModal(user)}
                      >
                        Deactivate
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-cognitia-muted">Page {page}</p>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              className="w-auto px-4"
              disabled={!hasPrevious}
              onClick={() => setPage((prev) => prev - 1)}
            >
              Previous
            </Button>
            <Button
              variant="secondary"
              className="w-auto px-4"
              disabled={!hasNext}
              onClick={() => setPage((prev) => prev + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          if (deactivating) return
          setConfirmOpen(false)
          setTargetUser(null)
        }}
        title="Deactivate Account"
        size="sm"
      >
        <p className="text-sm text-cognitia-muted">
          Are you sure you want to deactivate this account? This action cannot be undone.
        </p>

        <div className="mt-6 flex gap-3 justify-end">
          <Button
            variant="secondary"
            className="w-auto px-4"
            disabled={deactivating}
            onClick={() => {
              setConfirmOpen(false)
              setTargetUser(null)
            }}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className="w-auto px-4"
            loading={deactivating}
            onClick={handleDeactivate}
          >
            Confirm Deactivate
          </Button>
        </div>
      </Modal>
    </div>
  )
}
