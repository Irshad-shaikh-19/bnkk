const mongoose = require('mongoose');
const { objectId } = require('../validations/custom.validation');

const accountSchema = new mongoose.Schema({
  institution: {
    type: String,
    required: true,
  },
  plaidAccountId: {
    type: String,
    required: true,
  },
  user: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mask: {
    type: String,
  },
  type: {
    type: String,
    required: true,
  },
  verificationStatus: {
    type: String,
  },
  currencyCode: {
    type: String,
  },
  currentBalance: {
    type: Number,
    required: true,
  },
  availableBalance: {
    type: Number,
  },
  officialName: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
  updated: {
    type: Date,
    default: Date.now,
  },
  __v: {
    type: Number,
    default: 0,
  },
});

const UserAccounts = mongoose.model('useraccounts', accountSchema);

module.exports = UserAccounts;
