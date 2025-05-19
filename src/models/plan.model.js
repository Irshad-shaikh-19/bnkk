const mongoose = require('mongoose');

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  durationInDays: { type: Number }, // null for lifetime
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  isRecurring: { type: Boolean, default: true },
  features: [String],
  trialPeriodInDays: { type: Number },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Plan = mongoose.model('Plan', PlanSchema);
module.exports = Plan;