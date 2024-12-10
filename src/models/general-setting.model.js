const mongoose = require('mongoose');
const CryptoJS = require('crypto-js');

const generalSettingSchema = new mongoose.Schema(
  {
    smtp: {
      type: String,
      trim: true,
      required: true,
    },
    port: {
      type: String,
      trim: true,
      required: true,
    },
    host: {
      type: String,
      trim: true,
      required: true,
    },
    username: {
      type: String,
      trim: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    notification_type: {
      type: [String],
    },
    status: {
      type: Number, //0 - In-ACTIVE, 1 - ACTIVE, 2 - DELETE
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

generalSettingSchema.pre('save', function (next) {
  const generalSetting = this;
  if (generalSetting.isModified('password')) {
    // Encrypt the password using AES
    const encryptedPassword = CryptoJS.AES.encrypt(
      generalSetting.password,
      process.env.JWT_SECRET
    ).toString();
    generalSetting.password = encryptedPassword;
  }
  next();
});

generalSettingSchema.pre('findOneAndUpdate', async function (next) {
  const generalSetting = this.getUpdate();
  if (generalSetting.password) {
    this.getUpdate().password = CryptoJS.AES.encrypt(
      generalSetting.password,
      process.env.JWT_SECRET
    ).toString();
  }
  next();
});

const GeneralSettingModel = mongoose.model(
  'tbl_general_settings',
  generalSettingSchema
);

module.exports = GeneralSettingModel;
