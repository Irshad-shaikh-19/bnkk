const catchAsync = require('../utils/catchAsync');
const notificationService = require('../services/notification_table.service');
const httpStatus = require('http-status');

/**
 * Create a new notification.
 */
const createNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.createNotification(req.body, req.user);
  res.status(httpStatus.CREATED).json({
    status: httpStatus.CREATED,
    message: 'Notification created successfully',
    data: notification,
  });
});

/**
 * Send notification to all users
 */
const sendNotification = catchAsync(async (req, res) => {
  const { notificationId } = req.body;

  if (!notificationId) {
    return res.status(400).json({
      success: false,
      message: 'Notification ID is required'
    });
  }

  const result = await notificationService.sendNotification({ notificationId });

  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data || null,
  });
});

/**
 * Send notification to specific user group/category
 */
const sendNotificationToGroup = catchAsync(async (req, res) => {
  const { notificationId, category } = req.body;

  if (!notificationId || !category) {
    return res.status(400).json({
      success: false,
      message: 'Notification ID and category are required'
    });
  }

  const result = await notificationService.sendNotificationToGroup({ 
    notificationId, 
    category 
  });

  // Always return the status from the service
  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data || null,
    ...(result.error && { error: result.error })
  });
});


/**
 * Send notification to specific users
 */
const sendNotificationToUsers = catchAsync(async (req, res) => {
  const { notificationId, userIds } = req.body;

  if (!notificationId || !userIds || !userIds.length) {
    return res.status(400).json({
      success: false,
      message: 'Notification ID and user IDs are required'
    });
  }

  const result = await notificationService.sendNotificationToUsers({ 
    notificationId, 
    userIds 
  });

  return res.status(result.status).json({
    success: result.success,
    message: result.message,
    data: result.data || null,
  });
});

/**
 * Get user categories with their financial data
 */
// In notification.controller.js
const getUserCategories = catchAsync(async (req, res) => {
  try {
    const results = await notificationService.getUserCategories();
    
    // Ensure we're always returning an array
    const data = Array.isArray(results) ? results : [];
    
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'User categories retrieved successfully',
      data: data, // Always return an array
      count: data.length
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Error retrieving user categories',
      data: [], // Return empty array on error
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});




/**
 * Get paginated notifications.
 */
const getNotifications = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const notificationsData = await notificationService.getNotifications(
    parseInt(page, 10),
    parseInt(limit, 10)
  );

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Notifications retrieved successfully',
    data: notificationsData.notifications,
    total: notificationsData.total,
    currentPage: notificationsData.currentPage,
    totalPages: notificationsData.totalPages,
  });
});

/**
 * Get a notification by ID.
 */
const getNotificationById = catchAsync(async (req, res) => {
  const notification = await notificationService.getNotificationById(req.params.id);

  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Notification retrieved successfully',
    data: notification,
  });
});

/**
 * Update a notification.
 */
const updateNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.updateNotification(req.params.id, req.body, req.user);

  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Notification updated successfully',
    data: notification,
  });
});

/**
 * Delete a notification.
 */
const deleteNotification = catchAsync(async (req, res) => {
  const notification = await notificationService.deleteNotification(req.params.id, req.user);

  if (!notification) {
    return res.status(httpStatus.NOT_FOUND).json({
      status: httpStatus.NOT_FOUND,
      message: 'Notification not found',
    });
  }

  res.status(httpStatus.OK).json({
    status: httpStatus.OK,
    message: 'Notification deleted successfully',
  });

});




const getUsersWithFcmTokens = catchAsync(async (req, res) => {
  try {
    const results = await notificationService.getUsersWithFcmTokens();
    
    res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Users with FCM tokens retrieved successfully',
      data: results,
      count: results.length
    });
  } catch (error) {
    console.error('Controller error:', error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: error.message || 'Error retrieving users with FCM tokens',
      data: [],
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = {
  createNotification,
  sendNotification,
  sendNotificationToGroup,
  sendNotificationToUsers,
  getUserCategories,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  getUsersWithFcmTokens
};