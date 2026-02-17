import mongoose from 'mongoose'

const stockLogSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    type: { type: String, enum: ['IN', 'OUT'], required: true },
    quantity: { type: Number, required: true, min: 1 },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: false }
)

export default mongoose.model('StockLog', stockLogSchema)
