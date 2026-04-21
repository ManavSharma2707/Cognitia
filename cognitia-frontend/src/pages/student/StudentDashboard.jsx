import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartPieIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'
import { getSummary } from '../../services/progressService'
import { getSkillGap } from '../../services/analysisService'
import { getRecords as getAcademicRecords } from '../../services/academicService'
import { generatePath, getLearningPath } from '../../services/recommendationService'
import { useApi } from '../../hooks/useApi'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import BarChart from '../../components/charts/BarChart'
import DonutChart from '../../components/charts/DonutChart'

function toLabel(value = '') {
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function statusVariant(status = '') {
  if (status === 'completed') return 'active'
  if (status === 'in_progress') return 'moderate'
  return 'inactive'
}

function levelVariant(level = '') {
  const normal = String(level).toLowerCase()
  if (normal.includes('advanced') || normal.includes('strong')) return 'strong'
  if (normal.includes('intermediate') || normal.includes('moderate')) return 'moderate'
  return 'weak'
}

function categoryVariant(category = '') {
  const normal = String(category).toLowerCase()
  if (normal.includes('attendance')) return 'risk'
  if (normal.includes('core') || normal.includes('foundation')) return 'student'
  return 'active'
}

export default function StudentDashboard() {
  const [isGeneratingPath, setIsGeneratingPath] = useState(false)

  const fetchDashboardData = useCallback(async () => {
    const getOrNull = async (request) => {
      try {
        const response = await request
        return response.data
      } catch (err) {
        if (err?.response?.status === 404) return null
        throw err
      }
    }

    const [progressSummary, skillGap, academicRecordsResponse, learningPath] = await Promise.all([
      getOrNull(getSummary()),
      getOrNull(getSkillGap()),
      getOrNull(getAcademicRecords()),
      getOrNull(getLearningPath()),
    ])

    return {
      progressSummary,
      skillGap,
      academicRecords: academicRecordsResponse?.records ?? [],
      learningPath,
    }
  }, [])

  const { data, loading, error, refetch } = useApi(fetchDashboardData, [])

  const progressSummary = data?.progressSummary
  const skillGap = data?.skillGap
  const academicRecords = data?.academicRecords ?? []
  const learningPath = data?.learningPath

  const completionPct = Number(progressSummary?.completion_pct ?? 0)
  const weakSubjects = Number(skillGap?.weak_subject_count ?? 0)
  const subjectsEntered = academicRecords.length
  const attendanceAtRisk = skillGap?.attendance_at_risk

  async function handleGenerateLearningPath() {
    setIsGeneratingPath(true)
    try {
      await generatePath()
      toast.success('Learning path generated')
      await refetch()
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to generate learning path')
    } finally {
      setIsGeneratingPath(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card title="Dashboard Overview">
        <EmptyState message={String(error)} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card delay={0} className="min-h-[150px]">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-cognitia-muted text-sm">
                <ChartPieIcon className="h-4 w-4" />
                Overall Completion
              </div>
              <p className="mt-2 text-3xl font-semibold text-cognitia-dark">{Math.round(completionPct)}%</p>
            </div>
            <div className="scale-[0.48] origin-top-right -mr-10 -mt-6 pointer-events-none">
              <DonutChart />
            </div>
          </div>
        </Card>

        <Card delay={0.03} className="min-h-[150px]">
          <div className="flex items-center gap-2 text-cognitia-muted text-sm">
            <BookOpenIcon className="h-4 w-4" />
            Weak Subjects
          </div>
          <p className="mt-2 text-3xl font-semibold text-cognitia-dark">{weakSubjects}</p>
        </Card>

        <Card delay={0.06} className="min-h-[150px]">
          <div className="flex items-center gap-2 text-cognitia-muted text-sm">
            <AcademicCapIcon className="h-4 w-4" />
            Subjects Entered
          </div>
          <p className="mt-2 text-3xl font-semibold text-cognitia-dark">{subjectsEntered}</p>
        </Card>

        <Card delay={0.09} className="min-h-[150px]">
          <div className="flex items-center gap-2 text-cognitia-muted text-sm">
            <ExclamationTriangleIcon className="h-4 w-4" />
            Attendance Risk
          </div>
          <div className="mt-3">
            {attendanceAtRisk === true && <Badge variant="risk">At Risk</Badge>}
            {attendanceAtRisk === false && <Badge variant="active">Safe</Badge>}
            {attendanceAtRisk === undefined && <Badge variant="inactive">Unknown</Badge>}
          </div>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <Card
          title="Current Learning Path"
          subtitle="Top 4 modules from your active path"
          delay={0.12}
          className="xl:col-span-2"
          headerAction={
            <Link to="/student/recommendations" className="text-sm font-medium text-cognitia-teal hover:underline">
              View Full Path
            </Link>
          }
        >
          {learningPath?.modules?.length ? (
            <div className="space-y-3">
              {learningPath.modules.slice(0, 4).map((module, index) => (
                <div
                  key={module.module_id}
                  className="rounded-xl border border-cognitia-border px-4 py-3 flex flex-wrap items-center gap-3"
                >
                  <span className="h-7 w-7 rounded-full bg-cognitia-bg text-cognitia-dark text-xs font-semibold flex items-center justify-center">
                    {module.sequence_order ?? index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-cognitia-dark truncate">{module.title}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <Badge variant={categoryVariant(module.category)}>{toLabel(module.category)}</Badge>
                      <Badge variant={levelVariant(module.level)}>{toLabel(module.level)}</Badge>
                      <Badge variant={statusVariant(module.status)}>{toLabel(module.status)}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <EmptyState message="Generate your learning path" />
              <button
                type="button"
                onClick={handleGenerateLearningPath}
                disabled={isGeneratingPath}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-cognitia-teal text-white text-sm font-medium px-4 py-2 hover:opacity-90 disabled:opacity-60"
              >
                {isGeneratingPath ? 'Generating...' : 'Generate Learning Path'}
              </button>
            </div>
          )}
        </Card>

        <Card title="Skill Gap Summary" subtitle="Chart coming in Prompt 10" delay={0.15}>
          {academicRecords.length ? (
            <div className="space-y-4">
              <BarChart />
              <div className="space-y-2">
                {academicRecords.slice(0, 6).map((record) => (
                  <div key={record.record_id} className="flex items-center justify-between gap-3">
                    <p className="text-sm text-cognitia-dark truncate">{record.subject_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cognitia-muted">{Math.round(record.score_percent)}%</span>
                      <Badge variant={levelVariant(record.performance_level)}>{toLabel(record.performance_level)}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <EmptyState message="Add academic records to view your performance overview." />
              <Link
                to="/student/academic"
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-cognitia-teal text-white text-sm font-medium px-4 py-2 hover:opacity-90"
              >
                Go to Academic Records
              </Link>
            </div>
          )}
        </Card>
      </section>
    </div>
  )
}
