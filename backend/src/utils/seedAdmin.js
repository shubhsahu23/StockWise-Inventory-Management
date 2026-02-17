import mongoose from 'mongoose'
import env from '../config/env.js'
import connectDb from '../config/db.js'
import User from '../models/User.js'

const name = process.env.ADMIN_NAME || 'Admin User'
const email = process.env.ADMIN_EMAIL
const password = process.env.ADMIN_PASSWORD

const run = async () => {
  try {
    if (!email || !password) {
      throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set')
    }

    await connectDb()

    const existing = await User.findOne({ email })
    if (existing) {
      existing.name = name
      existing.role = 'ADMIN'
      if (password) {
        existing.password = password
      }
      await existing.save()
      console.log('Admin user updated')
    } else {
      await User.create({ name, email, password, role: 'ADMIN' })
      console.log('Admin user created')
    }

    await mongoose.disconnect()
  } catch (error) {
    console.error('Admin seed failed:', error.message)
    process.exit(1)
  }
}

run()
