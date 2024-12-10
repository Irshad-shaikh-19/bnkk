const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
    },
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    status: {
      type: Number,
      default: 1,
      required: true,
    },
  },
  { timestamps: true }
);

const yarnModel = mongoose.model('tbl_faq', faqSchema);

module.exports = yarnModel;
