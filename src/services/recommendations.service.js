const httpStatus = require('http-status');
const Recommendations = require('../models/recommendations.model');
const { systemLog } = require('../utils/system-log');

// Add a new recommendation
const addRecommendation = async (bodyData, info) => {
  try {
    // Manual validation of required fields
    if (!bodyData.title || typeof bodyData.title !== 'string' || !bodyData.title.trim()) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Title is required and must be a non-empty string.',
        data: {},
      };
    }

    if (!bodyData.description || typeof bodyData.description !== 'string' || !bodyData.description.trim()) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Description is required and must be a non-empty string.',
        data: {},
      };
    }

  

    if (
      !bodyData.expiresAt ||
      isNaN(Date.parse(bodyData.expiresAt)) ||
      new Date(bodyData.expiresAt) <= new Date()
    ) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Expiration date must be a valid future date.',
        data: {},
      };
    }

    // Log attempt
    await systemLog('CREATE_ATTEMPT', bodyData, null, 'add-recommendation', {}, info); // No userId is needed

    // Check for duplicate title
    const existingData = await Recommendations.findOne({
      title: { $regex: `^${bodyData.title.trim()}$`, $options: 'i' },
      isActive: true,
    });

    if (existingData) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Recommendation with the same title already exists!',
        data: {},
      };
    }

    // Create the recommendation
    const createdData = await Recommendations.create(bodyData);

    // Log success
    await systemLog('CREATE_SUCCESS', createdData, null, 'add-recommendation', {}, info); // No userId is needed

    return {
      status: httpStatus.OK,
      message: 'Recommendation created successfully.',
      data: createdData,
    };
  } catch (error) {
    console.error('Error in addRecommendation:', error);

    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while creating the recommendation.',
      data: {},
    };
  }
};










const updateRecommendationStatus = async (id, bodyData) => {
  try {
    const updatedRecommendation = await Recommendations.findByIdAndUpdate(id, bodyData, { new: true });
    if (!updatedRecommendation) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Recommendation not found.',
      };
    }

    return {
      status: httpStatus.OK,
      message: 'Updated successfully.',
      data: updatedRecommendation, 
    };
  } catch (error) {
    console.error('Error in updateRecommendationStatus:', error);
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something went wrong.',
    };
  }
};





// Get recommendation details by ID
const getRecommendationById = async (id) => {
  try {
   
    const recommendation = await Recommendations.findById(id);
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
    console.error('Error in getRecommendationById:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while fetching the recommendation.',
      data: {},
    };
  }
};



// Update recommendation details (e.g., title, description, etc.)
const updateRecommendationDetails = async (id,  bodyData) => {
  try {
    // Ensure expiration date is valid
    if (bodyData.expiresAt && new Date(bodyData.expiresAt) <= new Date()) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Expiration date must be in the future.',
        data: {},
      };
    }

    // Update the recommendation with the new data
    const updatedData = await Recommendations.findByIdAndUpdate(id, bodyData, { new: true });

    if (!updatedData) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'Recommendation not found!',
        data: {},
      };
    }

    // Log the update action
    await systemLog('UPDATE', updatedData, userId, 'update-recommendation-details', {}, info);

    return {
      status: httpStatus.OK,
      message: 'Recommendation updated successfully.',
      data: updatedData,
    };
  } catch (error) {
    console.error('Error in updateRecommendationDetails:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while updating the recommendation.',
      data: {},
    };
  }
};


const getRecommendations = async (filter = {}, options = {}) => {
  try {
    const { search = '' } = filter;
    const { page = 1, limit = 10, sortBy = 'createdAt:desc' } = options;

    // Build search query
    const query = {};
    if (search.trim()) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Sorting and pagination
    const [sortKey, sortOrder] = sortBy.split(':');
    const sort = { [sortKey]: sortOrder === 'desc' ? -1 : 1 };
    const skip = (page - 1) * limit;

    // Fetch results and count in parallel
    const [results, totalCount] = await Promise.all([
      Recommendations.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('title description rewardType isActive rewardAmount category expiresAt createdAt'),
      Recommendations.countDocuments(query),
    ]);

    // Calculate total pages
    const totalPages = Math.ceil(totalCount / limit);

    // Return response
    return {
      status: httpStatus.OK,
      message: 'Recommendations retrieved successfully.',
      data: results,
      pagination: {
        page,         // Current page
        limit,        // Number of items per page
        totalCount,   // Total records
        totalPages,   // Total pages
      },
    };
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while fetching the recommendations.',
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
