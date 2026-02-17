import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'
import logo from '../assets/stockwise-logo.svg'

const Login = () => {
  const { user, login, loading } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      navigate('/dashboard')
    }
  }, [user, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const result = await login(form)
    if (!result.success) {
      setError(result.message)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-5">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:col-span-2 flex-col justify-center px-12 py-12 xl:px-14 xl:py-14 bg-(--surface-muted) text-ink relative border border-(--border) lg:rounded-3xl lg:my-8 lg:ml-8 shadow-sm">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-12 h-12 rounded-2xl bg-(--surface) shadow-sm flex items-center justify-center">
              <img src={logo} alt="StockWise" className="h-9 w-9" />
            </div>
            <span className="text-2xl font-bold">StockWise</span>
          </div>

          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-4">
            Inventory,<br />simplified
          </h1>
          <p className="text-base text-muted mb-8 max-w-sm">
            Clear views. Faster counts. Cleaner reports.
          </p>

          {/* Features */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-(--surface) shadow-sm flex items-center justify-center shrink-0">
                <span className="text-xl">🧭</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Clear stock signals</h3>
                <p className="text-muted text-sm">See what needs attention quickly.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-(--surface) shadow-sm flex items-center justify-center shrink-0">
                <span className="text-xl">🧾</span>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Quick stock checks</h3>
                <p className="text-muted text-sm">Confirm items in a tap.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-start justify-center px-6 py-14 lg:px-16 lg:col-span-3 lg:pt-16">
        <div className="w-full max-w-lg">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-2xl bg-(--primary)/10 flex items-center justify-center">
              <img src={logo} alt="StockWise" className="h-7 w-7" />
            </div>
            <span className="text-xl font-bold text-ink">StockWise</span>
          </div>

          <div>
            <h2 className="text-3xl font-bold text-ink">Welcome back</h2>
            <p className="mt-4 text-base text-muted">Sign in to access your inventory dashboard and manage your stock.</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-ink mb-3">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@company.com"
                className="w-full rounded-2xl input-field px-4 py-4 text-base"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-ink mb-3">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full rounded-2xl input-field px-4 py-4 text-base"
                required
              />
            </div>

            {error && (
              <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 flex items-start gap-3">
                <span className="text-red-600 text-lg">⚠</span>
                <p className="text-sm text-red-600 flex-1">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-7 rounded-full btn-primary px-4 py-4 text-base font-semibold transition disabled:opacity-70 shadow-lg hover:shadow-xl"
            >
              {loading ? '⏳ Signing in...' : '🔓 Sign in to your account'}
            </button>
          </form>

          {/* Demo Credentials Card */}
          <div className="mt-10 rounded-2xl border border-(--border) bg-(--surface-muted) p-5">
            <p className="text-xs font-semibold text-ink mb-2">🎯 Demo Credentials</p>
            <div className="space-y-1 text-xs text-muted">
              <p><span className="font-medium">Admin:</span> admin@test.com / admin123</p>
              <p><span className="font-medium">Staff:</span> user@test.com / user123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
