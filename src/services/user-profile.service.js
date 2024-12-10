const httpStatus = require('http-status');
const { UserProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const { systemLog } = require('../utils/system-log');

/**
 * Get all user profiles with filtering, pagination, and search
 * @param {Object} filter - Filter options
 * @param {Object} options - Query options
 * @returns {Promise<Object>}
 */
const getAllUserProfiles = async (filter, options) => {
  try {
    let searchData = [];

    if (filter.search) {
      const searchValue = {
        $regex: '.*' + filter.search + '.*',
        $options: 'i',
      };
      searchData.push({
        $or: [
          { firstName: searchValue },
          { lastName: searchValue },
          { preferredName: searchValue },
          { nationality: searchValue },
        ],
      });
    }

    if (filter.isKycDone !== undefined) {
      searchData.push({ isKycDone: filter.isKycDone });
    }
    if (filter.hasAcceptedTandC !== undefined) {
      searchData.push({ hasAcceptedTandC: filter.hasAcceptedTandC });
    }

    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const skip = (page - 1) * limit;

    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      sort = { [key]: order === 'desc' ? -1 : 1 };
    }

    const totalResults = await UserProfile.countDocuments(searchData.length ? { $and: searchData } : {});
    const results = await UserProfile.find(searchData.length ? { $and: searchData } : {})
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalResults / limit);

    const pagination = {
      length: totalResults,
      size: limit,
      page: page,
      lastPage: totalPages,
    };

    return {
      pagination,
      data: results,
      status: httpStatus.OK,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Something went wrong while fetching user profiles.');
  }
};

/**
 * Get user profile by ID
 * @param {ObjectId} id
 * @returns {Promise<Object>}
 */
const getUserProfileById = async (id) => {
  try {
    const userProfile = await UserProfile.findById(id);
    if (!userProfile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
    }
    return {
      status: httpStatus.OK,
      message: 'Profile retrieved successfully',
      userProfile,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error retrieving user profile.');
  }
};

/**
 * Update user profile by ID
 * @param {ObjectId} profileId
 * @param {Object} updateBody
 * @param {Object} info - Information about the user making the request
 * @returns {Promise<Object>}
 */
const updateUserProfileById = async (profileId, updateBody, info) => {
  console.log('first', profileId,updateBody,info)
  try {
    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
    }
    // Check if the user making the request is a superadmin
    // if (!info.isSuperAdmin) {
    //   throw new ApiError(httpStatus.FORBIDDEN, 'Only superadmins can update user profiles.');
    // }
    Object.assign(profile, updateBody);
    await profile.save();
    await systemLog('UPDATE', updateBody, profile._id, 'update-user-profile', profile, info);
    return {
      status: httpStatus.OK,
      message: 'Profile updated successfully',
      profile,
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error);
  }
};

/**
 * Delete user profile by ID
 * @param {ObjectId} profileId
 * @param {Object} info - Information about the user making the request
 * @returns {Promise<Object>}
 */
const deleteUserProfileById = async (profileId, info) => {
  try {
    const profile = await UserProfile.findById(profileId);
    if (!profile) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Profile not found');
    }

    await profile.remove();
    await systemLog('DELETE', profile, profileId, 'delete-user-profile', {}, info);

    return {
      status: httpStatus.OK,
      message: 'Profile deleted successfully',
    };
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Error deleting user profile.');
  }
};

module.exports = {
  getAllUserProfiles,
  getUserProfileById,
  updateUserProfileById,
  deleteUserProfileById,
};
