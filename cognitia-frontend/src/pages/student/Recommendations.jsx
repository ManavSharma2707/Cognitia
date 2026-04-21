import { Fragment, useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  generatePath,
  getCareerTracks,
  getHistory,
  getLearningPath,
  getTrackModules,
} from '../../services/recommendationService'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Button from '../../components/ui/Button'
import EmptyState from '../../components/ui/EmptyState'
import Modal from '../../components/ui/Modal'
import ProgressBar from '../../components/ui/ProgressBar'
import Spinner from '../../components/ui/Spinner'
import { formatDate, truncate } from '../../utils/formatters'

const CATEGORY_BADGE = {
  'Academic Remediation': 'weak',
  'Career Skill': 'active',
  'Interest-Based': 'student',
  'Attendance Recovery': 'risk',
}

const LEVEL_BADGE = {
  beginner: 'strong',
  intermediate: 'moderate',
  advanced: 'weak',
}

const STATUS_BADGE = {
  completed: 'active',
  in_progress: 'moderate',
  not_started: 'inactive',
}

function prettify(value = '') {
  return String(value)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function Recommendations() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [path, setPath] = useState(null)
  const [tracks, setTracks] = useState([])
  const [regenerating, setRegenerating] = useState(false)

  const [isHistoryOpen, setIsHistoryOpen] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyItems, setHistoryItems] = useState([])

  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false)
  const [trackModulesLoading, setTrackModulesLoading] = useState(false)
  const [trackModules, setTrackModules] = useState([])
  const [activeTrack, setActiveTrack] = useState(null)

  const fetchBaseData = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [pathRes, tracksRes] = await Promise.all([
        getLearningPath(),
        getCareerTracks(),
      ])

      setPath(pathRes)
      setTracks(tracksRes?.tracks ?? [])
    } catch (err) {
      setError(err?.response?.data?.detail ?? 'Unable to load recommendations')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBaseData()
  }, [fetchBaseData])

  async function handleRegeneratePath() {
    setRegenerating(true)
    try {
      await generatePath()
      toast.success('New learning path generated')
      await fetchBaseData()
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to regenerate path')
    } finally {
      setRegenerating(false)
    }
  }

  async function openHistoryModal() {
    setIsHistoryOpen(true)
    setHistoryLoading(true)
    try {
      const response = await getHistory()
      setHistoryItems(response?.paths ?? [])
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to load path history')
      setHistoryItems([])
    } finally {
      setHistoryLoading(false)
    }
  }

  async function openTrackModules(track) {
    setActiveTrack(track)
    setIsTrackModalOpen(true)
    setTrackModulesLoading(true)

    try {
      const response = await getTrackModules(track.track_id)
      const ordered = [...(response?.modules ?? [])].sort((a, b) => (a.sequence_order ?? 0) - (b.sequence_order ?? 0))
      setTrackModules(ordered)
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to load track modules')
      setTrackModules([])
    } finally {
      setTrackModulesLoading(false)
    }
  }

  const groupedModules = useMemo(() => {
    const groups = new Map()
    for (const module of path?.modules ?? []) {
      const key = module.category || 'Other'
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key).push(module)
    }
    return Array.from(groups.entries())
  }, [path])

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <Card title="Recommendations">
        <EmptyState title="Unable to load recommendations" description={error} actionLabel="Retry" onAction={fetchBaseData} />
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card
        title="Current Learning Path"
        subtitle={`Generated on ${formatDate(path?.generated_at)}`}
        delay={0}
        headerAction={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={openHistoryModal}
              className="text-sm font-medium text-cognitia-teal hover:underline"
            >
              Path History
            </button>
            <Button type="button" variant="secondary" onClick={handleRegeneratePath} loading={regenerating} className="w-auto px-4">
              Regenerate Path
            </Button>
          </div>
        }
      >
        <ProgressBar value={Number(path?.completion_pct ?? 0)} label="Completion" color="#00C9B1" showLabel />
      </Card>

      <Card title="Your Learning Modules" delay={0.05}>
        {!path?.modules?.length ? (
          <EmptyState title="No active modules" description="Generate your path to see recommendations." />
        ) : (
          <div className="space-y-6">
            {groupedModules.map(([category, modules]) => (
              <div key={category} className="space-y-3">
                <div className="pt-1 border-t border-cognitia-border first:border-t-0 first:pt-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cognitia-muted">{category}</p>
                </div>

                <div className="space-y-2">
                  {modules.map((module, idx) => (
                    <motion.div
                      key={module.module_id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.05 }}
                      className="rounded-xl border border-cognitia-border px-4 py-3"
                    >
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center justify-center rounded-full bg-cognitia-teal/10 text-cognitia-teal text-xs font-semibold px-2.5 py-1">
                          #{module.sequence_order}
                        </span>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-cognitia-dark truncate">{truncate(module.title, 64)}</p>
                          <p className="text-xs text-cognitia-muted mt-0.5">{module.domain}</p>
                        </div>

                        <Badge variant={CATEGORY_BADGE[module.category] ?? 'inactive'}>{module.category}</Badge>
                        <Badge variant={LEVEL_BADGE[String(module.level).toLowerCase()] ?? 'inactive'}>{prettify(module.level)}</Badge>
                        <Badge variant={STATUS_BADGE[module.status] ?? 'inactive'}>{prettify(module.status)}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card title="Available Career Tracks" subtitle="Read-only track explorer for students" delay={0.1}>
        {tracks.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tracks.map((track) => (
              <div key={track.track_id} className="rounded-xl border border-cognitia-border p-4">
                <p className="text-base font-semibold text-cognitia-dark">{track.domain}</p>
                <p className="mt-1 text-sm text-cognitia-muted">{track.module_count} modules</p>
                <p className="mt-2 text-xs text-cognitia-muted min-h-8">{track.description || 'No description available.'}</p>
                <div className="mt-3">
                  <Button type="button" variant="secondary" onClick={() => openTrackModules(track)} className="w-auto px-4 py-2">
                    View Modules
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No career tracks available" description="Please check again later." />
        )}
      </Card>

      <Modal isOpen={isHistoryOpen} onClose={() => setIsHistoryOpen(false)} title="Path History" size="md">
        {historyLoading ? (
          <div className="py-6 flex items-center justify-center">
            <Spinner />
          </div>
        ) : historyItems.length ? (
          <div className="space-y-3">
            {historyItems.map((item) => (
              <div key={item.path_id} className="rounded-lg border border-cognitia-border px-4 py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-cognitia-dark">Path #{item.path_id}</p>
                  <p className="text-xs text-cognitia-muted">{formatDate(item.generated_at)} · {item.module_count} modules</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={item.is_current ? 'active' : 'inactive'}>{item.is_current ? 'Current' : 'Archived'}</Badge>
                  <span className="text-sm text-cognitia-dark font-medium">{Number(item.completion_pct ?? 0).toFixed(2)}%</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState title="No path history" description="Your generated paths will appear here." />
        )}
      </Modal>

      <Modal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        title={activeTrack ? `${activeTrack.domain} Modules` : 'Track Modules'}
        size="lg"
      >
        {trackModulesLoading ? (
          <div className="py-6 flex items-center justify-center">
            <Spinner />
          </div>
        ) : trackModules.length ? (
          <div className="space-y-2">
            {trackModules.map((module, idx) => (
              <Fragment key={module.module_id}>
                <div className="rounded-lg border border-cognitia-border px-4 py-3 flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-cognitia-dark">{idx + 1}. {module.title}</p>
                    <p className="text-xs text-cognitia-muted">{module.domain}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={CATEGORY_BADGE[module.category] ?? 'inactive'}>{module.category}</Badge>
                    <Badge variant={LEVEL_BADGE[String(module.level).toLowerCase()] ?? 'inactive'}>{prettify(module.level)}</Badge>
                  </div>
                </div>
              </Fragment>
            ))}
          </div>
        ) : (
          <EmptyState title="No modules found" description="This track has no modules configured." />
        )}
      </Modal>
    </div>
  )
}
