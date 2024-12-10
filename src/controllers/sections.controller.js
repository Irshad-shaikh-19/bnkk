const catchAsync = require('../utils/catchAsync');
const { commonService, sectionService } = require('../services');
const { SectionsModel } = require('../models');
const pick = require('../utils/pick');
const { getDeviceInfo } = require('./userAndIp');

const getSectionList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const data = await commonService.getList(filter, options, SectionsModel, [
    'name',
  ]);
  res.send(data);
});

const getSection = catchAsync(async (req, res) => {
  const { status, message, data } = await sectionService.getSectionList();
  res.status(status).send({ status, message, data });
});

const addSection = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.add(
    req.body,
    req.params.userId,
    SectionsModel,
    'Section already exist.',
    'create-section',
    info
  );
  res.status(status).send({ status, message });
});

const updateSection = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await commonService.uniqueUpdateById(
    req.params.id,
    req.params.userId,
    req.body,
    SectionsModel,
    'Section already exist.',
    'update-section',
    'delete-section',
    info
  );
  res.status(status).send({ status, message });
});

const updateSectionStatus = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await sectionService.updateStatus(
    req.params.id,
    req.params.userId,
    req.body,
    info
  );
  res.status(status).send({ status, message });
});
const deleteSection = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await sectionService.deleteSection(
    req.params.id,
    req.params.userId,
    req.body,
    info
  );
  res.status(status).send({ status, message });
});

module.exports = {
  getSectionList,
  addSection,
  updateSection,
  getSection,
  updateSectionStatus,
  deleteSection,
};
