import mongoose from 'mongoose'
import env from './env.js'
import User from '../models/User.js'

let memoryServerInstance = null

const connectWithUri = async (uri) => {
  mongoose.set('strictQuery', true)
  await mongoose.connect(uri)
}

const startInMemoryMongo = async () => {
  if (!memoryServerInstance) {
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    memoryServerInstance = await MongoMemoryServer.create({
      instance: { dbName: 'inventory_db' }
    })
  }

  return memoryServerInstance.getUri()
}

const ensureDefaultAdmin = async () => {
  const adminName = process.env.ADMIN_NAME || 'Admin User'
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@test.com'
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'

  const existing = await User.findOne({ email: adminEmail })
  if (existing) return

  await User.create({
    name: adminName,
    email: adminEmail,
    password: adminPassword,
    role: 'ADMIN'
  })

  console.log(`Default admin created for dev fallback: ${adminEmail}`)
}

const connectDb = async () => {
  const primaryUri = env.mongoUri || 'mongodb://127.0.0.1:27017/inventory_db'

  try {
    await connectWithUri(primaryUri)
  } catch (primaryError) {
    const canUseDevFallback = process.env.NODE_ENV !== 'production' && Boolean(env.mongoUri)

    if (!canUseDevFallback) {
      throw primaryError
    }

    console.warn('Primary MongoDB connection failed. Falling back to in-memory MongoDB for development.')

    const memoryUri = await startInMemoryMongo()
    await connectWithUri(memoryUri)
    await ensureDefaultAdmin()
  }
}

export default connectDb
