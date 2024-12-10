const catchAsync = require('../utils/catchAsync');
const { couponService } = require('../services');

/**
 * Controller to upload coupons data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const uploadCouponsController = catchAsync(async (req, res) => {
  const { data } = req.body;

  if (!data || !Array.isArray(data)) {
    return res.status(400).json({ message: 'Invalid data format' });
  }

  const coupons = await couponService.uploadCouponsData(data);
  res.status(201).json({
    status: 'success',
    data: coupons,
  });
});

/**
 * Controller to get all coupons
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllCouponsController = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const { coupons, total } = await couponService.getAllCoupons(page, limit);
  res.status(200).json({
    status: 'success',
    data: coupons,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
});
const updateCouponController = catchAsync(async (req, res) => {
  const couponId = req.params.id;
  const updateData = req.body;

  const updatedCoupon = await couponService.updateCoupon(couponId, updateData);
  res.status(200).json({
    status: 'success',
    data: updatedCoupon,
  });
});
module.exports = {
  uploadCouponsController,
  getAllCouponsController,
  updateCouponController
};
