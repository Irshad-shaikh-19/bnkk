const SystemLogsModel = require('../models/system-logs.model');

/**
 * Log system operations such as CREATE, UPDATE, or DELETE along with relevant data.
 * @param {string} operationType - Type of operation (e.g., CREATE, UPDATE, DELETE).
 * @param {object} data - Data associated with the operation.
 * @param {string} userId - ID of the user performing the operation.
 * @param {string} key - Key identifier for the operation.
 * @param {object} [oldData={}] - (Optional) Old data before the update operation (only applicable for UPDATE).
 * @param {object} deviceInfo - Information about the device and IP address of the user.
 */
const systemLog = async (operationType, data, userId, key, oldData = {}, deviceInfo = {
  ip_address: "",
  device: "",
}) => {
  const operationData = {
    operation: operationType,
    operation_by: userId,
    key: key,
    ip_address: deviceInfo.ip_address,
    device: deviceInfo.device,
  };

  // Handle UPDATE operation by comparing old and new data
  if (operationType === 'UPDATE') {
    const updatedFields = extractUpdatedFields(oldData, data);
    operationData.operation_data = {
      oldData: {
        _id: oldData._id,
        ...updatedFields.oldData,
      },
      updatedData: updatedFields.updatedData,
    };
  } else {
    operationData.operation_data = data;
  }

  // Log the operation to the database
  await SystemLogsModel.create(operationData);
};

/**
 * Extract updated fields by comparing old and new data.
 * @param {object} oldData - Old data before the update operation.
 * @param {object} updatedData - Updated data after the update operation.
 * @returns {object} - Object containing the changes between old and new data.
 */
const extractUpdatedFields = (oldData, updatedData) => {
  const changes = {
    oldData: {},
    updatedData: {},
  };

  for (const key in updatedData) {
    if (oldData[key] !== updatedData[key]) {
      changes.oldData[key] = oldData[key];
      changes.updatedData[key] = updatedData[key];
    }
  }
  return changes;
};

module.exports = {
  systemLog,
};
