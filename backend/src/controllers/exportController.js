import ExcelJS from 'exceljs'
import PDFDocument from 'pdfkit'
import Product from '../models/Product.js'
import StockLog from '../models/StockLog.js'

const buildProductFilter = (query) => {
  const filter = {}
  if (query.category) filter.category = query.category
  if (query.supplier) filter.supplier = query.supplier
  if (query.lowStock === 'true') filter.lowStock = true
  if (query.search) {
    const regex = new RegExp(query.search, 'i')
    filter.$or = [{ name: regex }, { sku: regex }, { category: regex }, { supplier: regex }]
  }
  return filter
}

export const exportProductsExcel = async (req, res, next) => {
  try {
    const filter = buildProductFilter(req.query)
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Products')

    // Define columns
    worksheet.columns = [
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Supplier', key: 'supplier', width: 20 },
      { header: 'Price', key: 'price', width: 12 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Reorder Level', key: 'reorderLevel', width: 15 },
      { header: 'Low Stock', key: 'lowStock', width: 12 }
    ]

    // Style header
    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    // Add data
    products.forEach((product) => {
      worksheet.addRow({
        sku: product.sku,
        name: product.name,
        category: product.category,
        supplier: product.supplier,
        price: product.price,
        quantity: product.quantity,
        reorderLevel: product.reorderLevel,
        lowStock: product.lowStock ? 'Yes' : 'No'
      })
    })

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}

export const exportProductsPDF = async (req, res, next) => {
  try {
    const filter = buildProductFilter(req.query)
    const products = await Product.find(filter).sort({ createdAt: -1 }).lean()

    const doc = new PDFDocument({ margin: 50, size: 'A4' })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="products-${Date.now()}.pdf"`)

    doc.pipe(res)

    // Title
    doc.fontSize(20).fillColor('#2563EB').text('Product Inventory Report', { align: 'center' })
    doc.moveDown()
    doc.fontSize(10).fillColor('#64748B').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' })
    doc.moveDown(2)

    // Summary
    const totalValue = products.reduce((sum, p) => sum + p.price * p.quantity, 0)
    const lowStockCount = products.filter((p) => p.lowStock).length

    doc.fontSize(12).fillColor('#0F172A')
    doc.text(`Total Products: ${products.length}`)
    doc.text(`Low Stock Items: ${lowStockCount}`)
    doc.text(`Total Inventory Value: $${totalValue.toFixed(2)}`)
    doc.moveDown(2)

    // Table header
    const tableTop = doc.y
    const tableHeaders = ['SKU', 'Name', 'Category', 'Qty', 'Price']
    const columnWidths = [80, 150, 100, 50, 70]
    let xPos = 50

    doc.fontSize(10).font('Helvetica-Bold').fillColor('#0F172A')
    tableHeaders.forEach((header, i) => {
      doc.text(header, xPos, tableTop, { width: columnWidths[i] })
      xPos += columnWidths[i]
    })

    doc.moveDown()
    let yPos = doc.y

    // Draw line under header
    doc.strokeColor('#2563EB').lineWidth(1).moveTo(50, yPos).lineTo(500, yPos).stroke()
    yPos += 10

    // Table rows
    doc.font('Helvetica').fontSize(9).fillColor('#0F172A')
    products.forEach((product) => {
      if (yPos > 700) {
        doc.addPage()
        yPos = 50
      }

      xPos = 50
      const rowData = [
        product.sku,
        product.name.substring(0, 25),
        product.category,
        product.quantity.toString(),
        `$${product.price.toFixed(2)}`
      ]

      rowData.forEach((text, i) => {
        doc.text(text, xPos, yPos, { width: columnWidths[i], lineBreak: false })
        xPos += columnWidths[i]
      })
      yPos += 20
    })

    doc.end()
  } catch (error) {
    next(error)
  }
}

export const exportStockReportExcel = async (req, res, next) => {
  try {
    const { days = 30 } = req.query
    const since = new Date()
    since.setDate(since.getDate() - parseInt(days, 10))

    const logs = await StockLog.find({ timestamp: { $gte: since } })
      .populate('productId', 'name sku category')
      .populate('updatedBy', 'name email')
      .sort({ timestamp: -1 })
      .lean()

    const workbook = new ExcelJS.Workbook()
    const worksheet = workbook.addWorksheet('Stock Movements')

    worksheet.columns = [
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Product', key: 'product', width: 30 },
      { header: 'SKU', key: 'sku', width: 15 },
      { header: 'Category', key: 'category', width: 20 },
      { header: 'Type', key: 'type', width: 12 },
      { header: 'Quantity', key: 'quantity', width: 12 },
      { header: 'Updated By', key: 'updatedBy', width: 25 }
    ]

    worksheet.getRow(1).font = { bold: true }
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    }
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } }

    logs.forEach((log) => {
      worksheet.addRow({
        date: new Date(log.timestamp).toLocaleString(),
        product: log.productId?.name || 'N/A',
        sku: log.productId?.sku || 'N/A',
        category: log.productId?.category || 'N/A',
        type: log.type,
        quantity: log.quantity,
        updatedBy: log.updatedBy?.name || 'N/A'
      })
    })

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="stock-movements-${Date.now()}.xlsx"`)

    await workbook.xlsx.write(res)
    res.end()
  } catch (error) {
    next(error)
  }
}
