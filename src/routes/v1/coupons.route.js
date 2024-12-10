const express = require('express');
const auth = require('../../middlewares/auth');
const { couponController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(auth(), couponController.getAllCouponsController); // Get all coupons

router
  .route('/upload')
  .post(auth(), couponController.uploadCouponsController); // Upload coupons data

  router
  .route('/:id')
  .put(auth(), couponController.updateCouponController); // Update a specific coupon by ID

module.exports = router;
