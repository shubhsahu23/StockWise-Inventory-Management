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

app.use(helmet())
app.use(
  cors({
    origin: env.clientOrigin,
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
