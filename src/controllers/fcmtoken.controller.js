const catchAsync = require('../utils/catchAsync');
const { fcmtokenService } = require('../services');
const httpStatus = require('http-status');

/**
 * Centralized response handler
 */
const handleResponse = (res, { status, message, data, pagination = null }) => {
  res.status(status).json({ status, message, data, pagination });
};

/**
 * Add a new FCM Token
 */
const addFcmToken = catchAsync(async (req, res) => {
  const bodyData = req.body;

  // Log the bodyData received
  console.log('Received body data for FCM token:', bodyData);

  // Call the service to add the token
  const response = await fcmtokenService.addFcmToken(bodyData, { ip: req.ip });
  console.log('Response from addFcmToken service:', response); // Log service response

  handleResponse(res, response);
});

/**
 * Get all FCM Tokens
 */
const getAllFcmTokens = catchAsync(async (req, res) => {
  // Log request for getting all tokens
  console.log('Fetching all FCM tokens.');

  // Call the service to retrieve all tokens
  const response = await fcmtokenService.getAllFcmTokens();
  console.log('Response from getAllFcmTokens service:', response); // Log service response

  handleResponse(res, response);
});

module.exports = {
  addFcmToken,
  getAllFcmTokens,
};
