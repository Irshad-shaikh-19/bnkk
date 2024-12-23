const Notification = require('../models/notification_table.model');
const FcmToken = require('../models/fcmtoken.model')
const { systemLog } = require('../utils/system-log'); 
const { admin, db } = require('./firebase.service'); 

const createNotification = async (data, info) => {
  try {
    const { title, description, image } = data;

    if (!title || !description) {
      throw new Error('Title and description are required.');
    }

    const notification = new Notification({ title, description, image });
    const savedNotification = await notification.save();

    // Log the creation of the notification
    if (info) {
      await systemLog('CREATE', data, savedNotification._id, 'create-notification', savedNotification, info);
    }

    // Store the notification in Firestore
    await db.collection('notifications').add({
      title,
      description,
      image: image || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return savedNotification;
  } catch (error) {
    console.error(`Error creating notification: ${error.message}`);
    throw error;
  }
};




const sendNotification = async ({ title, description, data, notificationId }) => {
  let notification;

  // Validate and fetch notification if `notificationId` is provided
  if (notificationId) {
    notification = await Notification.findById(notificationId);
    if (!notification) {
      throw new Error(`Notification with ID ${notificationId} not found.`);
    }
    console.log('Using notification details from database:', notification);
  }

  // Retrieve FCM tokens from your database
  const tokens = await FcmToken.find({}, 'token');
  const fcmTokens = tokens.map((tokenRecord) => tokenRecord.token);

  if (fcmTokens.length === 0) {
    console.warn('No FCM tokens available.');
    throw new Error('No FCM tokens found.');
  }

  // Construct payload for Firebase
  const payload = {
    notification: {
      title: notification?.title || title,
      body: notification?.description || description,
      image: notification?.image || data?.image || '',
    },
    data: {
      notificationId: notificationId || '',
      ...data, // Optional additional data
    },
  };

  console.log('Sending notification with payload:', payload);

  try {
    const responses = await Promise.all(
      fcmTokens.map(async (token) => {
        try {
          const response = await admin.messaging().send({
            token,
            notification: payload.notification,
            data: payload.data,
          });
          return { success: true, token, response };
        } catch (error) {
          return { success: false, token, error };
        }
      })
    );

    const successCount = responses.filter((res) => res.success).length;
    const failureCount = responses.length - successCount;
    const failedDevices = responses
      .filter((res) => !res.success)
      .map((res) => res.token);

    console.log('Notification results:', { successCount, failureCount });

    return {
      successCount,
      failureCount,
      failedDevices,
    };
  } catch (error) {
    console.error('Error sending notification via Firebase:', error);
    throw new Error('Failed to send notification via Firebase.');
  }
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
  try {
    if (!id) {
      throw new Error('Notification ID is required.');
    }

    console.log(`Fetching notification with ID: ${id}`);
    const notification = await Notification.findById(id);
    if (!notification) {
      console.error(`Notification with ID ${id} not found.`);
      throw new Error(`Notification with ID ${id} not found.`);
    }

    return notification;
  } catch (error) {
    console.error(`Error fetching notification by ID: ${error.message}`);
    throw error;
  }
};



const updateNotification = async (id, data, info) => {
  try {
    const { title, description, image } = data;

    if (!id) {
      throw new Error('Notification ID is required.');
    }

    const updatedNotification = await Notification.findByIdAndUpdate(
      id,
      { title, description, image },
      { new: true }
    );

    if (!updatedNotification) {
      throw new Error(`Notification with ID ${id} not found.`);
    }

    // Log the update of the notification
    if (info) {
      await systemLog('UPDATE', data, id, 'update-notification', updatedNotification, info);
    }

    return updatedNotification;
  } catch (error) {
    console.error(`Error updating notification: ${error.message}`);
    throw error;
  }
};

/**
 * Delete a notification.
 * @param {String} id - The notification ID.
 * @param {Object} info - Information for logging.
 * @returns {Object|null} The deleted notification, or null if not found.
 */
const deleteNotification = async (id, info) => {
  try {
    if (!id) {
      throw new Error('Notification ID is required.');
    }

    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      throw new Error(`Notification with ID ${id} not found.`);
    }

    // Log the deletion of the notification
    if (info) {
      await systemLog('DELETE', { id }, id, 'delete-notification', deletedNotification, info);
    }

    return deletedNotification;
  } catch (error) {
    console.error(`Error deleting notification: ${error.message}`);
    throw error;
  }
};

module.exports = {
  createNotification,
  sendNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
};
