const catchAsync = require('../utils/catchAsync');
const { contactSupportService } = require('../services');
const pick = require('../utils/pick');

const getAllContactSupport = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'status', 'startDate', 'endDate']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } =
    await contactSupportService.getAllContactSupport(filter, options);
  res.send({ status, message, data, pagination });
});

module.exports = { getAllContactSupport };
