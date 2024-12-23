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


const sendNotification = catchAsync(async (req, res) => {
  const { title, description, data, notificationId } = req.body;

  // Validate required fields
  if (!title || !description) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Title and description are required.',
    });
  }

  try {
    console.log('Initiating notification send:', { title, description, data, notificationId });

    // Delegate to service layer
    const response = await notificationService.sendNotification({
      title,
      description,
      data,
      notificationId,
    });

    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Notification sent successfully',
      data: response,
    });
  } catch (error) {
    console.error('Error in sendNotification controller:', error);
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to send notification',
      error: error.message || 'Unknown error',
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

module.exports = {
  createNotification,
  sendNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
