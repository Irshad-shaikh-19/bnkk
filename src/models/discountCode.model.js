const mongoose = require('mongoose');

const DiscountCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  description: String,
  discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
  discountValue: { type: Number, required: true },
  validFrom: Date,
  validUntil: Date,
  maxUses: Number,
  usedCount: { type: Number, default: 0 },
  applicablePlanSlugs: [String],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const DiscountCode = mongoose.model('DiscountCode', DiscountCodeSchema);
module.exports = DiscountCode;
