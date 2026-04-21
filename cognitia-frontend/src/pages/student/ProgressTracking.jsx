import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { getSummary, updateModuleStatus } from '../../services/progressService'
import { getHistory as getRecommendationHistory } from '../../services/recommendationService'
import LineChart from '../../components/charts/LineChart'
import DonutChart from '../../components/charts/DonutChart'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import EmptyState from '../../components/ui/EmptyState'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner from '../../components/ui/Spinner'
import { formatDate } from '../../utils/formatters'

const STATUS_ORDER = ['not_started', 'in_progress', 'completed']

const STATUS_LABELS = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const STATUS_STYLES = {
  not_started: 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200',
  in_progress: 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200',
  completed: 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200',
}

const CATEGORY_BADGE = {
  'Academic Remediation': 'weak',
  'Career Skill': 'active',
  'Interest-Based': 'student',
  'Attendance Recovery': 'risk',
}

function shortDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(isoDate)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

function recomputeCounts(modules = []) {
  return modules.reduce(
    (acc, module) => {
      const key = STATUS_ORDER.includes(module.status) ? module.status : 'not_started'
      acc[key] += 1
      return acc
    },
    { completed: 0, in_progress: 0, not_started: 0 },
  )
}

function patchSummaryWithModules(summary, modules) {
  const counts = recomputeCounts(modules)
  const total = modules.length
  const completionPct = total > 0 ? Number(((counts.completed / total) * 100).toFixed(2)) : 0
  return {
    ...summary,
    modules,
    total_modules: total,
    completed: counts.completed,
    in_progress: counts.in_progress,
    not_started: counts.not_started,
    completion_pct: completionPct,
  }
}

export default function ProgressTracking() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [summary, setSummary] = useState(null)
  const [historyLoading, setHistoryLoading] = useState(true)
  const [history, setHistory] = useState([])
  const [updatingModuleId, setUpdatingModuleId] = useState(null)

  const fetchSummary = useCallback(async () => {
    try {
      const response = await getSummary()
      setSummary(response)
      setError('')
    } catch (err) {
      const detail = err?.response?.data?.detail
      setSummary(null)
      setError(detail ?? 'Unable to load progress summary')
    }
  }, [])

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true)
    try {
      const response = await getRecommendationHistory()
      setHistory(response?.paths ?? [])
    } catch {
      setHistory([])
    } finally {
      setHistoryLoading(false)
    }
  }, [])

  const loadPage = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchSummary(), fetchHistory()])
    setLoading(false)
  }, [fetchSummary, fetchHistory])

  useEffect(() => {
    loadPage()
  }, [loadPage])

  const trendData = useMemo(() => {
    return [...history]
      .sort((a, b) => new Date(a.generated_at) - new Date(b.generated_at))
      .map((item) => ({
        label: shortDate(item.generated_at),
        value: Number(item.completion_pct ?? 0),
      }))
  }, [history])

  async function handleStatusChange(moduleId, nextStatus) {
    if (!summary || !STATUS_ORDER.includes(nextStatus)) return

    const previousSummary = summary
    const nextModules = summary.modules.map((module) =>
      module.module_id === moduleId ? { ...module, status: nextStatus } : module,
    )

    setUpdatingModuleId(moduleId)
    setSummary(patchSummaryWithModules(summary, nextModules))

    try {
      const response = await updateModuleStatus(moduleId, nextStatus)

      setSummary((curr) => {
        if (!curr) return curr
        return {
          ...curr,
          completion_pct: Number(response?.new_completion_pct ?? curr.completion_pct),
        }
      })

      toast.success('Module status updated', { duration: 1600 })
    } catch (err) {
      setSummary(previousSummary)
      toast.error(err?.response?.data?.detail ?? 'Unable to update module status')
    } finally {
      setUpdatingModuleId(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (!summary) {
    return (
      <Card title="Progress Tracking">
        <EmptyState
          title="No active progress data"
          description={error || 'Generate a learning path to start tracking module progress.'}
          actionLabel="Retry"
          onAction={loadPage}
        />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50" delay={0}>
          <p className="text-xs uppercase tracking-wide text-green-700">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-green-700">{summary.completed}</p>
        </Card>

        <Card className="bg-orange-50" delay={0.03}>
          <p className="text-xs uppercase tracking-wide text-orange-700">In Progress</p>
          <p className="mt-2 text-3xl font-semibold text-orange-700">{summary.in_progress}</p>
        </Card>

        <Card className="bg-gray-100" delay={0.06}>
          <p className="text-xs uppercase tracking-wide text-gray-700">Not Started</p>
          <p className="mt-2 text-3xl font-semibold text-gray-700">{summary.not_started}</p>
        </Card>
      </section>

      <section className="grid gap-6 xl:grid-cols-5">
        <Card title="Completion Overview" className="xl:col-span-2" delay={0.08}>
          <DonutChart
            completed={summary.completed}
            inProgress={summary.in_progress}
            notStarted={summary.not_started}
            size="md"
          />

          <div className="mt-4">
            <ProgressBar
              value={Number(summary.completion_pct ?? 0)}
              label="Overall Completion"
              color="#00C9B1"
              showLabel
            />
          </div>
        </Card>

        <Card title="Module Progress" className="xl:col-span-3" delay={0.1}>
          {!summary.modules?.length ? (
            <EmptyState title="No modules available" description="Your active learning path has no modules yet." />
          ) : (
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {summary.modules.map((module, idx) => (
                <motion.div
                  key={module.module_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: idx * 0.03 }}
                  className="rounded-xl border border-cognitia-border px-4 py-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-cognitia-dark truncate">{module.title}</p>
                      <p className="text-xs text-cognitia-muted mt-0.5">{module.domain}</p>
                    </div>
                    <Badge variant={CATEGORY_BADGE[module.category] ?? 'inactive'}>{module.category}</Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {STATUS_ORDER.map((status) => {
                      const isActive = module.status === status
                      return (
                        <button
                          key={status}
                          type="button"
                          disabled={updatingModuleId === module.module_id}
                          onClick={() => handleStatusChange(module.module_id, status)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                            isActive
                              ? STATUS_STYLES[status]
                              : 'bg-white text-cognitia-muted border-cognitia-border hover:bg-cognitia-bg'
                          }`}
                        >
                          {STATUS_LABELS[status]}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </section>

      <Card title="Learning Path History - Completion Trend" delay={0.12}>
        {historyLoading ? (
          <div className="py-8 flex items-center justify-center">
            <Spinner />
          </div>
        ) : !trendData.length ? (
          <EmptyState title="No history available" description="Generate a learning path to start seeing completion trends." />
        ) : (
          <>
            {trendData.length === 1 && (
              <p className="text-sm text-cognitia-muted mb-3">
                More data will appear as you generate new paths. Latest snapshot on {formatDate(history[0]?.generated_at)}.
              </p>
            )}
            <LineChart data={trendData} color="#00C9B1" />
          </>
        )}
      </Card>
    </div>
  )
}
