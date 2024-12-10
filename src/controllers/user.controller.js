const httpStatus = require('http-status');
const pick = require('../utils/pick');
const catchAsync = require('../utils/catchAsync');
const { userService } = require('../services');
const { getDeviceInfo } = require('./userAndIp');
const createUser = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const user = await userService.createUser(req.body, info);
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userService.queryUsers(filter, options);
  res.send(result);
});

const getUser = catchAsync(async (req, res) => {
  const { status, message, user, userProfile } = await userService.getUserById(
    req.params.userId
  );

  res.send({ status, message, user, userProfile });
});

const getUserDetails = catchAsync(async (req, res) => {
  const { status, message, user } = await userService.getUserDetails(
    req.params.userId
  );
  res.send({ status, message, user });
});
const updateUser = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const user = await userService.updateUserById(req.params.userId, req.body, info);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  await userService.deleteUserById(req.params.userId, { status: 2 }, info);
  res.status(httpStatus.NO_CONTENT).send();
});

const updateUserStatus = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message } = await userService.updateUserStatus(
    req.params.id,
    req.params.userId,
    req.body,
    info
  );
  res.status(status).send({ status, message });
});

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserStatus,
  getUserDetails,
};
