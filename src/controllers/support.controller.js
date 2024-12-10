const catchAsync = require('../utils/catchAsync');
const { supportService, commonService } = require('../services');
const { SupportModel, CategoryModel } = require('../models/index');
const { getDeviceInfo } = require('./userAndIp');
const pick = require('../utils/pick');

const getAllSupport = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'search',
    'status',
    'startDate',
    'endDate',
    'isSuperAdmin',
    'userId',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } =
    await supportService.getAllSupport(filter, options);
  res.send({ status, message, data, pagination });
});

const addSupport = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  req.body['user'] = req.params.userId;
  if (Object.keys(req.files).length > 0) {
    let filename = req.files.file.path.split('/').pop();
    let picture = filename.replace('uploads\\', '');
    req.body['file'] = picture;
  }
  const { status, message } = await commonService.create(
    req.body,
    req.params.userId,
    SupportModel,
    'create-support',
    info
  );
  res.status(status).send({ status, message });
});

const addCategory = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.create(
    req.body,
    req.params.userId,
    CategoryModel,
    'create-category',
    info
  );
  res.status(status).send({ status, message });
});

const getCategory = catchAsync(async (req, res) => {
  const Category = await CategoryModel.find(
    { status: { $ne: 2 } },
    'category_name'
  );
  res.status(200).send({ data: Category });
});

const updateSupportStatus = catchAsync(async (req, res) => {
  // req.body['user'] = req.params.userId;
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.updateById(
    req.params.id,
    req.params.userId,
    req.body,
    SupportModel,
    'update-support-status',
    'delete-support',
    info
  );
  res.status(status).send({ status, message });
});

const importSheet = catchAsync(async (req, res) => {
  let filename = req.files.file.path.split('/').pop();
  let picture = filename.replace('uploads\\', '');
  return res.status(200).send({ status: 200, picture });
});

module.exports = {
  getAllSupport,
  addSupport,
  updateSupportStatus,
  addCategory,
  getCategory,
  importSheet,
};
