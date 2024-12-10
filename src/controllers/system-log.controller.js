const catchAsync = require('../utils/catchAsync');
const { systemLogService } = require('../services');
const commonService = require('../services/common.service');
const pick = require('../utils/pick');
const mongoose = require('mongoose');
const SystemLog = require('../models/system-logs.model');
const { getDeviceInfo } = require('./userAndIp');
const { systemLog } = require('../utils/system-log');
const getAllSystemLog = catchAsync(async (req, res) => {

  const filter = pick(req.query, [
    'search',
    'status',
    'startDate',
    'endDate',
    'csv',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } =
    await systemLogService.getAllSystemLog(filter, options);
  res.send({ status, message, data, pagination });
});

const SignOutLog = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { id } = req.params;
  const { operation_data } = req.body;

  await systemLog('LOGOUT', operation_data, id, 'user-logout', {}, info);
  res.status(200).send({ status: 200, message: 'user logout' });
});
module.exports = { getAllSystemLog, SignOutLog };
