import api from './axios.js'

export const stockIn = (payload) => api.post('/stock/in', payload)
export const stockOut = (payload) => api.post('/stock/out', payload)
export const fetchStockLogs = (params) => api.get('/stock/logs', { params })
export const fetchDashboardSummary = (params) => api.get('/dashboard/summary', { params })
