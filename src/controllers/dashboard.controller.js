const { dashboardService } = require('../services');
const catchAsync = require('../utils/catchAsync');
// const pick = require('../utils/pick');

const getTransactionCount = catchAsync(async (req, res) => {
  const { status, Message, data } =
    await dashboardService.getTransactionCount();
  return res.status(status).send({ status, Message, data });
});

const getTransactionTypeCount = catchAsync(async (req, res) => {
  const { status, Message, data } =
    await dashboardService.getTransactionTypeCount();
  return res.status(status).send({ status, Message, data });
});

module.exports = {
  getTransactionCount,
  getTransactionTypeCount,
};
