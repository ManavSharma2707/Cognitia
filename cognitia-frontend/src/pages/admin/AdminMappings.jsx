import { useState } from 'react'
import toast from 'react-hot-toast'
import { createMapping } from '../../services/adminService'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import PageHeader from '../../components/ui/PageHeader'

const INITIAL_FORM = {
  subject_code: '',
  module_id: '',
  priority: 1,
  performance_level_trigger: 'weak',
}

function parseValidationErrors(detail) {
  if (!Array.isArray(detail)) return {}

  const mapped = {}
  detail.forEach((item) => {
    const key = item?.loc?.[item.loc.length - 1]
    if (typeof key === 'string') {
      mapped[key] = item?.msg ?? 'Invalid value'
    }
  })
  return mapped
}

export default function AdminMappings() {
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      await createMapping({
        subject_code: form.subject_code.trim().toUpperCase(),
        module_id: Number(form.module_id),
        priority: Number(form.priority) || 1,
        performance_level_trigger: form.performance_level_trigger,
      })

      toast.success('Mapping created successfully')
      setForm(INITIAL_FORM)
    } catch (err) {
      const status = err?.response?.status
      const detail = err?.response?.data?.detail

      if (status === 409) {
        toast.error('Mapping already exists for this subject and module.')
      } else if (status === 400 || status === 422) {
        const parsed = parseValidationErrors(detail)
        setErrors(parsed)
        if (Object.keys(parsed).length === 0) {
          toast.error('Please review the mapping details and try again.')
        }
      } else {
        toast.error('Could not create mapping right now.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <PageHeader
        title="Admin Mappings"
        subtitle="Configure subject-skill mappings for recommendation logic."
      />

      <Card title="Add Subject-Skill Mapping" subtitle="Mappings are applied immediately to recommendation generation.">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Subject Code"
            name="subject_code"
            value={form.subject_code}
            onChange={updateField}
            placeholder="MATH101"
            error={errors.subject_code}
            required
          />

          <Input
            label="Module ID"
            type="number"
            name="module_id"
            value={form.module_id}
            onChange={updateField}
            placeholder="Use module IDs from the modules table"
            error={errors.module_id}
            required
            min={1}
          />

          <Input
            label="Priority"
            type="number"
            name="priority"
            value={form.priority}
            onChange={updateField}
            error={errors.priority}
            min={1}
          />

          <Select
            label="Performance Level Trigger"
            name="performance_level_trigger"
            value={form.performance_level_trigger}
            onChange={updateField}
            error={errors.performance_level_trigger}
            options={[
              { value: 'weak', label: 'weak' },
              { value: 'moderate', label: 'moderate' },
              { value: 'both', label: 'both' },
            ]}
          />

          <div className="md:col-span-2 flex justify-end">
            <Button type="submit" className="w-auto px-6" loading={loading}>
              Add Mapping
            </Button>
          </div>
        </form>
      </Card>

      <Card title="How Mapping Logic Works">
        <p className="text-sm text-cognitia-muted mb-4">
          Weak subjects are mapped to remediation modules. Performance level trigger determines when the mapping activates.
        </p>

        <div className="overflow-x-auto border border-cognitia-border rounded-xl">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase tracking-wide text-cognitia-muted">
                <th className="px-4 py-3">Trigger Value</th>
                <th className="px-4 py-3">Meaning</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-cognitia-border">
                <td className="px-4 py-3 text-cognitia-dark font-medium">weak</td>
                <td className="px-4 py-3 text-cognitia-muted">Applies only when subject performance is weak.</td>
              </tr>
              <tr className="border-t border-cognitia-border">
                <td className="px-4 py-3 text-cognitia-dark font-medium">moderate</td>
                <td className="px-4 py-3 text-cognitia-muted">Applies when performance is moderate and needs improvement.</td>
              </tr>
              <tr className="border-t border-cognitia-border">
                <td className="px-4 py-3 text-cognitia-dark font-medium">both</td>
                <td className="px-4 py-3 text-cognitia-muted">Applies for both weak and moderate performance levels.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
