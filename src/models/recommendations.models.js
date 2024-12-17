const mongoose = require('mongoose');

// Define the schema with improvements
const RecommendationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    rewardType: { 
      type: String, 
      required: true, 
      enum: ['points', 'amount'] 
    },
    rewardAmount: { 
      type: Number, 
      required: true, 
      min: 0 // Ensures rewardAmount is non-negative
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    expiresAt: { 
      type: Date, 
      required: true, 
      validate: {
        validator: function (v) {
          return v > Date.now(); // Ensures expiresAt is in the future
        },
        message: 'Expiration date must be in the future.'
      }
    },
    category: { 
      type: String, 
      required: true, 
      enum: ['daily', 'weekly', 'monthly', 'default'] 
    }
  },
  {
    timestamps: true // Automatically adds createdAt and updatedAt fields
  }
);

// Add indexing for frequently queried fields
RecommendationSchema.index({ isActive: 1, category: 1, expiresAt: -1 });

// Compile the model
const Recommendations = mongoose.model('Recommendation', RecommendationSchema);

module.exports = Recommendations;
