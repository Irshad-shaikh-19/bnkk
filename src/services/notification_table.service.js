// src/services/notification.service.js

const Notification = require('../models/notification_table.model');
const { systemLog } = require('../utils/system-log');  // Import systemLog

const createNotification = async (data, info) => {  // Add info parameter for logging
  const notification = new Notification(data);
  const savedNotification = await notification.save();
  // Log the creation of the notification
  await systemLog('CREATE', data, savedNotification._id, 'create-notification', savedNotification, info);
  return savedNotification;
};

const getNotifications = async (page, limit) => {
  const skip = (page - 1) * limit; // Calculate the number of documents to skip
  const total = await Notification.countDocuments(); // Total number of notifications
  const notifications = await Notification.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return {
    notifications,
    total,
    currentPage: page,
    totalPages: Math.ceil(total / limit),
  };
};

const getNotificationById = async (id) => {
  return Notification.findById(id);
};

const updateNotification = async (id, data, info) => {  // Add info parameter for logging
  const updatedNotification = await Notification.findByIdAndUpdate(id, data, { new: true });
  // Log the update of the notification
  await systemLog('UPDATE', data, id, 'update-notification', updatedNotification, info);
  return updatedNotification;
};

const deleteNotification = async (id, info) => {  // Add info parameter for logging
  const deletedNotification = await Notification.findByIdAndDelete(id);
  // Log the deletion of the notification
  await systemLog('DELETE', { id }, id, 'delete-notification', deletedNotification, info);
  return deletedNotification;
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
