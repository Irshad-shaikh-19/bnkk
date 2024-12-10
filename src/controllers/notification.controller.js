const catchAsync = require('../utils/catchAsync');
const { notificationService } = require('../services');

const getAllNotification = catchAsync(async (req, res) => {
  const { status, message, data } =
    await notificationService.getAllNotification();
  res.send({ status, message, data });
});

const getAllTransaction = catchAsync(async (req, res) => {
  const { status, message, data } =
    await notificationService.getAllTransaction();
  res.send({ status, message, data });
});
const getAllSameTransaction = catchAsync(async (req, res) => {
  const { status, message, data } =
    await notificationService.getAllSameTransaction(req.body);
  res.send({ status, message, data });
});

module.exports = { getAllNotification, getAllTransaction, getAllSameTransaction };
