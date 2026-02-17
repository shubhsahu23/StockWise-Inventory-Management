import express from 'express'
import { body, validationResult } from 'express-validator'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/userController.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  next()
}

router.use(protect, allowRoles('ADMIN'))

router.get('/', listUsers)

router.post(
  '/',
  [
    body('name').trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('role').isIn(['ADMIN', 'STAFF'])
  ],
  validate,
  createUser
)

router.put(
  '/:id',
  [
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 6 }),
    body('role').optional().isIn(['ADMIN', 'STAFF'])
  ],
  validate,
  updateUser
)

router.delete('/:id', deleteUser)

export default router
