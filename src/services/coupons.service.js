const Coupon = require('../models/coupons.model');
const { systemLog } = require('../utils/system-log');  // Import systemLog

/**
 * Upload and save coupons data directly from JSON
 * @param {Array} data - Array of coupon data objects
 * @param {Object} info - Information about the user making the request
 * @returns {Promise<Array>} - Array of saved coupons
 */
const uploadCouponsData = async (data, info) => {
  const coupons = [];

  for (let row of data) {
    // Trim all keys in the row to remove extra spaces
    const cleanedRow = {};
    for (let key in row) {
      cleanedRow[key.trim()] = row[key];
    }

    // Now, process the cleanedRow instead of row
    const restaurant = cleanedRow['Restaurant'] ? cleanedRow['Restaurant'].trim() : '';
    const code = cleanedRow['Code'] ? cleanedRow['Code'].trim() : '';
    const description = cleanedRow['Description'] ? cleanedRow['Description'].trim() : '';
    const location = cleanedRow['Location'] ? cleanedRow['Location'].trim() : '';
    const gpsCoordinates = cleanedRow['GPS Coordinates'] ? cleanedRow['GPS Coordinates'].trim() : '';
    
    // Ensure that expireDate is properly parsed
    let expireDate = null;
    if (cleanedRow['Expire date'] && typeof cleanedRow['Expire date'] === 'string') {
      expireDate = new Date(cleanedRow['Expire date'].trim());
      if (isNaN(expireDate.getTime())) {
        console.error('Invalid date format for row:', cleanedRow);
        continue; // Skip this row if date is invalid
      }
    }

    const imageUrl = cleanedRow['Image URL'] ? cleanedRow['Image URL'].trim() : '';

    // Validate that required fields are not empty
    if (!restaurant || !location || !gpsCoordinates || !expireDate) {
      console.error('Missing required fields in row:', cleanedRow);
      continue; // Skip this row
    }

    const coupon = new Coupon({
      restaurant,
      code,
      description,
      location,
      gpsCoordinates,
      expireDate,
      imageUrl,
    });

    try {
      const savedCoupon = await coupon.save();
      coupons.push(savedCoupon);
      // Log the creation of each coupon
      await systemLog('CREATE', cleanedRow, savedCoupon._id, 'upload-coupon-data', savedCoupon, info);
    } catch (error) {
      throw new Error(`Error saving coupon: ${error.message}`);
    }
  }

  return coupons;
};

/**
 * Get all coupons
 * @returns {Promise<Array>} - Array of coupons
 */
const getAllCoupons = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;
  const [coupons, total] = await Promise.all([
    Coupon.find().skip(skip).limit(limit),
    Coupon.countDocuments(),
  ]);
  return { coupons, total };
};

/**
 * Update a coupon by ID
 * @param {string} couponId - ID of the coupon to update
 * @param {Object} updateData - Data to update the coupon with
 * @param {Object} info - Information about the user making the request
 * @returns {Promise<Object>} - Updated coupon
 */
const updateCoupon = async (couponId, updateData, info) => {
  const coupon = await Coupon.findByIdAndUpdate(couponId, updateData, { new: true, runValidators: true });
  if (!coupon) {
    throw new Error('Coupon not found');
  }
  // Log the update of the coupon
  await systemLog('UPDATE', updateData, couponId, 'update-coupon', coupon, info);
  return coupon;
};

module.exports = {
  uploadCouponsData,
  getAllCoupons,
  updateCoupon,
};
