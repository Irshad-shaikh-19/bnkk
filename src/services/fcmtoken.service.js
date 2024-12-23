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

module.exports = {
  addFcmToken,
  getAllFcmTokens,
};
