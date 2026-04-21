import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { register as registerRequest } from '../../services/authService'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import Select from '../../components/ui/Select'
import BannerPlaceholder from '../../components/ui/BannerPlaceholder'

// ── Validation ────────────────────────────────────────────────────────────────
function validate(values) {
  const errors = {}
  if (!values.full_name?.trim())        errors.full_name   = 'Full name is required'
  if (!values.email) {
    errors.email = 'Email is required'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = 'Enter a valid email address'
  }
  if (!values.password) {
    errors.password = 'Password is required'
  } else if (values.password.length < 8) {
    errors.password = 'Password must be at least 8 characters'
  }
  if (!values.role)           errors.role       = 'Please select a role'
  if (!values.department?.trim()) errors.department = 'Department is required'
  if (values.role === 'student') {
    if (!values.roll_number?.trim()) errors.roll_number = 'Roll number is required'
    const sem = Number(values.semester)
    if (!values.semester)            errors.semester    = 'Semester is required'
    else if (sem < 1 || sem > 10)    errors.semester    = 'Semester must be between 1 and 10'
  }
  return errors
}

// ── Feature bullets (shared with Login) ──────────────────────────────────────
const FEATURES = [
  'Identify your skill gaps',
  'Get personalised learning paths',
  'Track your academic progress',
]

// ── Left panel (same as Login) ────────────────────────────────────────────────
function AuthLeftPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-center items-start p-12 relative overflow-hidden">
      <BannerPlaceholder />
      <div className="relative z-10 max-w-sm mt-16">
        <h1 className="text-4xl font-bold text-white leading-snug mb-3">
          Your personalised<br />academic guidance<br />platform
        </h1>
        <p className="text-white/70 text-sm mb-10">
          Powered by AI to help you reach your full potential.
        </p>
        <ul className="space-y-4">
          {FEATURES.map((f) => (
            <li key={f} className="flex items-center gap-3 text-white/90 text-sm">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ── RegisterPage ──────────────────────────────────────────────────────────────
const INITIAL = {
  full_name:   '',
  email:       '',
  password:    '',
  role:        '',
  department:  '',
  roll_number: '',
  semester:    '',
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [values,  setValues]  = useState(INITIAL)
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
    // Clear student-only errors when role changes away from student
    if (name === 'role' && value !== 'student') {
      setErrors((prev) => ({ ...prev, roll_number: '', semester: '' }))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        full_name:  values.full_name,
        email:      values.email,
        password:   values.password,
        role:       values.role,
        department: values.department,
        ...(values.role === 'student' && {
          roll_number: values.roll_number,
          semester:    Number(values.semester),
        }),
      }
      await registerRequest(payload)
      toast.success('Account created successfully! Please sign in.')
      navigate('/login')
    } catch (err) {
      const status = err?.response?.status
      if (status === 409) {
        toast.error('Email already registered')
        setErrors((prev) => ({ ...prev, email: 'This email is already in use' }))
      } else if (status === 422) {
        toast.error('Please check the form and try again.')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const isStudent = values.role === 'student'

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthLeftPanel />

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center bg-cognitia-bg p-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="w-full max-w-[420px] bg-cognitia-card rounded-2xl shadow-sm border border-cognitia-border p-8"
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-cognitia-teal flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 22 22" fill="none">
                <circle cx="11" cy="11" r="9" stroke="white" strokeWidth="2" />
                <circle cx="11" cy="11" r="4" fill="white" />
              </svg>
            </div>
            <span className="text-cognitia-teal font-bold text-lg">Cognitia</span>
          </div>

          <h2 className="text-2xl font-bold text-cognitia-dark mb-1">Create account</h2>
          <p className="text-sm text-cognitia-muted mb-7">Join Cognitia and start your journey</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full Name"
              name="full_name"
              value={values.full_name}
              onChange={handleChange}
              error={errors.full_name}
              placeholder="Jane Smith"
              required
            />
            <Input
              label="Email address"
              type="email"
              name="email"
              value={values.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              type="password"
              name="password"
              value={values.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="Min. 8 characters"
              required
            />
            <Select
              label="Role"
              name="role"
              value={values.role}
              onChange={handleChange}
              error={errors.role}
              required
              options={[
                { value: '', label: 'Select role' },
                { value: 'student', label: 'Student' },
                { value: 'faculty', label: 'Faculty' },
              ]}
            />
            <Input
              label="Department"
              name="department"
              value={values.department}
              onChange={handleChange}
              error={errors.department}
              placeholder="e.g. Computer Science"
              required
            />

            {/* Student-only fields with AnimatePresence */}
            <AnimatePresence>
              {isStudent && (
                <motion.div
                  key="student-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden space-y-4"
                >
                  <Input
                    label="Roll Number"
                    name="roll_number"
                    value={values.roll_number}
                    onChange={handleChange}
                    error={errors.roll_number}
                    placeholder="e.g. CS2021001"
                    required
                  />
                  <Input
                    label="Semester"
                    type="number"
                    name="semester"
                    value={values.semester}
                    onChange={handleChange}
                    error={errors.semester}
                    placeholder="1 – 10"
                    min={1}
                    max={10}
                    required
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-1">
              <Button type="submit" variant="primary" loading={loading}>
                Create Account
              </Button>
            </div>
          </form>

          <p className="text-center text-sm text-cognitia-muted mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-cognitia-teal font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
