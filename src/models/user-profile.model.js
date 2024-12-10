const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  preferredName: {
    type: String,
  },
  goals: {
    type: [String],
  },
  reference_medium: {
    type: [String],
  },
  incomeRangeStart: {
    type: Number,
  },
  incomeRangeEnd: {
    type: Number,
  },
  address: {
    house: {
      type: String,
    },
    street: {
      type: String,
    },
    city: {
      type: String,
    },
    pincode: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  isKycDone: {
    type: Boolean,
    default: false,
  },
  hasAcceptedTandC: {
    type: Boolean,
    default: false,
  },
  isLeaderboardOptedIn: { // Add this field
    type: Boolean,
    default: false,
  },
  created: {
    type: Date,
  },
  updated: {
    type: Date,
  },
  __v: {
    type: Number,
    default: 0,
  },
  budgetingFamiliarity: {
    type: String,
  },
  nationality: {
    type: String,
  },
  contact_no: {
    type: String,
  },
  dob: {
    day: {
      type: String,
    },
    month: {
      type: String,
    },
    year: {
      type: String,
    },
  },
});

const UserProfile = mongoose.model('userprofiles', userSchema);

module.exports = UserProfile;
