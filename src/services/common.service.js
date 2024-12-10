const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');
const { systemLog } = require('../utils/system-log');

/**
 * Create a new document in the database.
 * @param {object} bodyData - Data to create the document.
 * @param {string} userId - User ID performing the action.
 * @param {Model} Model - Mongoose model for the document.
 * @param {string} key - Key identifier for system logging.
 * @returns {object} - Object containing status, message, and created data.
 */
const create = async (bodyData, userId, Model, key, info) => {
  try {
    const data = await Model.create(bodyData);
    await systemLog('CREATE', data, userId, key, {}, info);
    return {
      status: httpStatus.OK,
      message: ' Created.',
      data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'add-common',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

/**
 * Retrieve a document by its ID.
 * @param {string} id - ID of the document to retrieve.
 * @param {Model} Model - Mongoose model for the document.
 * @returns {object} - Object containing status, message, and retrieved data.
 */
const getById = async (id, Model) => {
  try {
    const data = await Model.findById(id);
    return {
      status: httpStatus.OK,
      message: 'Get Details.',
      data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'find-common',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

/**
 * Update a document by its ID.
 * @param {string} id - ID of the document to update.
 * @param {string} userId - User ID performing the action.
 * @param {object} bodyData - Data to update in the document.
 * @param {Model} Model - Mongoose model for the document.
 * @param {string} updateKey - Key identifier for update system logging.
 * @param {string} deleteKey - Key identifier for delete system logging.
 * @returns {object} - Object containing status, message, and updated data.
 */
const updateById = async (
  id,
  userId,
  bodyData,
  Model,
  updateKey,
  deleteKey,
  deviceInfo,
) => {
  const existingData = await Model.findById(id);

  try {
    const data = await Model.findByIdAndUpdate(id, bodyData);
    if (parseInt(bodyData.status) === 2) {
      await systemLog('DELETE', existingData, userId, deleteKey, {}, deviceInfo);
    } else {
      await systemLog('UPDATE', bodyData, userId, updateKey, existingData, deviceInfo);
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

/**
 * Retrieve a list of documents based on provided filters.
 * @param {object} filter - Filter criteria for retrieving documents.
 * @param {object} options - Pagination and sorting options.
 * @param {Model} Model - Mongoose model for the documents.
 * @param {object} search - Search criteria.
 * @returns {object} - Paginated list of documents.
 */
const getList = async (filter, options, Model, search) => {
  try {
    const data = await Model.paginate(
      { ...filter, status: { $ne: 2 } },
      options,
      search
    );
    return data;
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-common-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

/**
 * Retrieve all documents based on query conditions.
 * @param {object} query - Query conditions for retrieving documents.
 * @param {Model} Model - Mongoose model for the documents.
 * @returns {object} - Object containing status, message, and retrieved data.
 */
const getAllList = async (query, Model) => {
  try {
    const data = await Model.find(query.fields, query.projection);
    return {
      status: httpStatus.OK,
      message: 'Success',
      data: data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-f-details-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }
};

/**
 * Add a new document if it doesn't already exist.
 * @param {object} bodyData - Data to add in the document.
 * @param {string} userId - User ID performing the action.
 * @param {Model} Model - Mongoose model for the document.
 * @param {string} message - Error message if document already exists.
 * @param {string} key - Key identifier for system logging.
 * @returns {object} - Object containing status, message, and added data.
 */
const add = async (bodyData, userId, Model, message, key, deviceInfo) => {
  try {
    const faqItems = bodyData.faqItems;
    const results = [];

    for (const item of faqItems) {
      // Add userId to the item
      item.userId = userId;

      if (item._id) {
        // If _id exists, update the document
        const updatedItem = await Model.findOneAndUpdate(
          {
            _id: item._id,
            status: { $ne: 2 }, // Exclude items with status 2 (soft deleted)
          },
          item,
          { new: true } // Return the updated document
        );

        if (updatedItem) {
          results.push(updatedItem);
          await systemLog('UPDATE', updatedItem, userId, key, {}, deviceInfo);
        } else {
          return {
            status: httpStatus.NOT_FOUND,
            message: 'Document not found for update.',
          };
        }
      } else {
        // If _id doesn't exist, create a new document
        const newItem = await Model.create(item);
        results.push(newItem);
        await systemLog('CREATE', newItem, userId, key, {}, deviceInfo);
      }
    }

    return {
      status: httpStatus.OK,
      message: 'Created/Updated.',
      data: results,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'add-common',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
};

//     return {
//       status: httpStatus.OK,
//       message: 'Created/Updated.',
//       data: results,
//     };
//   } catch (error) {
//     errorHandler.errorM({
//       action_type: 'add-common',
//       error_data: error,
//     });
//     return {
//       status: httpStatus.BAD_REQUEST,
//       message: 'Something Went Wrong.',
//       data: {},
//     };
//   }
// };

const addFaqData = async (bodyData, userId, Model, key, value, info) => {
  try {
    bodyData.userId = userId;
    const data = await Model.create(bodyData);
    await systemLog('CREATE', data, userId, key, {}, info);
    return {
      status: httpStatus.OK,
      message: ' Created.',
      data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'add-common',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      data: {},
    };
  }
}
/**
 * Update a document by its ID if certain conditions are met.
 * @param {string} id - ID of the document to update.
 * @param {string} userId - User ID performing the action.
 * @param {object} bodyData - Data to update in the document.
 * @param {Model} Model - Mongoose model for the document.
 * @param {string} message - Error message if conditions are not met.
 * @param {string} updateKey - Key identifier for update system logging.
 * @param {string} deleteKey - Key identifier for delete system logging.
 * @returns {object} - Object containing status, message, and updated data.
 */
const uniqueUpdateById = async (
  id,
  userId,
  bodyData,
  Model,
  message,
  updateKey,
  deleteKey,
  info
) => {
  if (
    parseInt(bodyData.status) != 2 &&
    parseInt(bodyData.status) != 0 &&
    parseInt(bodyData.status) != 1
  ) {
    const data = await Model.find({
      ...bodyData,
      _id: { $ne: id },
      status: { $ne: 2 },
    });
    if (data.length > 0) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: message,
      };
    }
  }
  const existingData = await Model.findById(id);

  try {
    const data = await Model.findByIdAndUpdate(id, bodyData);
    if (parseInt(bodyData.status) === 2) {
      await systemLog('DELETE', existingData, userId, deleteKey, {}, info);
    } else {
      await systemLog('UPDATE', bodyData, userId, updateKey, existingData);
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

const findOne = async (Model) => {
  try {
    const data = await Model.findOne();
    if (!data) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'No records found.',
        data: {},
      };
    }
    return {
      status: httpStatus.OK,
      message: 'Get Details.',
      data,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'find-common',
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
  create,
  getById,
  updateById,
  getList,
  getAllList,
  add,
  addFaqData,
  uniqueUpdateById,
  findOne,
};
