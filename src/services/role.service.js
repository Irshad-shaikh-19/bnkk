const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { RoleModel, User } = require('../models');
const errorHandler = require('../utils/error.handler');
const { systemLog } = require('../utils/system-log');
const addRole = async (bodyData, userId, info) => {
  try {
    const data = await RoleModel.find({
      role_name: bodyData.role_name,
      status: { $ne: 2 },
    });
    if (data.length > 0) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Role already exist!',
        data: {},
      };
    }
    const createdData = await RoleModel.create(bodyData);
    await systemLog('CREATE', createdData, userId, 'create-role', {}, info);
    return {
      status: httpStatus.OK,
      message: ' Created.',
      data: createdData,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'add-role',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

const updateRoleStatus = async (id, userId, bodyData, info) => {
  try {
    const existingData = await RoleModel.findByIdAndUpdate(id);
    if (bodyData.status !== 1) {
      const data = await User.find({
        roles: { $in: [mongoose.Types.ObjectId(id)] },
        status: { $ne: 2 },
      });
      if (data.length > 0) {
        return {
          status: httpStatus.BAD_REQUEST,
          message: 'Given role is assigned to user!',
          data: {},
        };
      }
    }
    const updateData = await RoleModel.findByIdAndUpdate(id, bodyData);
    if (bodyData.status === 2) {
      await systemLog('DELETE', bodyData, userId, 'delete-role', existingData, info);
    } else {
      await systemLog(
        'UPDATE',
        bodyData,
        userId,
        'update-role-status',
        existingData,
        {},
        info
      );
    }

    return {
      status: httpStatus.OK,
      message: ' Updated.',
      data: updateData,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'update-role-status',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

const updateDetails = async (id, userId, bodyData, info) => {
  try {
    const Data = await RoleModel.findById(id);
    const existingData = await RoleModel.findOne({
      role_name: bodyData.role_name,
    });
    if (existingData) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Role already exist!',
        data: {},
      };
    }
    const data = await RoleModel.findByIdAndUpdate(id, bodyData);
    if (parseInt(bodyData.status) === 2) {
      await systemLog('DELETE', data, userId, 'delete-role', {}, info);
    } else {
      await systemLog('UPDATE', bodyData, userId, 'update-role', Data, info);
    }
    return {
      status: httpStatus.OK,
      message: 'Updated successfully.',
      data: data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'update-common',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

const getRoleList = async () => {
  try {
    const data = await RoleModel.find({ status: 1 });
    if (data) {
      return {
        status: httpStatus.OK,
        message: 'Get Role Sucessfully.',
        data: data,
      };
    } else {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Role not found. ',
      };
    }
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-role-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }
};

module.exports = {
  addRole,
  getRoleList,
  updateRoleStatus,
  updateDetails,
};
