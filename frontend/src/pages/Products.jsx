import { useEffect, useState } from 'react'
import useAuth from '../hooks/useAuth.js'
import ProductTable from '../components/ProductTable.jsx'
import BulkUpdateModal from '../components/BulkUpdateModal.jsx'
import BarcodeModal from '../components/BarcodeModal.jsx'
import {
  fetchProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductsCsv,
  exportProductsExcel,
  exportProductsPDF,
  exportStockReport,
  importProductsCsv,
  bulkUpdateProducts,
  bulkDeleteProducts
} from '../api/productApi.js'

const emptyForm = {
  name: '',
  sku: '',
  category: 'Electronics & Computer Accessories',
  supplier: '',
  price: 0,
  quantity: 0,
  reorderLevel: 0
}

const Products = () => {
  const { user } = useAuth()
  const isAdmin = user?.role === 'ADMIN'
  const [products, setProducts] = useState([])
  const [filters, setFilters] = useState({ search: '', category: '', supplier: '', lowStock: '' })
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [csvFile, setCsvFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [selectedIds, setSelectedIds] = useState([])
  const [showBulkModal, setShowBulkModal] = useState(false)
  const [showBarcodeModal, setShowBarcodeModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)

  const loadProducts = async () => {
    try {
      const res = await fetchProducts({
        ...filters,
        lowStock: filters.lowStock || undefined,
        page: 1,
        limit: 50
      })
      setProducts(res.data.data.items)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    loadProducts()
  }

  const handleFormChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEdit = (product) => {
    setEditingId(product._id)
    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      supplier: product.supplier,
      price: product.price,
      quantity: product.quantity,
      reorderLevel: product.reorderLevel
    })
  }

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}?`)) return
    try {
      await deleteProduct(product._id)
      setMessage('Product deleted')
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete product')
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    try {
      if (editingId) {
        await updateProduct(editingId, form)
        setMessage('Product updated')
      } else {
        await createProduct(form)
        setMessage('Product created')
      }
      setForm(emptyForm)
      setEditingId(null)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product')
    }
  }

  const resetForm = () => {
    setForm(emptyForm)
    setEditingId(null)
  }

  const downloadTemplate = () => {
    const header = 'name,sku,category,supplier,price,quantity,reorderLevel\n'
    const sample = 'Sample Product,SKU-EXAMPLE,Category,Supplier,10.5,100,20\n'
    const blob = new Blob([header, sample], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'product-template.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleExport = async () => {
    try {
      const res = await exportProductsCsv({
        ...filters,
        lowStock: filters.lowStock || undefined
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = 'products.csv'
      link.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export CSV')
    }
  }

  const handleExportExcel = async () => {
    try {
      const res = await exportProductsExcel({ ...filters, lowStock: filters.lowStock || undefined })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `products-${Date.now()}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      setMessage('Excel exported successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export Excel')
    }
  }

  const handleExportPDF = async () => {
    try {
      const res = await exportProductsPDF({ ...filters, lowStock: filters.lowStock || undefined })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `products-${Date.now()}.pdf`
      link.click()
      window.URL.revokeObjectURL(url)
      setMessage('PDF exported successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export PDF')
    }
  }

  const handleExportStockReport = async () => {
    try {
      const res = await exportStockReport({ days: 30 })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement('a')
      link.href = url
      link.download = `stock-report-${Date.now()}.xlsx`
      link.click()
      window.URL.revokeObjectURL(url)
      setMessage('Stock report exported successfully')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export stock report')
    }
  }

  const handleBulkUpdate = async (updates) => {
    if (selectedIds.length === 0) {
      setError('No products selected')
      return
    }
    try {
      await bulkUpdateProducts(selectedIds, updates)
      setMessage(`${selectedIds.length} products updated successfully`)
      setShowBulkModal(false)
      setSelectedIds([])
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk update failed')
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      setError('No products selected')
      return
    }
    if (!window.confirm(`Delete ${selectedIds.length} products?`)) return
    try {
      await bulkDeleteProducts(selectedIds)
      setMessage(`${selectedIds.length} products deleted successfully`)
      setSelectedIds([])
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Bulk delete failed')
    }
  }

  const handleShowBarcode = (product) => {
    setSelectedProduct(product)
    setShowBarcodeModal(true)
  }

  const handleImport = async () => {
    if (!csvFile) {
      setError('Select a CSV file to import')
      return
    }
    setImporting(true)
    setError('')
    setMessage('')
    try {
      const res = await importProductsCsv(csvFile)
      const data = res.data.data
      setMessage(`Import completed: ${data.created} created, ${data.updated} updated, ${data.skipped} skipped`)
      setCsvFile(null)
      loadProducts()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to import CSV')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="grid gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold text-ink">Products</h2>
          <p className="text-sm text-muted mt-1">Manage your inventory catalog with powerful tools</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={loadProducts}
            className="rounded-full btn-outline px-4 py-2 text-sm font-semibold"
          >
            🔄 Refresh
          </button>
          {isAdmin && (
            <button
              onClick={() => window.scrollTo({ top: document.querySelector('form')?.offsetTop - 100, behavior: 'smooth' })}
              className="rounded-full btn-primary px-4 py-2 text-sm font-semibold"
            >
              ➕ Add Product
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 text-sm text-emerald-700 flex items-center justify-between">
          <span>✓ {message}</span>
          <button onClick={() => setMessage('')} className="text-emerald-600 hover:text-emerald-700">×</button>
        </div>
      )}
      {error && (
        <div className="rounded-2xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>⚠ {error}</span>
          <button onClick={() => setError('')} className="text-red-500 hover:text-red-600">×</button>
        </div>
      )}

      {/* Filters */}
      <div className="grid gap-4 rounded-3xl theme-surface p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-ink font-semibold">🔍 Search & Filter</h3>
          {(filters.search || filters.category || filters.supplier || filters.lowStock) && (
            <button
              onClick={() => setFilters({ search: '', category: '', supplier: '', lowStock: '' })}
              className="text-xs text-muted hover:text-ink"
            >
              Clear filters
            </button>
          )}
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          <label className="grid gap-2 text-sm text-muted">
            Search
            <input
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder="Name, SKU, category..."
              className="rounded-2xl input-field px-4 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Category
            <input
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
              placeholder="Filter by category"
              className="rounded-2xl input-field px-4 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Supplier
            <input
              name="supplier"
              value={filters.supplier}
              onChange={handleFilterChange}
              placeholder="e.g. Dell, Amazon, HP"
              className="rounded-2xl input-field px-4 py-2"
            />
          </label>
          <label className="grid gap-2 text-sm text-muted">
            Stock Status
            <select
              name="lowStock"
              value={filters.lowStock}
              onChange={handleFilterChange}
              className="rounded-2xl input-field px-4 py-2"
            >
              <option value="">All Products</option>
              <option value="true">Low Stock Only</option>
            </select>
          </label>
        </div>
        <button
          onClick={applyFilters}
          className="rounded-full btn-primary px-4 py-2.5 text-sm font-semibold"
        >
          Apply Filters
        </button>
      </div>

      {/* Export & Import Tools */}
      {isAdmin && (
        <div className="grid gap-4 rounded-3xl theme-surface p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">📤 Export & Import</h3>
              <p className="text-sm text-muted mt-1">Download reports or bulk import products via CSV</p>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="grid gap-3">
            <p className="text-xs text-muted font-semibold uppercase tracking-wider">Export Reports</p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={downloadTemplate}
                className="rounded-full btn-outline px-4 py-2 text-xs font-semibold"
              >
                📋 CSV Template
              </button>
              <button
                onClick={handleExport}
                className="rounded-full btn-secondary px-4 py-2 text-xs font-semibold"
              >
                📄 Export CSV
              </button>
              <button
                onClick={handleExportExcel}
                className="rounded-full btn-secondary px-4 py-2 text-xs font-semibold"
              >
                📊 Export Excel
              </button>
              <button
                onClick={handleExportPDF}
                className="rounded-full btn-secondary px-4 py-2 text-xs font-semibold"
              >
                📕 Export PDF
              </button>
              <button
                onClick={handleExportStockReport}
                className="rounded-full btn-secondary px-4 py-2 text-xs font-semibold"
              >
                📈 Stock Report (30d)
              </button>
            </div>
          </div>

          {/* CSV Import */}
          <div className="grid gap-3 md:grid-cols-3 pt-3 border-t theme-border">
            <p className="text-xs text-muted font-semibold uppercase tracking-wider md:col-span-3">Import Products</p>
            <label className="grid gap-2 text-sm text-muted md:col-span-2">
              Select CSV File
              <input
                type="file"
                accept=".csv"
                onChange={(event) => setCsvFile(event.target.files?.[0] || null)}
                className="rounded-2xl input-field px-4 py-2 text-sm cursor-pointer"
              />
              {csvFile && <span className="text-xs text-ink">Selected: {csvFile.name}</span>}
            </label>
            <button
              onClick={handleImport}
              disabled={importing || !csvFile}
              className="rounded-full btn-primary px-4 py-3 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed self-end"
            >
              {importing ? '⏳ Importing...' : '⬆️ Run Import'}
            </button>
          </div>
        </div>
      )}

      {/* Add/Edit Product Form */}
      {isAdmin && (
        <form
          onSubmit={handleSubmit}
          className="grid gap-4 rounded-3xl theme-surface p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ink">
                {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
              </h3>
              <p className="text-sm text-muted mt-1">
                {editingId ? 'Update product information' : 'Fill in the details to add a new product'}
              </p>
            </div>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-full btn-outline px-4 py-2 text-sm font-semibold"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm text-muted">
              Product Name *
              <input
                name="name"
                value={form.name}
                onChange={handleFormChange}
                placeholder="e.g. Wireless Mouse M220"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              SKU <span className="text-xs">(Auto-generated if empty)</span>
              <input
                name="sku"
                value={form.sku}
                onChange={handleFormChange}
                placeholder="e.g. SW-ACC-001"
                className="rounded-2xl input-field px-4 py-2.5"
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Category *
              <input
                name="category"
                value={form.category}
                onChange={handleFormChange}
                placeholder="e.g. Electronics & Computer Accessories"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Supplier *
              <input
                name="supplier"
                value={form.supplier}
                onChange={handleFormChange}
                placeholder="Enter supplier name"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Price ($) *
              <input
                type="number"
                min="0"
                step="0.01"
                name="price"
                value={form.price}
                onChange={handleFormChange}
                placeholder="0.00"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Quantity *
              <input
                type="number"
                min="0"
                name="quantity"
                value={form.quantity}
                onChange={handleFormChange}
                placeholder="0"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
            <label className="grid gap-2 text-sm text-muted md:col-span-2">
              Reorder Level * <span className="text-xs">(Alert when stock falls below this)</span>
              <input
                type="number"
                min="0"
                name="reorderLevel"
                value={form.reorderLevel}
                onChange={handleFormChange}
                placeholder="10"
                className="rounded-2xl input-field px-4 py-2.5"
                required
              />
            </label>
          </div>

          <button
            type="submit"
            className="rounded-full btn-primary px-6 py-3 text-sm font-semibold w-full md:w-auto md:justify-self-start"
          >
            {editingId ? '💾 Update Product' : '➕ Create Product'}
          </button>
        </form>
      )}

      {/* Bulk Actions Bar */}
      {isAdmin && selectedIds.length > 0 && (
        <div className="rounded-3xl theme-surface p-4 flex items-center justify-between shadow-lg border-2 border-(--primary)">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--primary) text-white flex items-center justify-center font-bold">
              {selectedIds.length}
            </div>
            <div>
              <p className="text-ink font-semibold">{selectedIds.length} product{selectedIds.length > 1 ? 's' : ''} selected</p>
              <p className="text-muted text-xs">Choose an action to apply to all selected items</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowBulkModal(true)}
              className="rounded-full btn-primary px-5 py-2.5 text-sm font-semibold"
            >
              ✏️ Bulk Update
            </button>
            <button
              onClick={handleBulkDelete}
              className="rounded-full border-2 border-red-400 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              🗑️ Bulk Delete
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="rounded-full btn-outline px-5 py-2.5 text-sm font-semibold"
            >
              ✕ Clear
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-ink font-semibold">📦 Product Catalog</h3>
          <p className="text-muted text-sm">{products.length} product{products.length !== 1 ? 's' : ''} found</p>
        </div>
        <ProductTable 
          products={products} 
          onEdit={handleEdit} 
          onDelete={handleDelete} 
          isAdmin={isAdmin}
          selectedIds={selectedIds}
          onSelectChange={setSelectedIds}
          onShowBarcode={handleShowBarcode}
        />
      </div>

      {/* Modals */}
      {showBulkModal && (
        <BulkUpdateModal
          onClose={() => setShowBulkModal(false)}
          onUpdate={handleBulkUpdate}
        />
      )}

      {showBarcodeModal && selectedProduct && (
        <BarcodeModal
          product={selectedProduct}
          onClose={() => {
            setShowBarcodeModal(false)
            setSelectedProduct(null)
          }}
        />
      )}
    </div>
  )
}

export default Products
