const ErrorModel = require('../models/error.model');

/**
 * Log errors into the ErrorModel collection.
 * @param {object} arg - Object containing error details.
 * @param {string} arg.action_type - Type of action triggering the error.
 * @param {object} arg.error_data - Data related to the error.
 */

module.exports.errorM = function (arg) {
  const error = new ErrorModel();
  error.action_type = arg.action_type;
  error.error_data = JSON.stringify(arg.error_data);
  error.save(() => {});
};
