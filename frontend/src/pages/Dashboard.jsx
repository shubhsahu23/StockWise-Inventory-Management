import { useEffect, useState } from 'react'
import Charts from '../components/Charts.jsx'
import { fetchDashboardSummary } from '../api/stockApi.js'
import { fetchProducts } from '../api/productApi.js'
import { formatDate } from '../utils/formatDate.js'

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [filters, setFilters] = useState({ days: '7', category: '' })
  const [categories, setCategories] = useState([])

  const loadCategories = async () => {
    try {
      const res = await fetchProducts({ limit: 500 })
      const uniqueCategories = [...new Set(res.data.data.items.map(p => p.category))]
      setCategories(uniqueCategories.filter(Boolean))
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const loadSummary = async () => {
    setLoading(true)
    setError('')
    try {
      const params = {}
      if (filters.days) params.days = filters.days
      if (filters.category) params.category = filters.category
      const res = await fetchDashboardSummary(params)
      setSummary(res.data.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    loadSummary()
  }, [filters])

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="grid gap-8">
      <div className="rounded-3xl theme-surface p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-semibold text-ink">Inventory pulse</h2>
            <p className="text-sm text-muted">Live snapshot of stock levels and movement.</p>
          </div>
          <button
            onClick={loadSummary}
            disabled={loading}
            className="rounded-full btn-outline px-4 py-2 text-sm font-semibold disabled:opacity-70"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          <label className="text-muted grid gap-2 text-sm">
            Time Period
            <select
              name="days"
              value={filters.days}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="7">Last 7 days</option>
              <option value="14">Last 14 days</option>
              <option value="30">Last 30 days</option>
              <option value="60">Last 60 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </label>
          <label className="text-muted grid gap-2 text-sm">
            Category
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={loadSummary}
            className="btn-primary self-end rounded-full px-4 py-2 text-sm font-semibold"
          >
            Apply Filters
          </button>
        </div>
        {error && (
          <div className="mt-4 rounded-2xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}
        {!summary && !loading && !error && (
          <div className="mt-4 rounded-2xl border theme-border bg-(--surface-muted) px-4 py-3 text-sm text-muted">
            No data yet. Click refresh to load inventory stats.
          </div>
        )}
      </div>

      {summary && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-3xl theme-surface p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Products</p>
              <p className="mt-2 text-2xl font-semibold text-ink">{summary.totalProducts}</p>
            </div>
            <div className="rounded-3xl theme-surface p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Low stock</p>
              <p className="mt-2 text-2xl font-semibold text-(--primary-strong)">{summary.lowStockCount}</p>
            </div>
            <div className="rounded-3xl theme-surface p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Total In</p>
              <p className="mt-2 text-2xl font-semibold text-(--primary)">{summary.totalStockIn}</p>
            </div>
            <div className="rounded-3xl theme-surface p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-muted">Total Out</p>
              <p className="mt-2 text-2xl font-semibold text-(--accent)">{summary.totalStockOut}</p>
            </div>
          </div>

          <Charts trend={summary.movementTrend} days={filters.days} />

          <div className="rounded-3xl theme-surface p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-ink">Recent stock activity</h3>
                <p className="text-sm text-muted">Most recent adjustments across the warehouse.</p>
              </div>
              <div className="rounded-full border theme-border bg-(--surface-muted) px-3 py-1 text-xs text-muted">
                {summary.recentLogs.length} entries
              </div>
            </div>
            <div className="mt-4 overflow-hidden rounded-2xl border theme-border">
              <table className="w-full text-left text-sm text-ink">
                <thead className="table-head text-xs uppercase tracking-widest">
                  <tr>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantity</th>
                    <th className="px-4 py-3">Updated by</th>
                    <th className="px-4 py-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.recentLogs.map((log) => (
                    <tr key={log._id} className="table-row">
                      <td className="px-4 py-3">{log.productId?.name}</td>
                      <td className="px-4 py-3">{log.type}</td>
                      <td className="px-4 py-3">{log.quantity}</td>
                      <td className="px-4 py-3">{log.updatedBy?.name}</td>
                      <td className="px-4 py-3 text-muted">{formatDate(log.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Dashboard
