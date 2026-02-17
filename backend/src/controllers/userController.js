import User from '../models/User.js'
import { sendResponse } from '../utils/responseHelper.js'

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const buildFilter = (query) => {
  const filter = {}
  if (query.role) {
    filter.role = query.role
  }
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [{ name: regex }, { email: regex }]
  }
  return filter
}

export const listUsers = async (req, res, next) => {
  try {
    const filter = buildFilter(req.query)
    const { page, limit, skip } = getPagination(req.query)

    const [items, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(filter)
    ])

    sendResponse(res, 200, { items, total, page, limit }, 'Users loaded')
  } catch (error) {
    next(error)
  }
}

export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body

    const existing = await User.findOne({ email })
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' })
    }

    const user = await User.create({ name, email, password, role })
    sendResponse(
      res,
      201,
      { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      'User created'
    )
  } catch (error) {
    next(error)
  }
}

export const updateUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    if (email && email !== user.email) {
      const exists = await User.findOne({ email })
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' })
      }
      user.email = email
    }

    if (name !== undefined) user.name = name
    if (role !== undefined) user.role = role
    if (password) user.password = password

    await user.save()

    sendResponse(
      res,
      200,
      { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
      'User updated'
    )
  } catch (error) {
    next(error)
  }
}

export const deleteUser = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' })
    }

    const user = await User.findByIdAndDelete(req.params.id)
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }

    sendResponse(res, 200, { userId: user._id }, 'User deleted')
  } catch (error) {
    next(error)
  }
}
