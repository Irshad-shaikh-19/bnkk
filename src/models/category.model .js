const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    category_name: {
      type: String,
      trim: true,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const categoryModel = mongoose.model('tbl_category', categorySchema);

module.exports = categoryModel;
