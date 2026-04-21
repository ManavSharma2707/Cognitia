import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { addTrackModule } from '../../services/adminService'
import { getCareerTracks, getTrackModules } from '../../services/recommendationService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Badge from '../../components/ui/Badge'
import PageHeader from '../../components/ui/PageHeader'

const INITIAL_FORM = {
  module_id: '',
  sequence_order: 1,
}

function levelVariant(level) {
  if (!level) return 'inactive'
  const value = level.toLowerCase()
  if (value.includes('beginner')) return 'student'
  if (value.includes('intermediate')) return 'moderate'
  if (value.includes('advanced')) return 'strong'
  return 'active'
}

export default function AdminTracks() {
  const [tracks, setTracks] = useState([])
  const [loadingTracks, setLoadingTracks] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState(null)
  const [modules, setModules] = useState([])
  const [loadingModules, setLoadingModules] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    async function loadTracks() {
      setLoadingTracks(true)
      try {
        const data = await getCareerTracks()
        setTracks(data?.tracks ?? [])
      } catch {
        toast.error('Unable to load career tracks')
      } finally {
        setLoadingTracks(false)
      }
    }

    loadTracks()
  }, [])

  async function fetchModules(trackId) {
    setLoadingModules(true)
    try {
      const data = await getTrackModules(trackId)
      const sortedModules = [...(data?.modules ?? [])].sort(
        (a, b) => (a.sequence_order ?? 9999) - (b.sequence_order ?? 9999),
      )
      setModules(sortedModules)
    } catch {
      toast.error('Unable to load modules for this track')
      setModules([])
    } finally {
      setLoadingModules(false)
    }
  }

  function selectTrack(track) {
    setSelectedTrack(track)
    setForm(INITIAL_FORM)
    fetchModules(track.track_id)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    if (!selectedTrack) return

    setSubmitting(true)
    try {
      await addTrackModule(selectedTrack.track_id, {
        module_id: Number(form.module_id),
        sequence_order: Number(form.sequence_order) || 1,
      })

      toast.success('Module added to track')
      setForm(INITIAL_FORM)
      await fetchModules(selectedTrack.track_id)

      const data = await getCareerTracks()
      setTracks(data?.tracks ?? [])
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) {
        toast.error('Module already exists in this track.')
      } else if (status === 404) {
        toast.error('Track not found.')
      } else {
        toast.error('Could not add module to this track.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Tracks"
        subtitle="Manage career tracks and attach modules in sequence."
      />

      <section className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        <Card title="Career Tracks" subtitle="Select a track to manage modules" className="xl:col-span-3">
          {loadingTracks ? (
            <p className="text-sm text-cognitia-muted">Loading tracks...</p>
          ) : tracks.length === 0 ? (
            <p className="text-sm text-cognitia-muted">No active tracks found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.map((track) => {
                const isSelected = selectedTrack?.track_id === track.track_id
                return (
                  <button
                    key={track.track_id}
                    type="button"
                    onClick={() => selectTrack(track)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      isSelected
                        ? 'border-cognitia-teal bg-cognitia-teal/5'
                        : 'border-cognitia-border hover:border-cognitia-teal/60'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-cognitia-dark">{track.domain}</h3>
                      <Badge variant="active">{track.module_count} modules</Badge>
                    </div>
                    <p className="text-sm text-cognitia-muted mt-2 line-clamp-3">
                      {track.description || 'No description available.'}
                    </p>
                  </button>
                )
              })}
            </div>
          )}
        </Card>

        <Card
          className="xl:col-span-2"
          title={selectedTrack ? `Add Module to ${selectedTrack.domain}` : 'Select a Track'}
          subtitle={selectedTrack ? 'Attach an existing module with sequence order.' : 'Choose a track from the left panel.'}
        >
          {selectedTrack ? (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Module ID"
                  type="number"
                  name="module_id"
                  value={form.module_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, module_id: e.target.value }))}
                  min={1}
                  required
                />

                <Input
                  label="Sequence Order"
                  type="number"
                  name="sequence_order"
                  value={form.sequence_order}
                  onChange={(e) => setForm((prev) => ({ ...prev, sequence_order: e.target.value }))}
                  min={1}
                  required
                />

                <Button type="submit" loading={submitting}>
                  Add Module
                </Button>
              </form>

              <div className="mt-6 pt-5 border-t border-cognitia-border">
                <h3 className="text-sm font-semibold text-cognitia-dark mb-3">Track Modules Preview</h3>

                {loadingModules ? (
                  <p className="text-sm text-cognitia-muted">Loading modules...</p>
                ) : modules.length === 0 ? (
                  <p className="text-sm text-cognitia-muted">No modules assigned yet.</p>
                ) : (
                  <ul className="space-y-3">
                    {modules.map((module) => (
                      <li key={module.module_id} className="rounded-lg border border-cognitia-border p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-cognitia-dark">{module.title}</p>
                            <p className="text-xs text-cognitia-muted mt-1">Domain: {module.domain}</p>
                          </div>
                          <div className="flex gap-2 items-center">
                            <Badge variant="inactive">#{module.sequence_order ?? '-'}</Badge>
                            <Badge variant={levelVariant(module.level)}>{module.level}</Badge>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-cognitia-muted">Select a track card to open the module assignment form.</p>
          )}
        </Card>
      </section>
    </div>
  )
}
