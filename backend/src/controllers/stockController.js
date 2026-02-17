import Product from '../models/Product.js'
import StockLog from '../models/StockLog.js'
import { sendResponse } from '../utils/responseHelper.js'

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

export const stockIn = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.quantity += Number(quantity)
    await product.save()

    const log = await StockLog.create({
      productId: product._id,
      type: 'IN',
      quantity,
      updatedBy: req.user._id
    })

    sendResponse(res, 200, { product, log }, 'Stock added')
  } catch (error) {
    next(error)
  }
}

export const stockOut = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    if (product.quantity < Number(quantity)) {
      return res.status(400).json({ message: 'Insufficient stock' })
    }

    product.quantity -= Number(quantity)
    await product.save()

    const log = await StockLog.create({
      productId: product._id,
      type: 'OUT',
      quantity,
      updatedBy: req.user._id
    })

    sendResponse(res, 200, { product, log }, 'Stock removed')
  } catch (error) {
    next(error)
  }
}

export const listStockLogs = async (req, res, next) => {
  try {
    const filter = {}
    if (req.query.productId) filter.productId = req.query.productId
    if (req.query.type) filter.type = req.query.type
    if (req.query.updatedBy) filter.updatedBy = req.query.updatedBy

    const { page, limit, skip } = getPagination(req.query)

    const [items, total] = await Promise.all([
      StockLog.find(filter)
        .populate('productId', 'name sku')
        .populate('updatedBy', 'name email')
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit),
      StockLog.countDocuments(filter)
    ])

    sendResponse(res, 200, { items, total, page, limit }, 'Stock logs loaded')
  } catch (error) {
    next(error)
  }
}
