import { useState } from 'react'
import { getBarcodeImage, getQRCodeImage } from '../api/productApi.js'

const BarcodeModal = ({ product, onClose }) => {
  const [imageType, setImageType] = useState('barcode')
  const [imageUrl, setImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)

  const loadImage = async (type) => {
    setLoading(true)
    try {
      const response = type === 'barcode' 
        ? await getBarcodeImage(product._id)
        : await getQRCodeImage(product._id)
      
      const url = URL.createObjectURL(response.data)
      setImageUrl(url)
    } catch (err) {
      alert('Failed to generate ' + type)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeChange = (type) => {
    setImageType(type)
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl)
      setImageUrl(null)
    }
    loadImage(type)
  }

  const handleDownload = () => {
    if (!imageUrl) return
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `${product.sku}-${imageType}.png`
    link.click()
  }

  // Load barcode on mount
  useState(() => {
    loadImage('barcode')
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div className="theme-surface max-w-lg rounded-3xl p-6 w-full mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-ink text-xl font-semibold">
            {product.name}
          </h3>
          <button onClick={onClose} className="text-muted hover:text-ink text-2xl">
            ×
          </button>
        </div>

        <p className="text-muted text-sm mb-4">SKU: {product.sku}</p>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => handleTypeChange('barcode')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              imageType === 'barcode' ? 'btn-primary' : 'btn-outline'
            }`}
          >
            Barcode
          </button>
          <button
            onClick={() => handleTypeChange('qrcode')}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold ${
              imageType === 'qrcode' ? 'btn-primary' : 'btn-outline'
            }`}
          >
            QR Code
          </button>
        </div>

        <div className="theme-surface-muted rounded-2xl p-6 flex items-center justify-center min-h-50">
          {loading ? (
            <p className="text-muted">Generating {imageType}...</p>
          ) : imageUrl ? (
            <img src={imageUrl} alt={imageType} className="max-w-full" />
          ) : (
            <p className="text-muted">Failed to load image</p>
          )}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDownload}
            disabled={!imageUrl}
            className="btn-primary flex-1 rounded-full px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            Download
          </button>
          <button
            onClick={onClose}
            className="btn-outline flex-1 rounded-full px-4 py-2 text-sm font-semibold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default BarcodeModal
