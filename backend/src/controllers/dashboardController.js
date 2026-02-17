import Product from '../models/Product.js'
import StockLog from '../models/StockLog.js'
import { sendResponse } from '../utils/responseHelper.js'

const buildTrend = (raw, days) => {
  const map = new Map()
  raw.forEach((row) => {
    const key = row._id.date
    if (!map.has(key)) map.set(key, { date: key, in: 0, out: 0 })
    const entry = map.get(key)
    if (row._id.type === 'IN') entry.in = row.totalQty
    if (row._id.type === 'OUT') entry.out = row.totalQty
  })

  const results = []
  for (let i = days - 1; i >= 0; i -= 1) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const key = date.toISOString().slice(0, 10)
    results.push(map.get(key) || { date: key, in: 0, out: 0 })
  }
  return results
}

export const getDashboardSummary = async (req, res, next) => {
  try {
    const { days = 7, category } = req.query
    const daysNum = parseInt(days, 10) || 7

    // Build product filter
    const productFilter = {}
    if (category) productFilter.category = category

    const [totalProducts, lowStockCount] = await Promise.all([
      Product.countDocuments(productFilter),
      Product.countDocuments({ ...productFilter, lowStock: true })
    ])

    // Get product IDs for category filter in stock logs
    let productIds = null
    if (category) {
      const products = await Product.find({ category }, '_id')
      productIds = products.map(p => p._id)
    }

    const stockLogFilter = productIds ? { productId: { $in: productIds } } : {}

    const totals = await StockLog.aggregate([
      { $match: stockLogFilter },
      { $group: { _id: '$type', totalQty: { $sum: '$quantity' }, count: { $sum: 1 } } }
    ])

    const totalsMap = totals.reduce(
      (acc, item) => ({
        ...acc,
        [item._id]: { totalQty: item.totalQty, count: item.count }
      }),
      {}
    )

    const since = new Date()
    since.setDate(since.getDate() - (daysNum - 1))
    since.setHours(0, 0, 0, 0)

    const trendRaw = await StockLog.aggregate([
      { $match: { ...stockLogFilter, timestamp: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
            type: '$type'
          },
          totalQty: { $sum: '$quantity' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ])

    const recentLogs = await StockLog.find(stockLogFilter)
      .populate('productId', 'name sku category')
      .populate('updatedBy', 'name email')
      .sort({ timestamp: -1 })
      .limit(5)

    const movementTrend = buildTrend(trendRaw, daysNum)

    sendResponse(
      res,
      200,
      {
        totalProducts,
        lowStockCount,
        totalStockIn: totalsMap.IN?.totalQty || 0,
        totalStockOut: totalsMap.OUT?.totalQty || 0,
        totalMovements: (totalsMap.IN?.count || 0) + (totalsMap.OUT?.count || 0),
        movementTrend,
        recentLogs
      },
      'Dashboard summary'
    )
  } catch (error) {
    next(error)
  }
}
