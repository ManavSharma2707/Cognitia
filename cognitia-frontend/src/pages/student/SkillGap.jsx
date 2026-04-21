import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { getSkillGap, recalculate } from '../../services/analysisService'
import { getRecords as getAcademicRecords } from '../../services/academicService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Spinner from '../../components/ui/Spinner'
import ProgressBar from '../../components/ui/ProgressBar'
import BarChart from '../../components/charts/BarChart'
import { formatDate, formatPercent, getPerformanceColor } from '../../utils/formatters'

export default function SkillGap() {
  const [loading, setLoading] = useState(true)
  const [isMissingGap, setIsMissingGap] = useState(false)
  const [error, setError] = useState('')
  const [skillGap, setSkillGap] = useState(null)
  const [records, setRecords] = useState([])
  const [recalculating, setRecalculating] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [skillGapRes, recordsRes] = await Promise.all([
        getSkillGap(),
        getAcademicRecords(),
      ])

      setSkillGap(skillGapRes)
      setRecords(recordsRes?.records ?? [])
      setIsMissingGap(false)
    } catch (err) {
      if (err?.response?.status === 404) {
        setIsMissingGap(true)
        setSkillGap(null)
        setRecords([])
      } else {
        setError(err?.response?.data?.detail ?? 'Unable to load skill gap analysis')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  async function handleRecalculate() {
    setRecalculating(true)
    try {
      await recalculate()
      toast.success('Skill gap recalculated')
      await fetchData()
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to recalculate skill gap')
    } finally {
      setRecalculating(false)
    }
  }

  const chartData = useMemo(() => {
    return records.map((record) => ({
      label: record.subject_name,
      value: Number(record.score_percent ?? 0),
      color: getPerformanceColor(record.performance_level),
    }))
  }, [records])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isMissingGap) {
    return (
      <Card title="Skill Gap Analysis">
        <EmptyState
          title="Skill gap not available"
          description="Add academic records first to generate your skill gap analysis."
        />
      </Card>
    )
  }

  if (error) {
    return (
      <Card title="Skill Gap Analysis">
        <EmptyState title="Unable to load data" description={error} actionLabel="Retry" onAction={fetchData} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-6 lg:grid-cols-5">
        <Card
          title="Skill Gap Summary"
          delay={0}
          className="lg:col-span-2"
          headerAction={
            <Button type="button" onClick={handleRecalculate} loading={recalculating} className="w-auto px-4">
              Recalculate
            </Button>
          }
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-xl bg-red-50 px-4 py-3 flex-1">
                <p className="text-xs text-red-700 uppercase tracking-wide">Weak Subjects</p>
                <p className="text-3xl font-semibold text-red-700 mt-1">{skillGap?.weak_subject_count ?? 0}</p>
              </div>
              <div className="rounded-xl bg-yellow-50 px-4 py-3 flex-1">
                <p className="text-xs text-yellow-700 uppercase tracking-wide">Moderate Subjects</p>
                <p className="text-3xl font-semibold text-yellow-700 mt-1">{skillGap?.moderate_subject_count ?? 0}</p>
              </div>
            </div>

            <div>
              {skillGap?.attendance_at_risk ? (
                <Badge variant="risk">Attendance At Risk</Badge>
              ) : (
                <Badge variant="active">All Clear</Badge>
              )}
            </div>

            <p className="text-sm text-cognitia-muted">Last Updated: {formatDate(skillGap?.generated_at)}</p>
          </div>
        </Card>

        <Card title="Subject Performance Overview" delay={0.05} className="lg:col-span-3">
          {chartData.length ? (
            <BarChart data={chartData} yLabel="Score (%)" height={300} />
          ) : (
            <EmptyState title="No chart data" description="Add academic records to render the performance chart." />
          )}
        </Card>
      </section>

      <Card title="Subjects Requiring Attention" delay={0.1}>
        {skillGap?.weak_subjects?.length ? (
          <div className="space-y-4">
            {skillGap.weak_subjects.map((subject) => (
              <div key={`${subject.subject_code}-${subject.subject_name}`} className="rounded-xl border border-cognitia-border px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-cognitia-dark">{subject.subject_code}</p>
                    <p className="text-sm text-cognitia-muted">{subject.subject_name}</p>
                  </div>
                  <Badge variant="weak">Weak</Badge>
                </div>

                <div className="mt-3">
                  <ProgressBar
                    value={subject.score_percent}
                    label={formatPercent(subject.score_percent)}
                    color="#dc2626"
                    showLabel
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No weak subjects identified" description="Keep up the good work." />
        )}
      </Card>
    </div>
  )
}
