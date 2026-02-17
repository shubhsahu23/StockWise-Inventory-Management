import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://stock-wise-inventory-management-backend-rifk4er5q.vercel.app/api'
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ims_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default api
