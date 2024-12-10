const { GeneralSettingModel } = require('../models');
const { commonService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const CryptoJS = require('crypto-js');
const { getDeviceInfo } = require('./userAndIp');
const updateGeneralSetting = catchAsync(async (req, res) => {
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { status, message, data } = await commonService.updateById(
    req.params.id,
    req.params.userId,
    req.body,
    GeneralSettingModel,
    'update-general-setting',
    'delete-general-setting',
    info
  );
  res.status(status).send({ status, message, data });
});

const getGeneralSetting = catchAsync(async (req, res) => {
  const { status, message, data } = await commonService.findOne(
    GeneralSettingModel
  );

  if (data && data.password) {
    const decryptedPassword = CryptoJS.AES.decrypt(
      data.password,
      process.env.JWT_SECRET
    ).toString(CryptoJS.enc.Utf8);
    data.password = decryptedPassword;
  }

  res.status(status).send({ status, message, data });
});

module.exports = {
  updateGeneralSetting,
  getGeneralSetting,
};
