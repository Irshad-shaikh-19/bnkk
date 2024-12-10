const catchAsync = require('../utils/catchAsync');
const { commonService, roleService } = require('../services');
const { RoleModel } = require('../models');
const pick = require('../utils/pick');
const { getDeviceInfo } = require('./userAndIp');

const getRoleList = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'status']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const data = await commonService.getList(filter, options, RoleModel, [
    'role_name',
  ]);
  res.send(data);
});

const addRole = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message, data } = await roleService.addRole(
    req.body,
    req.params.userId,
    info
  );
  res.status(status).send({ status, message, data });
});

const updateRole = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message, data } = await commonService.updateById(
    req.params.id,
    req.params.userId,
    req.body,
    RoleModel,
    'update-role',
    'delete-role',
    info
  );
  res.status(status).send({ status, message, data });
});

const updateRoleStatus = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message, data } = await roleService.updateRoleStatus(
    req.params.id,
    req.params.userId,
    req.body,
    info
  );
  res.status(status).send({ status, message, data });
});

const getRoleById = catchAsync(async (req, res) => {
  const { status, message, data } = await commonService.getById(
    req.params.id,
    RoleModel
  );
  res.status(status).send({ status, message, data });
});

const getRole = catchAsync(async (req, res) => {
  const { status, message, data } = await roleService.getRoleList();
  res.status(status).send({ status, message, data });
});

module.exports = {
  getRoleList,
  addRole,
  updateRole,
  getRoleById,
  getRole,
  updateRoleStatus,
};
