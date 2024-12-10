const mongoose = require('mongoose');
const { toJSON, paginate } = require('./plugins');
const roleSchema = new mongoose.Schema(
  {
    role_name: {
      type: String,
      trim: true,
    },
    section_list: {
      type: Array,
    },
    status: {
      type: Number, //0 - IN-ACTIVE, 1 - ACTIVE, 2 - DELETE
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);
roleSchema.plugin(toJSON);
roleSchema.plugin(paginate);
const roleSchemaModel = mongoose.model('tbl_role', roleSchema);

module.exports = roleSchemaModel;
