const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const sections = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    title: {
      type: String,
      trim: true,
    },
    status: {
      type: Number, //0 - In-ACTIVE, 1 - ACTIVE, 2 - DELETE
      default: 1,
    },
    permissions: {
      type: Object,
    },
  },
  {
    timestamps: true,
  }
);
sections.plugin(toJSON);
sections.plugin(paginate);
const sectionsModel = mongoose.model('tbl_section', sections);

module.exports = sectionsModel;
