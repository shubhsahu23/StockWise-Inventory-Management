import express from 'express'
import { body, validationResult } from 'express-validator'
import { stockIn, stockOut, listStockLogs } from '../controllers/stockController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  next()
}

router.post(
  '/in',
  protect,
  allowRoles('ADMIN', 'STAFF'),
  [body('productId').notEmpty(), body('quantity').isInt({ min: 1 })],
  validate,
  stockIn
)

router.post(
  '/out',
  protect,
  allowRoles('ADMIN', 'STAFF'),
  [body('productId').notEmpty(), body('quantity').isInt({ min: 1 })],
  validate,
  stockOut
)

router.get('/logs', protect, allowRoles('ADMIN', 'STAFF'), listStockLogs)

export default router
