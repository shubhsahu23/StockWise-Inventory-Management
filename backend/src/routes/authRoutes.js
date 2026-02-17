import express from 'express'
import { body, validationResult } from 'express-validator'
import { loginUser, getProfile } from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  next()
}

router.post(
  '/login',
  [body('email').isEmail().withMessage('Valid email is required'), body('password').notEmpty()],
  validate,
  loginUser
)

router.get('/me', protect, getProfile)

export default router
