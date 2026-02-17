import { NavLink } from 'react-router-dom'
import logo from '../assets/stockwise-logo.svg'
import useAuth from '../hooks/useAuth.js'
import { useEffect, useState } from 'react'

const linkClass = ({ isActive }) =>
  `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-[color:var(--primary-soft)] text-[color:var(--primary-strong)]'
      : 'text-muted hover:bg-[color:var(--surface-muted)]'
  }`

const Navbar = () => {
  const { user, logout } = useAuth()
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('ims_theme')
    if (stored) return stored
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('ims_theme', theme)
  }, [theme])

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'))
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b theme-border bg-(--surface)/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <img src={logo} alt="StockWise" className="h-10 w-10" />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted">Inventory</p>
            <h1 className="text-lg font-semibold text-ink">StockWise</h1>
          </div>
        </div>

        {user && (
          <nav className="flex items-center gap-2">
            <NavLink to="/dashboard" className={linkClass}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={linkClass}>
              Products
            </NavLink>
            <NavLink to="/stock-history" className={linkClass}>
              Stock Logs
            </NavLink>
            {user.role === 'ADMIN' && (
              <NavLink to="/users" className={linkClass}>
                Users
              </NavLink>
            )}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="rounded-full border theme-border bg-(--surface-muted) px-3 py-1 text-xs font-semibold text-muted">
                {user.role}
              </span>
              <button
                onClick={toggleTheme}
                className="rounded-full btn-outline px-3 py-2 text-xs font-semibold"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <button
                onClick={logout}
                className="rounded-full btn-outline px-4 py-2 text-sm font-semibold"
              >
                Sign out
              </button>
            </>
          ) : (
            <span className="text-sm text-muted">Secure inventory access</span>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
