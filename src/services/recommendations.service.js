const httpStatus = require('http-status');
const mongoose = require('mongoose');
const { RecommendationsModel } = require('../models');
const errorHandler = require('../utils/error.handler');
const { systemLog } = require('../utils/system-log');

// Add a new recommendation
const addRecommendation = async (bodyData, userId, info) => {
  try {
    // Validate rewardType and category
    const validRewardTypes = ['points', 'amount'];
    const validCategories = ['daily', 'weekly', 'monthly', 'default'];

    if (!validRewardTypes.includes(bodyData.rewardType)) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: `Invalid rewardType. Allowed values: ${validRewardTypes.join(', ')}`,
        data: {},
      };
    }

    if (!validCategories.includes(bodyData.category)) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: `Invalid category. Allowed values: ${validCategories.join(', ')}`,
        data: {},
      };
    }

    // Check for duplicate title (case-insensitive)
    const existingData = await RecommendationsModel.findOne({
      title: { $regex: `^${bodyData.title}$`, $options: 'i' },
      isActive: true,
    });

    if (existingData) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Recommendation with the same title already exists!',
        data: {},
      };
    }

    const createdData = await RecommendationsModel.create(bodyData);
    await systemLog('CREATE', createdData, userId, 'create-recommendation', {}, info);

    return {
      status: httpStatus.OK,
      message: 'Recommendation created successfully.',
      data: createdData,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'add-recommendation',
      error_data: error,
    });
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.',
      data: {},
    };
  }
};

// Update recommendation status
const updateRecommendationStatus = async (id, userId, bodyData, info) => {
  try {
    const existingData = await RecommendationsModel.findById(id);
    if (!existingData) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Recommendation not found!',
        data: {},
      };
    }

    const updatedData = await RecommendationsModel.findByIdAndUpdate(
      id,
      { isActive: bodyData.isActive }, // Using isActive boolean field from bodyData
      { new: true, runValidators: true }
    );

    const actionType = bodyData.isActive ? 'UPDATE' : 'DELETE';
    await systemLog(actionType, updatedData, userId, 'update-recommendation-status', existingData, info);

    return {
      status: httpStatus.OK,
      message: 'Recommendation status updated successfully.',
      data: updatedData,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'update-recommendation-status',
      error_data: error,
    });
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.',
      data: {},
    };
  }
};

// Get recommendation details by ID
const getRecommendationById = async (id) => {
  try {
    const recommendation = await RecommendationsModel.findById(id);

    if (!recommendation) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Recommendation not found!',
        data: {},
      };
    }

    return {
      status: httpStatus.OK,
      message: 'Recommendation retrieved successfully.',
      data: recommendation,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-recommendation-by-id',
      error_data: error,
    });
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.',
      data: {},
    };
  }
};

// Update recommendation details
const updateRecommendationDetails = async (id, userId, bodyData, info) => {
  try {
    const existingRecommendation = await RecommendationsModel.findById(id);
    if (!existingRecommendation) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Recommendation not found!',
        data: {},
      };
    }

    const duplicateTitle = await RecommendationsModel.findOne({
      title: { $regex: `^${bodyData.title}$`, $options: 'i' },
      _id: { $ne: id },
    });

    if (duplicateTitle) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Recommendation with the same title already exists!',
        data: {},
      };
    }

    const updatedData = await RecommendationsModel.findByIdAndUpdate(
      id,
      bodyData,
      { new: true, runValidators: true }
    );

    await systemLog('UPDATE', updatedData, userId, 'update-recommendation-details', existingRecommendation, info);

    return {
      status: httpStatus.OK,
      message: 'Recommendation details updated successfully.',
      data: updatedData,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'update-recommendation-details',
      error_data: error,
    });
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.',
      data: {},
    };
  }
};

// Get all active recommendations with pagination and search
const getRecommendations = async (filter = {}, options = {}) => {
  try {
    const { search = '', category = '', isActive = true } = filter;
    const { page = 1, limit = 10, sortBy = 'createdAt:desc' } = options;

    // Search criteria
    let searchData = [{ isActive }];

    if (search) {
      const searchValue = { $regex: `.*${search}.*`, $options: 'i' };
      searchData.push({
        $or: [{ title: searchValue }, { description: searchValue }],
      });
    }

    if (category) {
      searchData.push({ category });
    }

    const skip = (page - 1) * limit;
    const sort = {};
    const [sortKey, sortOrder] = sortBy.split(':');
    sort[sortKey] = sortOrder === 'desc' ? -1 : 1;

    const countPromise = RecommendationsModel.aggregate([
      { $match: { $and: searchData } },
      { $count: 'count' },
    ]);

    const docsPromise = RecommendationsModel.aggregate([
      { $match: { $and: searchData } },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          createdAt: 1,
          rewardAmount: 1,
          rewardType: 1,
          category: 1,
        },
      },
    ]);

    const [totalCount, results] = await Promise.all([countPromise, docsPromise]);

    const totalResults = totalCount[0]?.count || 0;
    const totalPages = Math.ceil(totalResults / limit) || 1;
    const pagination = {
      length: totalResults,
      size: limit,
      page,
      lastPage: totalPages,
    };

    return {
      pagination,
      message: 'Recommendations retrieved successfully.',
      data: results,
      status: httpStatus.OK,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-recommendations',
      error_data: error,
    });
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong.',
      data: {},
    };
  }
};

module.exports = {
  addRecommendation,
  getRecommendationById,
  updateRecommendationStatus,
  updateRecommendationDetails,
  getRecommendations,
};
