import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuth } from '../../hooks/useAuth'
import { login as loginRequest } from '../../services/authService'
import Input from '../../components/ui/Input'
import Button from '../../components/ui/Button'
import BannerPlaceholder from '../../components/ui/BannerPlaceholder'

// ── Validation ────────────────────────────────────────────────────────────────
function validate(values) {
  const errors = {}
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
  return errors
}

const ROLE_HOME = {
  student: '/student',
  faculty: '/faculty',
  admin:   '/admin',
}

// ── Feature bullets ───────────────────────────────────────────────────────────
const FEATURES = [
  'Identify your skill gaps',
  'Get personalised learning paths',
  'Track your academic progress',
]

// ── Left panel ────────────────────────────────────────────────────────────────
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

// ── LoginPage ─────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [values,  setValues]  = useState({ email: '', password: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setValues((v) => ({ ...v, [name]: value }))
    // Clear inline error as user types
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const data = await loginRequest(values.email, values.password)
      // Backend returns: { access_token, token_type, role, user_id }
      const userData = {
        user_id: data.user_id,
        email:   values.email,
        role:    data.role,
      }
      login(userData, data.access_token)
      toast.success(`Welcome back!`)
      navigate(ROLE_HOME[data.role] ?? '/login', { replace: true })
    } catch (err) {
      const status = err?.response?.status
      if (status === 401) {
        toast.error('Invalid email or password')
      } else {
        toast.error('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <AuthLeftPanel />

      {/* ── Right panel ── */}
      <div className="flex items-center justify-center bg-cognitia-bg p-6">
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

          <h2 className="text-2xl font-bold text-cognitia-dark mb-1">Welcome back</h2>
          <p className="text-sm text-cognitia-muted mb-7">Sign in to your account</p>

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
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

            <Button type="submit" variant="primary" loading={loading}>
              Sign In
            </Button>
          </form>

          <p className="text-center text-sm text-cognitia-muted mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-cognitia-teal font-medium hover:underline">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  )
}
