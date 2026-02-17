import express from 'express'
import { getDashboardSummary } from '../controllers/dashboardController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()

router.get('/summary', protect, allowRoles('ADMIN', 'STAFF'), getDashboardSummary)

export default router
