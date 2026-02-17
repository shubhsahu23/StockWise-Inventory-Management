import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import env from './config/env.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import stockRoutes from './routes/stockRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler, notFoundHandler } from './middleware/errorMiddleware.js'

const app = express()

const allowedOrigins = (env.clientOrigin || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isAllowedOrigin = (origin) => {
  if (!origin) return true
  if (allowedOrigins.includes(origin)) return true
  if (/^https:\/\/[a-z0-9-]+\.vercel\.app$/i.test(origin)) {
    return origin.includes('stock-wise-inventory-manage')
  }
  return false
}

app.use(helmet())
app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`))
    },
    credentials: true
  })
)
app.use(express.json({ limit: '1mb' }))
app.use(morgan('dev'))

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' })
})

app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/products', productRoutes)
app.use('/api/stock', stockRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
