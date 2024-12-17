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
      bodyData,
      { new: true, runValidators: true }
    );

    const actionType = parseInt(bodyData.status) === 2 ? 'DELETE' : 'UPDATE';
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

// Get all active recommendations with pagination
const getRecommendations = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const data = await RecommendationsModel.find({ isActive: true })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await RecommendationsModel.countDocuments({ isActive: true });

    return {
      status: httpStatus.OK,
      message: 'Recommendations retrieved successfully.',
      data: {
        recommendations: data,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalRecords: total,
        },
      },
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
