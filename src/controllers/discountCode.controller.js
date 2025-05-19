const discountCodeService = require('../services/discountCode.service');

exports.create = async (req, res) => {
  try {
    const discountCode = await discountCodeService.createDiscountCode(req.body);
    res.status(201).json(discountCode);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const codes = await discountCodeService.getAllDiscountCodes();
    res.status(200).json(codes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const code = await discountCodeService.getDiscountCodeById(req.params.id);
    if (!code) return res.status(404).json({ message: 'Discount code not found' });
    res.status(200).json(code);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const updated = await discountCodeService.updateDiscountCode(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Discount code not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const deleted = await discountCodeService.deleteDiscountCode(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Discount code not found' });
    res.status(200).json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
