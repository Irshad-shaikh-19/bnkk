const { db, rtdb, messaging } = require('../config/firebaseAdmin'); // Import Firebase configuration
const Notification = require('../models/notification_table.model'); // Notification model

// Function to create a new notification and store it in both MongoDB and Firebase
const createNotification = async (notificationData) => {
  try {
    // Save notification in MongoDB
    const newNotification = new Notification(notificationData);
    await newNotification.save();

    // Save notification to Firebase Realtime Database
    const firebaseNotificationRef = rtdb.ref('notifications').push();
    await firebaseNotificationRef.set({
      title: notificationData.title,
      description: notificationData.description,
      image: notificationData.image,
      createdAt: new Date().toISOString(),
    });

    // Send a push notification to all users via Firebase Cloud Messaging
    await sendPushNotification(notificationData.title, notificationData.description);

    // Return the newly created notification
    return newNotification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw new Error('Error creating notification');
  }
};

// Function to send a push notification to all users via Firebase Cloud Messaging
const sendPushNotification = async (title, body) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    topic: 'all', // You can use specific topics like user IDs if needed
  };

  try {
    const response = await messaging.send(message);
    console.log('Notification sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw new Error('Error sending push notification');
  }
};

// Function to get all notifications with pagination
const getNotifications = async (page, limit) => {
  try {
    const notifications = await Notification.find()
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Notification.countDocuments();
    const totalPages = Math.ceil(total / limit);

    return {
      notifications,
      total,
      currentPage: page,
      totalPages,
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw new Error('Error fetching notifications');
  }
};

// Function to get a notification by its ID
const getNotificationById = async (id) => {
  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new Error('Notification not found');
    }

    return notification;
  } catch (error) {
    console.error('Error fetching notification by ID:', error);
    throw new Error('Error fetching notification by ID');
  }
};

// Function to update a notification
const updateNotification = async (id, updateData) => {
  try {
    const updatedNotification = await Notification.findByIdAndUpdate(id, updateData, {
      new: true,
    });
    if (!updatedNotification) {
      throw new Error('Notification not found');
    }

    return updatedNotification;
  } catch (error) {
    console.error('Error updating notification:', error);
    throw new Error('Error updating notification');
  }
};

// Function to delete a notification
const deleteNotification = async (id) => {
  try {
    const deletedNotification = await Notification.findByIdAndDelete(id);
    if (!deletedNotification) {
      throw new Error('Notification not found');
    }

    // Optionally, delete the notification from Firebase Realtime Database
    const firebaseNotificationRef = rtdb.ref('notifications').child(id);
    await firebaseNotificationRef.remove();

    return deletedNotification;
  } catch (error) {
    console.error('Error deleting notification:', error);
    throw new Error('Error deleting notification');
  }
};

// Function to send notifications to specific topics (e.g., specific users or groups)
const sendNotificationToTopic = async (title, body, topic) => {
  const message = {
    notification: {
      title: title,
      body: body,
    },
    topic: topic, // For example, 'user123' for a specific user
  };

  try {
    const response = await messaging.send(message);
    console.log(`Notification sent to ${topic}:`, response);
    return response;
  } catch (error) {
    console.error(`Error sending push notification to ${topic}:`, error);
    throw new Error(`Error sending push notification to ${topic}`);
  }
};

module.exports = {
  createNotification,
  getNotifications,
  getNotificationById,
  updateNotification,
  deleteNotification,
  sendPushNotification,
  sendNotificationToTopic,
};
