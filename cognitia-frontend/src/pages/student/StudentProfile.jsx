import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getProfile, updateProfile } from '../../services/studentService'
import { useApi } from '../../hooks/useApi'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Spinner from '../../components/ui/Spinner'
import EmptyState from '../../components/ui/EmptyState'
import Avatar from '../../components/ui/Avatar'

const INTEREST_OPTIONS = [
  'Machine Learning',
  'Web Development',
  'DSA',
  'Data Science',
  'Cloud Computing',
  'UI/UX Design',
]

const CAREER_TRACK_OPTIONS = [
  { value: '', label: 'Select career goal' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Web Development', label: 'Web Development' },
  { value: 'DSA', label: 'DSA' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Cloud Computing', label: 'Cloud Computing' },
  { value: 'UI/UX Design', label: 'UI/UX Design' },
]

const INITIAL_FORM = {
  department: '',
  semester: '',
  career_goal: '',
  interests: [],
}

export default function StudentProfile() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  const fetchProfile = useCallback(async () => {
    return getProfile()
  }, [])

  const { data: profile, loading, error, refetch } = useApi(fetchProfile, [])

  useEffect(() => {
    if (!profile) return
    setForm({
      department: profile.department ?? '',
      semester: profile.semester ?? '',
      career_goal: profile.career_goal ?? '',
      interests: profile.interests ?? [],
    })
  }, [profile])

  function validate() {
    const nextErrors = {}
    const semesterNum = Number(form.semester)

    if (!form.department.trim()) {
      nextErrors.department = 'Department is required'
    }
    if (!form.semester) {
      nextErrors.semester = 'Semester is required'
    } else if (Number.isNaN(semesterNum) || semesterNum < 1 || semesterNum > 10) {
      nextErrors.semester = 'Semester must be between 1 and 10'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  function toggleInterest(interest) {
    setForm((prev) => {
      const isSelected = prev.interests.includes(interest)
      return {
        ...prev,
        interests: isSelected
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest],
      }
    })
  }

  async function handleSave(event) {
    event.preventDefault()
    if (!validate()) return

    setSaving(true)
    try {
      await updateProfile({
        department: form.department.trim(),
        semester: Number(form.semester),
        career_goal: form.career_goal || null,
        interests: form.interests,
      })
      toast.success('Profile updated')
      await refetch()
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? 'Unable to update profile')
    } finally {
      setSaving(false)
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
      <Card title="Student Profile">
        <EmptyState message={String(error)} />
      </Card>
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <Card title="Profile Overview" delay={0} className="lg:col-span-2">
        <div className="flex items-center gap-4">
          <Avatar name={profile?.full_name} size="xl" src={profile?.avatar_url} />
          <div>
            <h2 className="text-2xl font-semibold text-cognitia-dark leading-tight">{profile?.full_name}</h2>
            <p className="text-sm text-cognitia-muted mt-1">{profile?.roll_number}</p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-cognitia-light">Department</p>
            <p className="text-sm text-cognitia-dark mt-1">{profile?.department || 'Not set'}</p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cognitia-light">Semester</p>
            <div className="mt-1">
              <Badge variant="student">Semester {profile?.semester ?? '-'}</Badge>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cognitia-light">Interests</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(profile?.interests?.length ? profile.interests : ['No interests set']).map((interest) => (
                <Badge key={interest} variant={interest === 'No interests set' ? 'inactive' : 'active'}>
                  {interest}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-cognitia-light">Career Goal</p>
            <p className="mt-1 text-sm font-medium text-cognitia-teal">{profile?.career_goal || 'Not set'}</p>
          </div>
        </div>
      </Card>

      <Card title="Update Profile" delay={0.05} className="lg:col-span-3">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Department"
            name="department"
            value={form.department}
            onChange={handleChange}
            error={errors.department}
            placeholder="e.g. Computer Science"
            required
          />

          <Input
            label="Semester"
            name="semester"
            type="number"
            min={1}
            max={10}
            value={form.semester}
            onChange={handleChange}
            error={errors.semester}
            placeholder="1 - 10"
            required
          />

          <Select
            label="Career Goal"
            name="career_goal"
            value={form.career_goal}
            onChange={handleChange}
            options={CAREER_TRACK_OPTIONS}
          />

          <div>
            <p className="text-sm font-medium text-cognitia-dark mb-2">Interests</p>
            <div className="flex flex-wrap gap-2">
              {INTEREST_OPTIONS.map((interest) => {
                const selected = form.interests.includes(interest)
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
                      selected
                        ? 'border-cognitia-teal bg-cognitia-teal/10 text-cognitia-teal'
                        : 'border-cognitia-border bg-white text-cognitia-muted hover:text-cognitia-dark'
                    }`}
                  >
                    {interest}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-cognitia-teal text-white text-sm font-medium px-4 py-2.5 hover:opacity-90 disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Card>
    </div>
  )
}
