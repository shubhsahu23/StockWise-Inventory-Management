import { useState } from 'react'

const StockForm = ({ products, onSubmit }) => {
  const [form, setForm] = useState({ productId: '', type: 'IN', quantity: 1 })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.productId) return
    onSubmit({ ...form, quantity: Number(form.quantity) })
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="theme-surface grid gap-4 rounded-3xl p-6"
    >
      <h3 className="text-ink text-lg font-semibold">Stock movement</h3>
      <div className="grid gap-3 md:grid-cols-3">
        <label className="text-muted grid gap-2 text-sm">
          Product
          <select
            name="productId"
            value={form.productId}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select product</option>
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
            value={form.type}
            onChange={handleChange}
            className="input-field"
          >
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
          </select>
        </label>
        <label className="text-muted grid gap-2 text-sm">
          Quantity
          <input
            type="number"
            name="quantity"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            className="input-field"
          />
        </label>
      </div>
      <button
        type="submit"
        className="btn-primary w-full rounded-full px-4 py-3 text-sm font-semibold transition"
      >
        Apply movement
      </button>
    </form>
  )
}

export default StockForm
