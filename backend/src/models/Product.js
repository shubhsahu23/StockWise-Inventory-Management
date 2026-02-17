import mongoose from 'mongoose'

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, required: true, unique: true, trim: true },
    category: { type: String, required: true, trim: true },
    supplier: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, required: true, min: 0 },
    lowStock: { type: Boolean, default: false },
    barcode: { type: String, trim: true },
    variants: [
      {
        name: { type: String, trim: true },
        value: { type: String, trim: true },
        sku: { type: String, trim: true },
        quantity: { type: Number, default: 0 },
        price: { type: Number }
      }
    ]
  },
  { timestamps: true }
)

productSchema.pre('save', function (next) {
  this.lowStock = this.quantity <= this.reorderLevel
  next()
})

export default mongoose.model('Product', productSchema)
