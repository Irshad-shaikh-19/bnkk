const mongoose = require('mongoose');

const institutionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  oauth: {
    type: Boolean,
    required: true,
  },
  url: {
    type: String,
  },
  primaryColor: {
    type: String,
    minlength: 7,
    maxlength: 7,
  },
  logo: {
    type: String,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  order: {
    type: Number,
  },
  plaidInstitutionId: {
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

const Institution = mongoose.model('institutions', institutionSchema);

module.exports = Institution;
