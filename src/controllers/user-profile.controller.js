const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userProfileService } = require('../services');
const pick = require('../utils/pick');
const { getDeviceInfo } = require('./userAndIp');

const getAllUserProfiles = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['name', 'role', 'search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const result = await userProfileService.getAllUserProfiles(filter, options);
  res.send(result);
});

const updateUserProfile = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent']);
  const profile = await userProfileService.updateUserProfileById(req.params.profileId, req.body, info);
  res.send(profile);
});

const deleteUserProfile = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent']);
  await userProfileService.deleteUserProfileById(req.params.profileId, info);
  res.status(httpStatus.NO_CONTENT).send();
});

const getUserProfileById = catchAsync(async (req, res) => {
  const profile = await userProfileService.getUserProfileById(req.params.profileId);
  res.status(profile.status).send(profile);
});
module.exports = {
  getAllUserProfiles,
  updateUserProfile,
  deleteUserProfile,
  getUserProfileById
};
