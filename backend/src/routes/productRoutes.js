import express from 'express'
import multer from 'multer'
import { body, validationResult } from 'express-validator'
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  exportProductsCsv,
  importProductsCsv,
  bulkUpdateProducts,
  bulkDeleteProducts
} from '../controllers/productController.js'
import { exportProductsExcel, exportProductsPDF, exportStockReportExcel } from '../controllers/exportController.js'
import { generateBarcode, generateQRCode, updateBarcode, bulkGenerateBarcodes } from '../controllers/barcodeController.js'
import { protect } from '../middleware/authMiddleware.js'
import { allowRoles } from '../middleware/roleMiddleware.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } })

const validate = (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: 'Validation failed', errors: errors.array() })
  }
  next()
}

router.get('/', protect, listProducts)
router.get('/export', protect, allowRoles('ADMIN'), exportProductsCsv)
router.get('/export/excel', protect, allowRoles('ADMIN'), exportProductsExcel)
router.get('/export/pdf', protect, allowRoles('ADMIN'), exportProductsPDF)
router.get('/export/stock-report', protect, allowRoles('ADMIN'), exportStockReportExcel)
router.post('/import', protect, allowRoles('ADMIN'), upload.single('file'), importProductsCsv)
router.post('/bulk-update', protect, allowRoles('ADMIN'), bulkUpdateProducts)
router.post('/bulk-delete', protect, allowRoles('ADMIN'), bulkDeleteProducts)
router.post('/bulk-generate-barcodes', protect, allowRoles('ADMIN'), bulkGenerateBarcodes)
router.get('/:id', protect, getProduct)
router.get('/:id/barcode', protect, generateBarcode)
router.get('/:id/qrcode', protect, generateQRCode)
router.put('/:id/barcode', protect, allowRoles('ADMIN'), updateBarcode)

router.post(
  '/',
  protect,
  allowRoles('ADMIN'),
  [
    body('name').trim().notEmpty(),
    body('category').trim().notEmpty(),
    body('supplier').trim().notEmpty(),
    body('price').isFloat({ min: 0 }),
    body('quantity').isInt({ min: 0 }),
    body('reorderLevel').isInt({ min: 0 })
  ],
  validate,
  createProduct
)

router.put(
  '/:id',
  protect,
  allowRoles('ADMIN'),
  [
    body('price').optional().isFloat({ min: 0 }),
    body('quantity').optional().isInt({ min: 0 }),
    body('reorderLevel').optional().isInt({ min: 0 })
  ],
  validate,
  updateProduct
)

router.delete('/:id', protect, allowRoles('ADMIN'), deleteProduct)

export default router
