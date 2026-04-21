import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { addRecord as addAcademicRecord, getRecords as getAcademicRecords } from '../../services/academicService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import Table from '../../components/ui/Table'
import {
  formatDate,
  formatPercent,
  getPerformanceVariant,
  truncate,
} from '../../utils/formatters'

const INITIAL_FORM = {
  subject_code: '',
  subject_name: '',
  marks_obtained: '',
  max_marks: 100,
  semester: '',
}

const SEMESTER_OPTIONS = [
  { value: '', label: 'All semesters' },
  { value: '1', label: 'Semester 1' },
  { value: '2', label: 'Semester 2' },
  { value: '3', label: 'Semester 3' },
  { value: '4', label: 'Semester 4' },
  { value: '5', label: 'Semester 5' },
  { value: '6', label: 'Semester 6' },
  { value: '7', label: 'Semester 7' },
  { value: '8', label: 'Semester 8' },
  { value: '9', label: 'Semester 9' },
  { value: '10', label: 'Semester 10' },
]

export default function AcademicRecords() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [records, setRecords] = useState([])
  const [semesterFilter, setSemesterFilter] = useState('')

  const fetchRecords = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAcademicRecords(semesterFilter ? Number(semesterFilter) : undefined)
      setRecords(data?.records ?? [])
    } catch (err) {
      const message = err?.response?.data?.detail ?? 'Unable to load academic records'
      toast.error(message)
      setRecords([])
    } finally {
      setLoading(false)
    }
  }, [semesterFilter])

  useEffect(() => {
    fetchRecords()
  }, [fetchRecords])

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const nextErrors = {}
    const marks = Number(form.marks_obtained)
    const maxMarks = Number(form.max_marks)
    const semester = Number(form.semester)

    if (!form.subject_code.trim()) nextErrors.subject_code = 'Subject code is required'
    if (!form.subject_name.trim()) nextErrors.subject_name = 'Subject name is required'
    if (Number.isNaN(marks) || marks < 0) nextErrors.marks_obtained = 'Marks must be 0 or higher'
    if (Number.isNaN(maxMarks) || maxMarks <= 0) nextErrors.max_marks = 'Max marks must be greater than 0'
    if (!Number.isNaN(marks) && !Number.isNaN(maxMarks) && marks > maxMarks) {
      nextErrors.marks_obtained = 'Marks must not exceed max marks'
    }
    if (Number.isNaN(semester) || semester < 1 || semester > 10) {
      nextErrors.semester = 'Semester must be between 1 and 10'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!validateForm()) return

    setSubmitting(true)
    try {
      await addAcademicRecord({
        subject_code: form.subject_code.trim(),
        subject_name: form.subject_name.trim(),
        marks_obtained: Number(form.marks_obtained),
        max_marks: Number(form.max_marks),
        semester: Number(form.semester),
      })

      toast.success('Record saved. Recommendations updated.')
      setForm(INITIAL_FORM)
      await fetchRecords()
    } catch (err) {
      if (err?.response?.status === 409) {
        toast.error('Record already exists for this subject and semester.')
      } else {
        toast.error(err?.response?.data?.detail ?? 'Unable to save record')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const stats = useMemo(() => {
    const summary = {
      total: records.length,
      weak: 0,
      moderate: 0,
      strong: 0,
    }

    records.forEach((record) => {
      const level = String(record.performance_level ?? '').toLowerCase()
      if (level === 'weak') summary.weak += 1
      else if (level === 'moderate') summary.moderate += 1
      else if (level === 'strong') summary.strong += 1
    })

    return summary
  }, [records])

  const columns = [
    { key: 'subject_code', label: 'Subject Code' },
    {
      key: 'subject_name',
      label: 'Subject Name',
      render: (row) => <span title={row.subject_name}>{truncate(row.subject_name, 28)}</span>,
    },
    { key: 'marks_obtained', label: 'Marks' },
    { key: 'max_marks', label: 'Max Marks' },
    {
      key: 'score_percent',
      label: 'Score %',
      render: (row) => formatPercent(row.score_percent),
    },
    {
      key: 'performance_level',
      label: 'Performance Level',
      render: (row) => (
        <Badge variant={getPerformanceVariant(row.performance_level)}>
          {String(row.performance_level ?? '').replace(/\b\w/g, (char) => char.toUpperCase())}
        </Badge>
      ),
    },
    { key: 'semester', label: 'Semester' },
    {
      key: 'recorded_at',
      label: 'Recorded At',
      render: (row) => formatDate(row.recorded_at ?? row.created_at),
    },
  ]

  return (
    <div className="space-y-6">
      <Card title="Add Academic Record" delay={0}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Subject Code"
            name="subject_code"
            value={form.subject_code}
            onChange={handleFormChange}
            error={errors.subject_code}
            placeholder="e.g. CS301"
            required
          />

          <Input
            label="Subject Name"
            name="subject_name"
            value={form.subject_name}
            onChange={handleFormChange}
            error={errors.subject_name}
            placeholder="e.g. Data Structures"
            required
          />

          <Input
            label="Marks Obtained"
            type="number"
            name="marks_obtained"
            value={form.marks_obtained}
            onChange={handleFormChange}
            error={errors.marks_obtained}
            min={0}
            required
          />

          <Input
            label="Max Marks"
            type="number"
            name="max_marks"
            value={form.max_marks}
            onChange={handleFormChange}
            error={errors.max_marks}
            min={1}
            required
          />

          <Input
            label="Semester"
            type="number"
            name="semester"
            value={form.semester}
            onChange={handleFormChange}
            error={errors.semester}
            min={1}
            max={10}
            required
          />

          <div className="md:col-span-2 xl:col-span-5">
            <Button type="submit" loading={submitting} className="w-auto px-6">
              Save Record
            </Button>
          </div>
        </form>
      </Card>

      <Card
        title="Academic Records"
        subtitle="All submitted subjects and performance levels"
        delay={0.05}
        headerAction={
          <div className="w-44">
            <Select
              name="semesterFilter"
              value={semesterFilter}
              onChange={(event) => setSemesterFilter(event.target.value)}
              options={SEMESTER_OPTIONS}
            />
          </div>
        }
      >
        <div className="mb-4 flex flex-wrap gap-2">
          <span className="rounded-full bg-cognitia-bg px-3 py-1 text-xs font-medium text-cognitia-dark">Total Subjects: {stats.total}</span>
          <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">Weak: {stats.weak}</span>
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-medium text-yellow-700">Moderate: {stats.moderate}</span>
          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">Strong: {stats.strong}</span>
        </div>

        <Table
          columns={columns}
          data={records}
          loading={loading}
          emptyMessage="No academic records found. Add your first record above."
        />
      </Card>
    </div>
  )
}
