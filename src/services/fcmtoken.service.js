const httpStatus = require('http-status');
const FcmToken = require('../models/fcmtoken.model');
const { systemLog } = require('../utils/system-log');

/**
 * Add a new FCM token
 */
const addFcmToken = async (bodyData, info) => {
  try {
    if (!bodyData || !bodyData.token || typeof bodyData.token !== 'string' || !bodyData.token.trim()) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Token is required and must be a non-empty string.',
        data: {},
      };
    }

    // Log the received body data
    console.log('Received body data in addFcmToken:', bodyData);

    // Check for duplicate token
    const existingToken = await FcmToken.findOne({ token: bodyData.token.trim() });
    if (existingToken) {
      // If token exists but with different userId, update it
      if (bodyData.userId && existingToken.userId !== bodyData.userId) {
        existingToken.userId = bodyData.userId;
        await existingToken.save();
        
        await systemLog('UPDATE_FCM_TOKEN', bodyData, existingToken._id, 'update-fcm-token', existingToken, info);
        
        return {
          status: httpStatus.OK,
          message: 'FCM Token updated with new user ID.',
          data: existingToken,
        };
      }
      
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'This token is already registered.',
        data: {},
      };
    }

    // Create a new FCM token
    const createdToken = await FcmToken.create({
      token: bodyData.token.trim(),
      userId: bodyData.userId || null, // If userId is provided, include it
    });

    // Log the addition of the token
    await systemLog('CREATE_FCM_TOKEN', createdToken, bodyData.userId, 'add-fcm-token', {}, info);

    return {
      status: httpStatus.OK,
      message: 'FCM Token added successfully.',
      data: createdToken,
    };
  } catch (error) {
    console.error('Error in addFcmToken:', error.stack);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while adding the FCM token.',
      data: {},
    };
  }
};

/**
 * Get all FCM tokens
 */
const getAllFcmTokens = async () => {
  try {
    const tokens = await FcmToken.find()
      .populate('userId', 'firstName lastName') // Populate user details if needed
      .select('token userId createdAt')
      .sort({ createdAt: -1 }); // Sorting by most recent

    return {
      status: httpStatus.OK,
      message: 'FCM Tokens retrieved successfully.',
      data: tokens,
    };
  } catch (error) {
    console.error('Error in getAllFcmTokens:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while fetching FCM tokens.',
      data: {},
    };
  }
};

/**
 * Get FCM tokens by user IDs
 */
const getFcmTokensByUserIds = async (userIds) => {
  try {
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'User IDs array is required.',
        data: [],
      };
    }

    const tokens = await FcmToken.find({ userId: { $in: userIds } })
      .select('token userId')
      .populate('userId', 'firstName lastName');

    return {
      status: httpStatus.OK,
      message: 'FCM Tokens retrieved successfully.',
      data: tokens,
    };
  } catch (error) {
    console.error('Error in getFcmTokensByUserIds:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while fetching FCM tokens by user IDs.',
      data: [],
    };
  }
};

/**
 * Update FCM token with user ID
 */
const updateFcmTokenUserId = async (token, userId) => {
  try {
    if (!token || !userId) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Token and user ID are required.',
        data: {},
      };
    }

    const updatedToken = await FcmToken.findOneAndUpdate(
      { token: token },
      { userId: userId },
      { new: true }
    );

    if (!updatedToken) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'FCM Token not found.',
        data: {},
      };
    }

    return {
      status: httpStatus.OK,
      message: 'FCM Token updated successfully.',
      data: updatedToken,
    };
  } catch (error) {
    console.error('Error in updateFcmTokenUserId:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while updating the FCM token.',
      data: {},
    };
  }
};

/**
 * Delete FCM token
 */
const deleteFcmToken = async (tokenId) => {
  try {
    if (!tokenId) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Token ID is required.',
        data: {},
      };
    }

    const deletedToken = await FcmToken.findByIdAndDelete(tokenId);
    
    if (!deletedToken) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'FCM Token not found.',
        data: {},
      };
    }

    return {
      status: httpStatus.OK,
      message: 'FCM Token deleted successfully.',
      data: deletedToken,
    };
  } catch (error) {
    console.error('Error in deleteFcmToken:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Something went wrong while deleting the FCM token.',
      data: {},
    };
  }
};

module.exports = {
  addFcmToken,
  getAllFcmTokens,
  getFcmTokensByUserIds,
  updateFcmTokenUserId,
  deleteFcmToken,
};