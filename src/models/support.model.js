const mongoose = require('mongoose');
const StatusEnum = {
  PENDING: 0,
  APPROVED: 1,
  DELETED: 2,
  REJECTED: 3,
  // APPLIED: 4
};
const supportSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
    },
    user: {
      type: mongoose.Types.ObjectId,
    },
    message: {
      type: String,
    },
    file: {
      type: String,
    },
    status: {
      type: Number,
      enum: [
        StatusEnum.PENDING,
        StatusEnum.APPROVED,
        StatusEnum.DELETED,
        StatusEnum.REJECTED,
        StatusEnum.APPLIED,
      ],
      default: 0,
    },
  },
  { timestamps: true }
);

const supportModel = mongoose.model('tbl_support', supportSchema);

module.exports = supportModel;
