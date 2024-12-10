const catchAsync = require('../utils/catchAsync');
const { commonService, faqService } = require('../services');
const { FaqModel } = require('../models/index');
const pick = require('../utils/pick');
const { getDeviceInfo } = require('./userAndIp');
const addFaq = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.addFaqData(
    req.body,
    req.params.userId,
    FaqModel,
    'create-faq',
    'Faq already exist.'
    , info
  );
  res.status(status).send({ status, message });
});

const getFaById = catchAsync(async (req, res) => {
  const { status, message, data } = await commonService.getById(
    req.params.id,
    FaqModel
  );
  res.status(status).send({ status, message, data: data });
});

const updateFaq = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.updateById(
    req.params.id,
    req.params.userId,
    req.body,
    FaqModel,
    'update-faq',
    'delete-faq',
    info
  );
  res.status(status).send({ status, message });
})

const updateFaqById = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.uniqueUpdateById(
    req.params.id,
    req.params.userId,
    req.body,
    FaqModel,
    'Faq already exist.',
    'update-Faq',
    'delete-Faq',
    info
  );
  res.status(status).send({ status, message });
});

// const getFaqList = catchAsync(async (req, res) => {
//     const data = await FaqModel.find({ status: { $ne: 2 } });
//     res.send(data);
// });
const getFaqList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } = await faqService.getFaqList(
    filter,
    options
  );
  res.send({ status, message, data, pagination });
});

module.exports = {
  getFaqList,
  updateFaqById,
  getFaById,
  addFaq,
  updateFaq,
  // addFaqData
};
