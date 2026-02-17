import api from './axios.js'

export const fetchProducts = (params) => api.get('/products', { params })
export const fetchProduct = (id) => api.get(`/products/${id}`)
export const createProduct = (payload) => api.post('/products', payload)
export const updateProduct = (id, payload) => api.put(`/products/${id}`, payload)
export const deleteProduct = (id) => api.delete(`/products/${id}`)

// CSV Export/Import
export const exportProductsCsv = (params) =>
	api.get('/products/export', { params, responseType: 'blob' })
export const importProductsCsv = (file) => {
	const formData = new FormData()
	formData.append('file', file)
	return api.post('/products/import', formData, {
		headers: { 'Content-Type': 'multipart/form-data' }
	})
}

// Excel/PDF Export
export const exportProductsExcel = (params) =>
	api.get('/products/export/excel', { params, responseType: 'blob' })
export const exportProductsPDF = (params) =>
	api.get('/products/export/pdf', { params, responseType: 'blob' })
export const exportStockReport = (params) =>
	api.get('/products/export/stock-report', { params, responseType: 'blob' })

// Barcode/QR Code
export const getBarcodeImage = (id) =>
	api.get(`/products/${id}/barcode`, { responseType: 'blob' })
export const getQRCodeImage = (id) =>
	api.get(`/products/${id}/qrcode`, { responseType: 'blob' })
export const updateBarcode = (id, barcode) =>
	api.put(`/products/${id}/barcode`, { barcode })
export const bulkGenerateBarcodes = () =>
	api.post('/products/bulk-generate-barcodes')

// Bulk Operations
export const bulkUpdateProducts = (productIds, updates) =>
	api.post('/products/bulk-update', { productIds, updates })
export const bulkDeleteProducts = (productIds) =>
	api.post('/products/bulk-delete', { productIds })
