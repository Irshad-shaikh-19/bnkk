const mongoose = require('mongoose');

const CATEGORY_ENUM = ['daily', 'weekly', 'monthly', 'default'];

const RecommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rewardType: { 
      type: String, 
      required: true, 
      enum: ['points', 'amount'], 
    },
    rewardAmount: { 
      type: Number, 
      required: true, 
      min: 0,
      validate: {
        validator: function(value) {
          if (this.rewardType === 'amount' && value <= 0) {
            return false;
          }
          return true;
        },
        message: 'Reward amount must be greater than 0 for monetary rewards.',
      },
    },
    isActive: {
      type: Number,
      default: 1, // 0- In-active, 1- active
    },
    expiresAt: { 
      type: Date, 
      required: true,
      validate: {
        validator: function(value) {
          return value instanceof Date && value > new Date();
        },
        message: 'Expiration date must be a valid future date.',
      },
    },
    category: { 
      type: String, 
      enum: CATEGORY_ENUM, 
      default: 'default' 
    },
  },
  {
    timestamps: { createdAt: 'created', updatedAt: 'updated' }, // Align with your table data fields
  }
);

// Indexes
RecommendationSchema.index({ isActive: 1 });
RecommendationSchema.index({ expiresAt: 1 });

// Static Methods
RecommendationSchema.statics.findActive = function() {
  return this.find({ isActive: true });
};

// Instance Methods
RecommendationSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

// Compile the model
const Recommendations = mongoose.model('Recommendation', RecommendationSchema);

module.exports = Recommendations;
