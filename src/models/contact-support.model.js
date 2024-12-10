const mongoose = require('mongoose');

const contactSupportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    subject: {
      type: String,
    },
    message: {
      type: String,
    },
    status: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

const ContactSupport = mongoose.model(
  'tbl_contact_support',
  contactSupportSchema
);

module.exports = ContactSupport;
