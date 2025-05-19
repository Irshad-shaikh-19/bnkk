const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'userprofiles', required: true },
  planId: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },

  status: { 
    type: String, 
    enum: ['active', 'expired', 'cancelled', 'pending'], 
    default: 'pending' 
  },

  startDate: Date,
  endDate: Date, // null for lifetime
  nextBillingDate: Date,
  autoRenew: { type: Boolean, default: true },

  appliedDiscountCode: String,
  trialEndsAt: Date,

  payment: {
    method: String,
    transactionId: String,
    paidAt: Date,
    amount: Number
  },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Subscription = mongoose.model('Subscription', SubscriptionSchema);
module.exports = Subscription;