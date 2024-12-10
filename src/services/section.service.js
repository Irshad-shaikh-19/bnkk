const httpStatus = require('http-status');
const { SectionsModel, RoleModel } = require('../models');
const errorHandler = require('../utils/error.handler');
const { systemLog } = require('../utils/system-log');

const getSectionList = async () => {
  try {
    const data = await SectionsModel.find({ status: 1 }).sort({
      createdAt: 1,
    });
    if (data) {
      return {
        status: httpStatus.OK,
        message: 'Get Section Sucessfully.',
        data: data,
      };
    } else {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Section not found. ',
      };
    }
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-section-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }
};

const updateStatus = async (id, userId, bodyData, info) => {
  try {
    const Data = await SectionsModel.findById(id);
    const data = await SectionsModel.findByIdAndUpdate(id, bodyData);
    await RoleModel.updateMany(
      {
        'section_list.id': id,
      },
      {
        $set: {
          'section_list.$[i].status': bodyData.status,
        },
      },
      {
        arrayFilters: [
          {
            'i.id': id,
          },
        ],
      }
    );
    await systemLog('UPDATE', bodyData, userId, 'update-section', Data, info);
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

const deleteSection = async (id, userId, bodyData, info) => {
  try {
    const data = await SectionsModel.findByIdAndUpdate(id, bodyData);
    await RoleModel.updateMany(
      {
        'section_list.id': id,
      },
      {
        $pull: {
          section_list: {
            id: id,
          },
        },
      }
    );
    await systemLog('DELETE', data, userId, 'delete-section', {}, info);
    return {
      status: httpStatus.OK,
      message: 'Deleted successfully.',
      data: data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'delete-section',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

module.exports = {
  getSectionList,
  updateStatus,
  deleteSection,
};
