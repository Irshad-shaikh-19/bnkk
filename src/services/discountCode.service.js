const DiscountCode = require('../models/discountCode.model');

exports.createDiscountCode = async (data) => {
  return await DiscountCode.create(data);
};

exports.getAllDiscountCodes = async () => {
  return await DiscountCode.find();
};

exports.getDiscountCodeById = async (id) => {
  return await DiscountCode.findById(id);
};

exports.updateDiscountCode = async (id, data) => {
  data.updatedAt = new Date();
  return await DiscountCode.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteDiscountCode = async (id) => {
  return await DiscountCode.findByIdAndDelete(id);
};
