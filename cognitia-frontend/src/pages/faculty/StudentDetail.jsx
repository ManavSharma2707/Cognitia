import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeftIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { getStudentDetail } from '../../services/facultyService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import BarChart from '../../components/charts/BarChart'
import Avatar from '../../components/ui/Avatar'
import PageHeader from '../../components/ui/PageHeader'
import { formatDate, formatPercent, getPerformanceColor, getPerformanceVariant } from '../../utils/formatters'

const CATEGORY_BADGE = {
  'Academic Remediation': 'weak',
  'Career Skill': 'active',
  'Interest-Based': 'student',
  'Attendance Recovery': 'risk',
}

const STATUS_BADGE = {
  completed: 'active',
  in_progress: 'moderate',
  not_started: 'inactive',
}

function titleCase(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function StudentDetail() {
  const { id } = useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [detail, setDetail] = useState(null)

  useEffect(() => {
    async function loadDetail() {
      setLoading(true)
      try {
        const response = await getStudentDetail(id)
        setDetail(response)
        setError('')
      } catch (err) {
        setError(err?.response?.data?.detail ?? 'Unable to load student detail')
        setDetail(null)
      } finally {
        setLoading(false)
      }
    }

    if (id) loadDetail()
  }, [id])

  const student = detail?.student
  const academicRecords = detail?.academic_records ?? []
  const skillGap = detail?.skill_gap
  const learningPath = detail?.learning_path

  const chartData = useMemo(() => {
    return academicRecords.map((record) => ({
      label: record.subject_name,
      value: Number(record.score_percent ?? 0),
      color: getPerformanceColor(record.performance_level),
    }))
  }, [academicRecords])

  const modulesToShow = learningPath?.modules?.slice(0, 5) ?? []

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <Card title="Student Detail">
        <EmptyState title="Unable to load student detail" description={error || 'No data available.'} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {skillGap?.attendance_at_risk && (
        <div className="rounded-xl border border-orange-300 bg-orange-50 px-4 py-3 flex items-start gap-2 text-orange-800">
          <ExclamationTriangleIcon className="h-5 w-5 mt-0.5" />
          <p className="text-sm font-medium">
            This student has attendance below the required threshold in one or more subjects.
          </p>
        </div>
      )}

      <section className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <Avatar name={student?.full_name} size="lg" src={student?.avatar_url} />
          <div>
            <PageHeader
              title={student?.full_name}
              subtitle={`${student?.roll_number} · ${student?.department} · Semester ${student?.semester}`}
            />
          </div>
        </div>

        <Link to="/faculty" className="inline-flex items-center gap-1.5 text-sm font-medium text-cognitia-teal hover:underline">
          <ArrowLeftIcon className="h-4 w-4" />
          Back to Students
        </Link>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <Card title="Academic Performance" delay={0}>
          {chartData.length ? (
            <>
              <BarChart data={chartData} yLabel="Score (%)" height={260} />

              <div className="mt-4 overflow-x-auto rounded-xl border border-cognitia-border">
                <table className="min-w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 text-xs font-semibold text-cognitia-muted uppercase tracking-wide">
                      <th className="px-3 py-2">Subject</th>
                      <th className="px-3 py-2">Score</th>
                      <th className="px-3 py-2">Performance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {academicRecords.map((record) => (
                      <tr key={record.record_id} className="border-t border-cognitia-border">
                        <td className="px-3 py-2 text-cognitia-dark">
                          <p className="font-medium">{record.subject_code}</p>
                          <p className="text-xs text-cognitia-muted">{record.subject_name}</p>
                        </td>
                        <td className="px-3 py-2 text-cognitia-dark">{formatPercent(record.score_percent)}</td>
                        <td className="px-3 py-2">
                          <Badge variant={getPerformanceVariant(record.performance_level)}>
                            {titleCase(record.performance_level)}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState title="No academic records" description="No academic performance data is available for this student." />
          )}
        </Card>

        <Card title="Skill Gap" delay={0.04}>
          {skillGap ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-red-50 px-3 py-2">
                  <p className="text-xs text-red-700 uppercase tracking-wide">Weak Subjects</p>
                  <p className="text-2xl font-semibold text-red-700 mt-1">{skillGap.weak_subject_count}</p>
                </div>
                <div className="rounded-lg bg-yellow-50 px-3 py-2">
                  <p className="text-xs text-yellow-700 uppercase tracking-wide">Moderate Subjects</p>
                  <p className="text-2xl font-semibold text-yellow-700 mt-1">{skillGap.moderate_subject_count}</p>
                </div>
              </div>

              <div>
                <Badge variant={skillGap.attendance_at_risk ? 'risk' : 'active'}>
                  {skillGap.attendance_at_risk ? 'Attendance At Risk' : 'Attendance Safe'}
                </Badge>
              </div>

              <p className="text-sm text-cognitia-muted">Generated: {formatDate(skillGap.generated_at)}</p>

              <div className="space-y-3">
                {skillGap.weak_subjects?.length ? (
                  skillGap.weak_subjects.map((subject) => (
                    <div key={`${subject.subject_code}-${subject.subject_name}`} className="rounded-lg border border-cognitia-border px-3 py-2">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <p className="text-sm font-semibold text-cognitia-dark">{subject.subject_code}</p>
                          <p className="text-xs text-cognitia-muted">{subject.subject_name}</p>
                        </div>
                        <span className="text-xs text-cognitia-muted">{formatPercent(subject.score_percent)}</span>
                      </div>
                      <ProgressBar value={subject.score_percent} color="#dc2626" showLabel={false} />
                    </div>
                  ))
                ) : (
                  <EmptyState title="No weak subjects" description="This student currently has no weak subjects." />
                )}
              </div>
            </div>
          ) : (
            <EmptyState title="No skill gap data" description="Skill gap analysis has not been generated yet." />
          )}
        </Card>

        <Card title="Learning Path" delay={0.08} className="xl:col-span-2">
          {learningPath ? (
            <div className="space-y-4">
              <ProgressBar
                value={Number(learningPath.completion_pct ?? 0)}
                label="Completion"
                color="#00C9B1"
                showLabel
              />

              <div className="space-y-2">
                {modulesToShow.map((module) => (
                  <div key={module.module_id} className="rounded-lg border border-cognitia-border px-4 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-3">
                      <span className="inline-flex items-center justify-center h-7 min-w-7 px-2 rounded-full bg-cognitia-bg text-cognitia-dark text-xs font-semibold">
                        {module.sequence_order}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-cognitia-dark truncate">{module.title}</p>
                        <p className="text-xs text-cognitia-muted">{module.domain}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={CATEGORY_BADGE[module.category] ?? 'inactive'}>{module.category}</Badge>
                      <Badge variant={STATUS_BADGE[module.status] ?? 'inactive'}>{titleCase(module.status)}</Badge>
                    </div>
                  </div>
                ))}
              </div>

              <p className="text-sm text-cognitia-muted">
                Showing {modulesToShow.length} of {learningPath.modules?.length ?? 0} modules.
              </p>
            </div>
          ) : (
            <EmptyState title="No learning path" description="No active learning path is available for this student." />
          )}
        </Card>
      </section>
    </div>
  )
}
