import mongoose from 'mongoose'
import connectDb from '../config/db.js'
import env from '../config/env.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import StockLog from '../models/StockLog.js'

const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
const adminPassword = process.env.ADMIN_PASSWORD || 'ChangeMe123!'
const staffEmail = 'staff@stockwise.local'
const staffPassword = 'Staff123!'

const products = [
  {
    name: 'Wireless Mouse M220',
    sku: 'SW-ACC-001',
    category: 'Electronics & Computer Accessories',
    supplier: 'LogiHub',
    price: 19.99,
    quantity: 120,
    reorderLevel: 25
  },
  {
    name: 'Mechanical Keyboard K8',
    sku: 'SW-ACC-002',
    category: 'Electronics & Computer Accessories',
    supplier: 'KeyVerse',
    price: 79.0,
    quantity: 45,
    reorderLevel: 15
  },
  {
    name: 'USB-C Hub 7-in-1',
    sku: 'SW-ACC-003',
    category: 'Electronics & Computer Accessories',
    supplier: 'PortFlex',
    price: 39.5,
    quantity: 30,
    reorderLevel: 10
  },
  {
    name: '27" IPS Monitor',
    sku: 'SW-ACC-004',
    category: 'Electronics & Computer Accessories',
    supplier: 'ViewCore',
    price: 219.0,
    quantity: 18,
    reorderLevel: 8
  },
  {
    name: 'Laptop Stand Aluminum',
    sku: 'SW-ACC-005',
    category: 'Electronics & Computer Accessories',
    supplier: 'ErgoLift',
    price: 29.5,
    quantity: 75,
    reorderLevel: 20
  }
]

const createOrUpdateUser = async ({ name, email, password, role }) => {
  const existing = await User.findOne({ email })
  if (existing) {
    existing.name = name
    existing.role = role
    if (password) existing.password = password
    await existing.save()
    return existing
  }
  return User.create({ name, email, password, role })
}

const createOrUpdateProduct = async (payload) => {
  const existing = await Product.findOne({ sku: payload.sku })
  if (existing) {
    Object.assign(existing, payload)
    await existing.save()
    return existing
  }
  return Product.create(payload)
}

const createLogs = async (items, admin, staff) => {
  const today = new Date()
  const logs = []
  const dayOffsets = [6, 5, 4, 3, 2, 1, 0]

  dayOffsets.forEach((offset, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() - offset)

    const product = items[index % items.length]
    logs.push({
      productId: product._id,
      type: index % 2 === 0 ? 'IN' : 'OUT',
      quantity: 5 + index * 2,
      updatedBy: index % 2 === 0 ? admin._id : staff._id,
      timestamp: date
    })
  })

  await StockLog.deleteMany({ productId: { $in: items.map((item) => item._id) } })
  await StockLog.insertMany(logs)
}

const run = async () => {
  try {
    if (!env.mongoUri) {
      throw new Error('MONGO_URI is not set')
    }

    await connectDb()

    const admin = await createOrUpdateUser({
      name: 'StockWise Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'ADMIN'
    })

    const staff = await createOrUpdateUser({
      name: 'StockWise Staff',
      email: staffEmail,
      password: staffPassword,
      role: 'STAFF'
    })

    const createdProducts = []
    for (const payload of products) {
      const product = await createOrUpdateProduct(payload)
      createdProducts.push(product)
    }

    await createLogs(createdProducts, admin, staff)

    console.log('Sample data seeded')
    await mongoose.disconnect()
  } catch (error) {
    console.error('Sample seed failed:', error.message)
    process.exit(1)
  }
}

run()
