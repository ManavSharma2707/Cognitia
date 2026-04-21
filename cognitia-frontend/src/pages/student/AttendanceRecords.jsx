import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { addRecord as addAttendanceRecord } from '../../services/attendanceService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Table from '../../components/ui/Table'
import { formatPercent } from '../../utils/formatters'

const INITIAL_FORM = {
  subject_code: '',
  subject_name: '',
  attendance_pct: '',
  semester: '',
}

export default function AttendanceRecords() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [rows, setRows] = useState([])

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function validateForm() {
    const nextErrors = {}
    const attendance = Number(form.attendance_pct)
    const semester = Number(form.semester)

    if (!form.subject_code.trim()) nextErrors.subject_code = 'Subject code is required'
    if (!form.subject_name.trim()) nextErrors.subject_name = 'Subject name is required'
    if (Number.isNaN(attendance) || attendance < 0 || attendance > 100) {
      nextErrors.attendance_pct = 'Attendance must be between 0 and 100'
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
      const payload = {
        subject_code: form.subject_code.trim(),
        subject_name: form.subject_name.trim(),
        attendance_pct: Number(form.attendance_pct),
        semester: Number(form.semester),
      }

      const saved = await addAttendanceRecord(payload)

      setRows((prev) => [
        {
          attendance_id: saved.attendance_id,
          subject_code: saved.subject_code,
          subject_name: payload.subject_name,
          attendance_pct: saved.attendance_pct,
          at_risk: saved.at_risk,
          semester: payload.semester,
        },
        ...prev,
      ])

      toast.success('Attendance saved')
      setForm(INITIAL_FORM)
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to save attendance')
    } finally {
      setSubmitting(false)
    }
  }

  const columns = useMemo(
    () => [
      { key: 'subject_code', label: 'Subject Code' },
      { key: 'subject_name', label: 'Subject Name' },
      {
        key: 'attendance_pct',
        label: 'Attendance %',
        render: (row) => formatPercent(row.attendance_pct),
      },
      {
        key: 'at_risk',
        label: 'At Risk',
        render: (row) => <Badge variant={row.at_risk ? 'risk' : 'active'}>{row.at_risk ? 'At Risk' : 'Safe'}</Badge>,
      },
      { key: 'semester', label: 'Semester' },
    ],
    [],
  )

  return (
    <div className="space-y-6">
      <Card title="Add Attendance Record" delay={0}>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
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
            label="Attendance %"
            type="number"
            name="attendance_pct"
            value={form.attendance_pct}
            onChange={handleFormChange}
            error={errors.attendance_pct}
            min={0}
            max={100}
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

          <div className="md:col-span-2 xl:col-span-4">
            <Button type="submit" loading={submitting} className="w-auto px-6">
              Save Attendance
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Attendance Records" subtitle="Records added in this session" delay={0.05}>
        <Table
          columns={columns}
          data={rows}
          loading={false}
          emptyMessage="No attendance records yet. Add your first attendance entry above."
        />

        <p className="mt-4 text-sm text-cognitia-muted">
          Students with attendance below 75% are flagged as at risk.
        </p>
      </Card>
    </div>
  )
}
