const ProductTable = ({ products, onEdit, onDelete, isAdmin, selectedIds = [], onSelectChange, onShowBarcode }) => {
  if (!products || products.length === 0) {
    return (
      <div className="theme-surface rounded-3xl p-12 text-center">
        <div className="text-4xl mb-4">📦</div>
        <h3 className="text-ink text-lg font-semibold mb-2">No products found</h3>
        <p className="text-muted text-sm">Add your first product or adjust your filters</p>
      </div>
    )
  }

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectChange(products.map(p => p._id))
    } else {
      onSelectChange([])
    }
  }

  const handleSelectOne = (productId) => {
    if (selectedIds.includes(productId)) {
      onSelectChange(selectedIds.filter(id => id !== productId))
    } else {
      onSelectChange([...selectedIds, productId])
    }
  }

  return (
    <div className="overflow-x-auto rounded-3xl theme-surface">
      <table className="w-full text-left text-sm text-ink min-w-250">
        <thead className="table-head text-xs uppercase tracking-widest">
          <tr>
            {isAdmin && onSelectChange && (
              <th className="px-4 py-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedIds.length === products.length && products.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 rounded cursor-pointer"
                  title="Select all"
                />
              </th>
            )}
            <th className="px-5 py-4 min-w-45">Product</th>
            <th className="px-5 py-4 min-w-25">SKU</th>
            <th className="px-5 py-4 min-w-37.5">Category</th>
            <th className="px-5 py-4 min-w-30">Supplier</th>
            <th className="px-5 py-4 min-w-20">Price</th>
            <th className="px-5 py-4 min-w-15">Qty</th>
            <th className="px-5 py-4 min-w-25">Status</th>
            <th className="px-5 py-4 min-w-50">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="table-row hover:bg-(--surface-muted) transition-colors">
              {isAdmin && onSelectChange && (
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(product._id)}
                    onChange={() => handleSelectOne(product._id)}
                    className="w-4 h-4 rounded cursor-pointer"
                  />
                </td>
              )}
              <td className="px-5 py-4">
                <p className="font-semibold text-ink">{product.name}</p>
              </td>
              <td className="px-5 py-4 text-muted font-mono text-xs">{product.sku}</td>
              <td className="px-5 py-4 text-muted">{product.category}</td>
              <td className="px-5 py-4 text-muted">{product.supplier}</td>
              <td className="px-5 py-4 text-muted font-semibold">${product.price.toFixed(2)}</td>
              <td className="px-5 py-4">
                <span className={`font-semibold ${product.lowStock ? 'text-amber-600' : 'text-ink'}`}>
                  {product.quantity}
                </span>
              </td>
              <td className="px-5 py-4">
                {product.lowStock ? (
                  <span className="inline-flex rounded-full bg-amber-500/15 px-3 py-1 text-xs font-semibold text-amber-600">
                    Low stock
                  </span>
                ) : (
                  <span className="inline-flex rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600">
                    Healthy
                  </span>
                )}
              </td>
              <td className="px-5 py-4">
                <div className="flex gap-2 flex-nowrap">
                  <button
                    onClick={() => onShowBarcode(product)}
                    className="rounded-full btn-secondary px-3 py-1.5 text-xs font-semibold hover:scale-105 transition-transform"
                    title="View Barcode/QR Code"
                  >
                    🏷️ Barcode
                  </button>
                  {isAdmin && (
                    <>
                      <button
                        onClick={() => onEdit(product)}
                        className="rounded-full btn-secondary px-3 py-1.5 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDelete(product)}
                        className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default ProductTable
