import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import env from '../config/env.js'
import { sendResponse } from '../utils/responseHelper.js'

const generateToken = (id) => {
  return jwt.sign({ id }, env.jwtSecret, { expiresIn: env.jwtExpires })
}

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const token = generateToken(user._id)
    sendResponse(res, 200, { user: { id: user._id, name: user.name, email: user.email, role: user.role }, token }, 'Logged in')
  } catch (error) {
    next(error)
  }
}

export const getProfile = async (req, res) => {
  sendResponse(res, 200, { user: req.user }, 'Profile loaded')
}
