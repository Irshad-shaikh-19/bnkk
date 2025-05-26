const mongoose = require('mongoose');

const contactSupportSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Open', 'Pending', 'Closed'],
      default: 'Open',
    },
  },
  { timestamps: true }
);

const ContactSupport = mongoose.model(
  'tbl_contact_support',
  contactSupportSchema
);

module.exports = ContactSupport;