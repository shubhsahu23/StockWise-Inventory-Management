import bwipjs from 'bwip-js'
import Product from '../models/Product.js'
import { sendResponse } from '../utils/responseHelper.js'

export const generateBarcode = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const barcodeValue = product.barcode || product.sku

    const png = await bwipjs.toBuffer({
      bcid: 'code128',
      text: barcodeValue,
      scale: 3,
      height: 10,
      includetext: true,
      textxalign: 'center'
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `inline; filename="${product.sku}-barcode.png"`)
    res.send(png)
  } catch (error) {
    next(error)
  }
}

export const generateQRCode = async (req, res, next) => {
  try {
    const { id } = req.params
    const product = await Product.findById(id)

    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    const qrData = JSON.stringify({
      id: product._id,
      sku: product.sku,
      name: product.name,
      price: product.price
    })

    const png = await bwipjs.toBuffer({
      bcid: 'qrcode',
      text: qrData,
      scale: 3,
      height: 10,
      width: 10
    })

    res.setHeader('Content-Type', 'image/png')
    res.setHeader('Content-Disposition', `inline; filename="${product.sku}-qrcode.png"`)
    res.send(png)
  } catch (error) {
    next(error)
  }
}

export const updateBarcode = async (req, res, next) => {
  try {
    const { id } = req.params
    const { barcode } = req.body

    const product = await Product.findById(id)
    if (!product) {
      return res.status(404).json({ message: 'Product not found' })
    }

    product.barcode = barcode
    await product.save()

    sendResponse(res, 200, { product }, 'Barcode updated')
  } catch (error) {
    next(error)
  }
}

export const bulkGenerateBarcodes = async (req, res, next) => {
  try {
    const products = await Product.find({ barcode: { $exists: false } })

    let updated = 0
    for (const product of products) {
      if (!product.barcode) {
        product.barcode = product.sku
        await product.save()
        updated++
      }
    }

    sendResponse(res, 200, { updated }, `Generated barcodes for ${updated} products`)
  } catch (error) {
    next(error)
  }
}
