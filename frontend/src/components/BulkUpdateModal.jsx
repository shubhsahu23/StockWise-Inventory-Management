import { useState } from 'react'

const BulkUpdateModal = ({ selectedProducts, onClose, onUpdate }) => {
  const [updates, setUpdates] = useState({
    category: '',
    supplier: '',
    price: '',
    reorderLevel: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setUpdates(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const payload = {}
    if (updates.category) payload.category = updates.category
    if (updates.supplier) payload.supplier = updates.supplier
    if (updates.price) payload.price = parseFloat(updates.price)
    if (updates.reorderLevel) payload.reorderLevel = parseInt(updates.reorderLevel, 10)

    if (Object.keys(payload).length === 0) {
      alert('Please provide at least one field to update')
      return
    }

    onUpdate(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="theme-surface max-w-md rounded-3xl p-6 w-full mx-4">
        <h3 className="text-ink text-xl font-semibold mb-4">
          Bulk Update ({selectedProducts.length} products)
        </h3>
        
        <form onSubmit={handleSubmit} className="grid gap-4">
          <p className="text-muted text-sm">
            Leave fields empty to keep their current values
          </p>

          <label className="text-muted grid gap-2 text-sm">
            Category
            <input
              name="category"
              value={updates.category}
              onChange={handleChange}
              placeholder="New category"
              className="input-field rounded-2xl px-4 py-2"
            />
          </label>

          <label className="text-muted grid gap-2 text-sm">
            Supplier
            <input
              name="supplier"
              value={updates.supplier}
              onChange={handleChange}
              placeholder="New supplier"
              className="input-field rounded-2xl px-4 py-2"
            />
          </label>

          <label className="text-muted grid gap-2 text-sm">
            Price
            <input
              type="number"
              name="price"
              step="0.01"
              min="0"
              value={updates.price}
              onChange={handleChange}
              placeholder="New price"
              className="input-field rounded-2xl px-4 py-2"
            />
          </label>

          <label className="text-muted grid gap-2 text-sm">
            Reorder Level
            <input
              type="number"
              name="reorderLevel"
              min="0"
              value={updates.reorderLevel}
              onChange={handleChange}
              placeholder="New reorder level"
              className="input-field rounded-2xl px-4 py-2"
            />
          </label>

          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              className="btn-primary flex-1 rounded-full px-4 py-2 text-sm font-semibold"
            >
              Update Products
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-outline flex-1 rounded-full px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BulkUpdateModal
