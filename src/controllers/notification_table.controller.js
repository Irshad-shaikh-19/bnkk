const catchAsync = require('../utils/catchAsync');
const notificationTableService = require('../services/notification_table.service');
const httpStatus = require('http-status');

// Controller for creating notification
const createNotification = catchAsync(async (req, res) => {
  try {
    // Calling the service to create the notification and send push notification
    const notification = await notificationTableService.createNotification(req.body);
    
    return res.status(httpStatus.CREATED).json({
      status: httpStatus.CREATED,
      message: 'Notification created successfully',
      data: notification,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Error creating notification',
      error: error.message,
    });
  }
});



// Get all notifications with pagination
const getNotifications = catchAsync(async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Default to page 1 and limit 10
    const notificationsData = await notificationTableService.getNotifications(
      parseInt(page, 10),
      parseInt(limit, 10)
    );
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Notifications retrieved successfully',
      data: notificationsData.notifications,
      total: notificationsData.total,
      currentPage: notificationsData.currentPage,
      totalPages: notificationsData.totalPages,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Error retrieving notifications',
      error: error.message,
    });
  }
});

// Get a single notification by ID
const getNotificationById = catchAsync(async (req, res) => {
  try {
    const notification = await notificationTableService.getNotificationById(req.params.id);
    if (!notification) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: 'Notification not found',
      });
    }
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Notification retrieved successfully',
      data: notification,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Error retrieving notification',
      error: error.message,
    });
  }
});

// Update a notification
const updateNotification = catchAsync(async (req, res) => {
  try {
    const notification = await notificationTableService.updateNotification(req.params.id, req.body);
    if (!notification) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: 'Notification not found',
      });
    }
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Notification updated successfully',
      data: notification,
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Error updating notification',
      error: error.message,
    });
  }
});

// Delete a notification
const deleteNotification = catchAsync(async (req, res) => {
  try {
    const notification = await notificationTableService.deleteNotification(req.params.id);
    if (!notification) {
      return res.status(httpStatus.NOT_FOUND).json({
        status: httpStatus.NOT_FOUND,
        message: 'Notification not found',
      });
    }
    return res.status(httpStatus.OK).json({
      status: httpStatus.OK,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    return res.status(httpStatus.BAD_REQUEST).json({
      status: httpStatus.BAD_REQUEST,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
});

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
