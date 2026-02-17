import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'
import Product from '../models/Product.js'
import generateSKU from '../utils/generateSKU.js'
import { sendResponse } from '../utils/responseHelper.js'

const buildProductFilter = (query) => {
  const filter = {}

  if (query.category) {
    filter.category = query.category
  }

  if (query.supplier) {
    filter.supplier = query.supplier
  }

  if (query.lowStock === 'true') {
    filter.lowStock = true
  }

  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [{ name: regex }, { sku: regex }, { category: regex }, { supplier: regex }]
  }

  return filter
}

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1)
  const limit = Math.min(parseInt(query.limit, 10) || 10, 100)
  const skip = (page - 1) * limit
  return { page, limit, skip }
}

const getSort = (query) => {
  if (!query.sort) return { createdAt: -1 }

  const [field, direction] = query.sort.split(':')
  const dir = direction === 'asc' ? 1 : -1
  return { [field]: dir }
}

export const listProducts = async (req, res, next) => {
  try {
    const filter = buildProductFilter(req.query)
    const { page, limit, skip } = getPagination(req.query)
    const sort = getSort(req.query)

    const [items, total] = await Promise.all([
      Product.find(filter).sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter)
    ])

    sendResponse(res, 200, { items, total, page, limit }, 'Products loaded')
  } catch (error) {
    next(error)
  }
}

export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    sendResponse(res, 200, { product }, 'Product loaded')
  } catch (error) {
    next(error)
  }
}

export const createProduct = async (req, res, next) => {
  try {
    const { name, sku, category, supplier, price, quantity, reorderLevel } = req.body

    const product = new Product({
      name,
      sku: sku || generateSKU(),
      category,
      supplier,
      price,
      quantity,
      reorderLevel
    })

    await product.save()
    sendResponse(res, 201, { product }, 'Product created')
  } catch (error) {
    next(error)
  }
}

export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const fields = ['name', 'sku', 'category', 'supplier', 'price', 'quantity', 'reorderLevel']
    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        product[field] = req.body[field]
      }
    })

    await product.save()
    sendResponse(res, 200, { product }, 'Product updated')
  } catch (error) {
    next(error)
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    sendResponse(res, 200, { productId: product._id }, 'Product deleted')
  } catch (error) {
    next(error)
  }
}

export const exportProductsCsv = async (req, res, next) => {
  try {
    const filter = buildProductFilter(req.query)
    const sort = getSort(req.query)
    const items = await Product.find(filter).sort(sort).lean()

    const csv = stringify(items, {
      header: true,
      columns: ['name', 'sku', 'category', 'supplier', 'price', 'quantity', 'reorderLevel']
    })

    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', 'attachment; filename="products.csv"')
    res.status(200).send(csv)
  } catch (error) {
    next(error)
  }
}

export const importProductsCsv = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'CSV file is required' })
    }

    const content = req.file.buffer.toString('utf-8')
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    })

    const summary = {
      created: 0,
      updated: 0,
      skipped: 0,
      errors: []
    }

    for (let i = 0; i < rows.length; i += 1) {
      const row = rows[i]
      const name = row.name?.trim()
      const sku = row.sku?.trim()
      const category = row.category?.trim()
      const supplier = row.supplier?.trim()
      const price = Number(row.price)
      const quantity = Number(row.quantity)
      const reorderLevel = Number(row.reorderLevel)

      if (!name || !category || !supplier) {
        summary.skipped += 1
        summary.errors.push({ row: i + 1, message: 'Missing required fields' })
        continue
      }

      if ([price, quantity, reorderLevel].some((value) => Number.isNaN(value))) {
        summary.skipped += 1
        summary.errors.push({ row: i + 1, message: 'Invalid numeric values' })
        continue
      }

      const payload = {
        name,
        sku: sku || generateSKU(),
        category,
        supplier,
        price,
        quantity,
        reorderLevel
      }

      if (sku) {
        const existing = await Product.findOne({ sku })
        if (existing) {
          existing.name = payload.name
          existing.category = payload.category
          existing.supplier = payload.supplier
          existing.price = payload.price
          existing.quantity = payload.quantity
          existing.reorderLevel = payload.reorderLevel
          await existing.save()
          summary.updated += 1
          continue
        }
      }

      await Product.create(payload)
      summary.created += 1
    }

    sendResponse(res, 200, summary, 'Import completed')
  } catch (error) {
    next(error)
  }
}

export const bulkUpdateProducts = async (req, res, next) => {
  try {
    const { productIds, updates } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' })
    }

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Updates object is required' })
    }

    const allowedFields = ['category', 'supplier', 'price', 'reorderLevel']
    const updatePayload = {}

    allowedFields.forEach((field) => {
      if (updates[field] !== undefined && updates[field] !== null && updates[field] !== '') {
        updatePayload[field] = updates[field]
      }
    })

    if (Object.keys(updatePayload).length === 0) {
      return res.status(400).json({ message: 'No valid update fields provided' })
    }

    const result = await Product.updateMany({ _id: { $in: productIds } }, { $set: updatePayload })

    sendResponse(res, 200, { matchedCount: result.matchedCount, modifiedCount: result.modifiedCount }, 'Bulk update completed')
  } catch (error) {
    next(error)
  }
}

export const bulkDeleteProducts = async (req, res, next) => {
  try {
    const { productIds } = req.body

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: 'Product IDs array is required' })
    }

    const result = await Product.deleteMany({ _id: { $in: productIds } })

    sendResponse(res, 200, { deletedCount: result.deletedCount }, 'Bulk delete completed')
  } catch (error) {
    next(error)
  }
}
