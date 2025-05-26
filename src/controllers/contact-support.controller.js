const catchAsync = require('../utils/catchAsync');
const { contactSupportService } = require('../services');
const pick = require('../utils/pick');

const getAllContactSupport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'status', 'startDate', 'endDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await contactSupportService.getAllContactSupport(filter, options);
  res.send(result);
});

const createContactSupport = catchAsync(async (req, res) => {
  const result = await contactSupportService.createContactSupport(req.body);
  res.status(result.status).send(result);
});

const getContactSupport = catchAsync(async (req, res) => {
  const result = await contactSupportService.getContactSupportById(req.params.id);
  res.status(result.status).send(result);
});

const updateContactSupport = catchAsync(async (req, res) => {
  const result = await contactSupportService.updateContactSupport(
    req.params.id,
    req.body
  );
  res.status(result.status).send(result);
});

const deleteContactSupport = catchAsync(async (req, res) => {
  const result = await contactSupportService.deleteContactSupport(req.params.id);
  res.status(result.status).send(result);
});

module.exports = {
  getAllContactSupport,
  createContactSupport,
  getContactSupport,
  updateContactSupport,
  deleteContactSupport,
};