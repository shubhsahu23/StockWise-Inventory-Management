import { useEffect, useState } from 'react'
import StockForm from '../components/StockForm.jsx'
import { fetchStockLogs, stockIn, stockOut } from '../api/stockApi.js'
import { fetchProducts } from '../api/productApi.js'
import { formatDate } from '../utils/formatDate.js'

const StockHistory = () => {
  const [products, setProducts] = useState([])
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState({ productId: '', type: '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadProducts = async () => {
    try {
      const res = await fetchProducts({ limit: 200 })
      setProducts(res.data.data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    }
  }

  const loadLogs = async () => {
    try {
      const res = await fetchStockLogs({ ...filters, limit: 50 })
      setLogs(res.data.data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load stock logs')
    }
  }

  useEffect(() => {
    loadProducts()
    loadLogs()
  }, [])

  const handleSubmit = async (payload) => {
    setMessage('')
    setError('')
    try {
      if (payload.type === 'IN') {
        await stockIn({ productId: payload.productId, quantity: payload.quantity })
        setMessage('Stock added')
      } else {
        await stockOut({ productId: payload.productId, quantity: payload.quantity })
        setMessage('Stock removed')
      }
      loadLogs()
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Stock update failed')
    }
  }

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    loadLogs()
  }

  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-ink text-3xl font-semibold">Stock history</h2>
          <p className="text-muted text-sm">Audit trail of inbound and outbound movements.</p>
        </div>
        <button
          onClick={loadLogs}
          className="btn-outline rounded-full px-4 py-2 text-sm font-semibold"
        >
          Refresh
        </button>
      </div>

      {message && <p className="rounded-2xl bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{message}</p>}
      {error && <p className="rounded-2xl bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}

      <StockForm products={products} onSubmit={handleSubmit} />

      <div className="theme-surface grid gap-4 rounded-3xl p-6 md:grid-cols-3">
        <label className="text-muted grid gap-2 text-sm">
          Product
          <select
            name="productId"
            value={filters.productId}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All products</option>
            {products.map((product) => (
              <option key={product._id} value={product._id}>
                {product.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-muted grid gap-2 text-sm">
          Type
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="input-field"
          >
            <option value="">All</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </label>
        <button
          onClick={applyFilters}
          className="btn-primary rounded-full px-4 py-2 text-sm font-semibold"
        >
          Apply filters
        </button>
      </div>

      <div className="theme-surface overflow-hidden rounded-3xl">
        <table className="text-ink w-full text-left text-sm">
          <thead className="table-head">
            <tr>
              <th className="px-5 py-4">Product</th>
              <th className="px-5 py-4">SKU</th>
              <th className="px-5 py-4">Type</th>
              <th className="px-5 py-4">Quantity</th>
              <th className="px-5 py-4">Updated by</th>
              <th className="px-5 py-4">Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log._id} className="table-row">
                <td className="px-5 py-4">{log.productId?.name}</td>
                <td className="text-muted px-5 py-4">{log.productId?.sku}</td>
                <td className="text-muted px-5 py-4">{log.type}</td>
                <td className="text-muted px-5 py-4">{log.quantity}</td>
                <td className="text-muted px-5 py-4">{log.updatedBy?.name}</td>
                <td className="text-muted px-5 py-4">{formatDate(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default StockHistory
