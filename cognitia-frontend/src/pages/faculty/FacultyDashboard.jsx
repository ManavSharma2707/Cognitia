import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAssignedStudents } from '../../services/facultyService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Table from '../../components/ui/Table'
import Input from '../../components/ui/Input'
import PageHeader from '../../components/ui/PageHeader'

function containsQuery(text, query) {
  return String(text ?? '').toLowerCase().includes(query)
}

export default function FacultyDashboard() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [students, setStudents] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function loadStudents() {
      setLoading(true)
      try {
        const response = await getAssignedStudents()
        setStudents(response?.students ?? [])
        setError('')
      } catch (err) {
        setError(err?.response?.data?.detail ?? 'Unable to load assigned students')
        setStudents([])
      } finally {
        setLoading(false)
      }
    }

    loadStudents()
  }, [])

  const stats = useMemo(() => {
    const total = students.length
    const atRisk = students.filter((row) => row.attendance_at_risk === true).length
    const weakSubjects = students.filter((row) => Number(row.weak_subject_count ?? 0) > 0).length
    return { total, atRisk, weakSubjects }
  }, [students])

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return students

    return students.filter((row) => (
      containsQuery(row.full_name, query) || containsQuery(row.roll_number, query)
    ))
  }, [students, search])

  const columns = [
    {
      key: 'full_name',
      label: 'Student Name',
      render: (row) => (
        <Link
          to={`/faculty/students/${row.student_id}`}
          className="font-semibold text-cognitia-dark hover:text-cognitia-teal hover:underline"
        >
          {row.full_name}
        </Link>
      ),
    },
    { key: 'roll_number', label: 'Roll Number' },
    { key: 'department', label: 'Department' },
    { key: 'semester', label: 'Semester' },
    {
      key: 'weak_subject_count',
      label: 'Weak Subjects',
      render: (row) => {
        const weakCount = Number(row.weak_subject_count ?? 0)
        return (
          <span className={weakCount > 0 ? 'text-red-700 font-semibold' : 'text-cognitia-dark'}>
            {weakCount}
          </span>
        )
      },
    },
    {
      key: 'attendance_at_risk',
      label: 'Attendance Risk',
      render: (row) => (
        <Badge variant={row.attendance_at_risk ? 'risk' : 'active'}>
          {row.attendance_at_risk ? 'At Risk' : 'Safe'}
        </Badge>
      ),
    },
    {
      key: 'completion_pct',
      label: 'Completion %',
      render: (row) => (
        <div className="flex items-center gap-2 w-[140px]">
          <div className="w-[100px]">
            <ProgressBar value={Number(row.completion_pct ?? 0)} showLabel={false} />
          </div>
          <span className="text-xs text-cognitia-muted min-w-8">{Math.round(Number(row.completion_pct ?? 0))}%</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <Link to={`/faculty/students/${row.student_id}`} className="text-sm font-medium text-cognitia-teal hover:underline">
          View Details
        </Link>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card title="Faculty Dashboard">
        <EmptyState title="Unable to load assigned students" description={error} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Faculty Dashboard"
        subtitle="Monitor your assigned students and identify risk signals quickly."
      />

      <section className="grid gap-4 md:grid-cols-3">
        <Card delay={0}>
          <p className="text-xs uppercase tracking-wide text-cognitia-muted">Total Assigned Students</p>
          <p className="mt-2 text-3xl font-semibold text-cognitia-dark">{stats.total}</p>
        </Card>

        <Card delay={0.03} className="bg-orange-50">
          <p className="text-xs uppercase tracking-wide text-orange-700">Students At Risk</p>
          <p className="mt-2 text-3xl font-semibold text-orange-700">{stats.atRisk}</p>
        </Card>

        <Card delay={0.06} className="bg-red-50">
          <p className="text-xs uppercase tracking-wide text-red-700">Students with Weak Subjects</p>
          <p className="mt-2 text-3xl font-semibold text-red-700">{stats.weakSubjects}</p>
        </Card>
      </section>

      <Card title="Assigned Students" delay={0.08}>
        <div className="mb-4">
          <Input
            label="Search"
            name="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by student name or roll number"
            className="w-full md:w-[360px]"
          />
        </div>

        <Table
          columns={columns}
          data={filteredStudents.map((row) => ({ ...row, id: row.student_id }))}
          loading={false}
          emptyMessage="No assigned students match your search."
        />
      </Card>
    </div>
  )
}
