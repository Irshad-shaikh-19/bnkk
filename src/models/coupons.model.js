const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  restaurant: {
    type: String,
    required: true,
  },
  code: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  gpsCoordinates: {
    type: String,
    required: true,
  },
  expireDate: {
    type: Date,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
});

const Coupon = mongoose.model('coupon', couponSchema);

module.exports = Coupon;
