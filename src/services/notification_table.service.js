const Notification = require('../models/notification_table.model');
const FcmToken = require('../models/fcmtoken.model')
const UserProfile = require('../models/user-profile.model'); // Add this import
const { systemLog } = require('../utils/system-log'); 
const { admin, db } = require('./firebase.service'); 
const httpStatus = require('http-status');
const mongoose = require('mongoose');
const connection = mongoose.connection;
const collection = connection.collection('transactions');

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

// Get user categories with transaction data
const getUserCategories = async () => {
  try {
    // First get users with transaction data (existing logic)
    let aggregationPipeline = [
      {
        $lookup: {
          from: 'userprofiles',
          let: { userId: { $toString: "$user" } },
          pipeline: [
            { $match: { $expr: { $eq: [{ $toString: "$user" }, "$$userId"] } } }
          ],
          as: 'user_data',
        },
      },
      {
        $unwind: {
          path: "$user_data",
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $group: {
          _id: "$user",
          fullName: {
            $first: {
              $concat: ["$user_data.firstName", " ", "$user_data.lastName"],
            },
          },
          firstName: { $first: "$user_data.firstName" },
          lastName: { $first: "$user_data.lastName" },
          income: {
            $sum: {
              $cond: [{ $eq: ["$b4nkdValuePoint", "Income"] }, "$amount", 0],
            },
          },
          expense: {
            $sum: {
              $cond: [{ $in: ["$b4nkdValuePoint", ["Needs", "Needs II", "Wants"]] }, "$amount", 0],
            },
          },
        },
      },
      {
        $addFields: {
          category: {
            $switch: {
              branches: [
                { case: { $lt: ["$income", "$expense"] }, then: "Couch Potato" },
                { case: { $eq: ["$income", "$expense"] }, then: "In Training" },
                { case: { $gt: ["$income", "$expense"] }, then: "Athlete" },
                { case: { $gt: ["$income", { $multiply: [2, "$expense"] }] }, then: "Ironman" }
              ],
              default: "Uncategorized"
            }
          }
        }
      },
      {
        $project: {
          _id: 1,
          fullName: 1,
          firstName: 1,
          lastName: 1,
          income: 1,
          expense: 1,
          category: 1,
        },
      },
    ];

    const transactionUsers = await collection.aggregate(aggregationPipeline).toArray();

    // Now get users who have FCM tokens but may not have transactions
    const usersWithTokens = await FcmToken.aggregate([
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'userId',
          foreignField: 'user',
          as: 'userProfile'
        }
      },
      {
        $unwind: {
          path: '$userProfile',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          _id: '$userId',
          fullName: {
            $concat: ['$userProfile.firstName', ' ', '$userProfile.lastName']
          },
          firstName: '$userProfile.firstName',
          lastName: '$userProfile.lastName',
          category: 'Uncategorized' // Default category for users without transactions
        }
      }
    ]);

    // Combine both sets of users, giving priority to transaction data
    const combinedUsers = [...transactionUsers];
    const transactionUserIds = transactionUsers.map(u => u._id.toString());
    
    usersWithTokens.forEach(user => {
      if (!transactionUserIds.includes(user._id.toString())) {
        combinedUsers.push(user);
      }
    });

    if (!Array.isArray(combinedUsers)) {
      console.warn('Expected array but got:', typeof combinedUsers);
      return [];
    }

    return combinedUsers;
  } catch (error) {
    console.error("Service error details:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

// Send notification to specific group
const sendNotificationToGroup = async (data) => {
  try {
    if (!data.notificationId || !data.category) {
      return {
        success: false,
        status: 400,
        message: 'Notification ID and category are required'
      };
    }

    const notification = await Notification.findById(data.notificationId);
    if (!notification) {
      return {
        success: false,
        status: 404,
        message: 'Notification not found'
      };
    }

    // Get users by category
    const userCategories = await getUserCategories();
    const targetUsers = userCategories.filter(user => user.category === data.category);
    
    if (!targetUsers.length) {
      return {
        success: false,
        status: 200, 
        message: `No users found in category: ${data.category}`,
        data: {
          successCount: 0,
          failureCount: 0,
          total: 0,
          category: data.category,
          targetUsers: 0
        }
      };
    }

    // Get FCM tokens for these users
    const userIds = targetUsers.map(user => user._id);
    const tokens = await FcmToken.find({ userId: { $in: userIds } }, 'token');
    
    if (!tokens.length) {
      return {
        success: false,
        status: 200, 
        message: `Found ${targetUsers.length} users in "${data.category}" category but no registered devices found`,
        data: {
          successCount: 0,
          failureCount: 0,
          total: 0,
          category: data.category,
          targetUsers: targetUsers.length
        }
      };
    }

    const payload = {
      notification: {
        title: notification.title,
        body: notification.description,
        image: notification.image || ''
      },
      data: {
        notificationId: notification._id.toString(),
        category: data.category
      }
    };

    const fcmTokens = tokens.map(t => t.token);
    const results = await Promise.allSettled(
      fcmTokens.map(token => admin.messaging().send({ token, ...payload }))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;
    const failureCount = results.filter(r => r.status === 'rejected').length;

    const failedTokens = results
      .filter(r => r.status === 'rejected')
      .map((r, i) => {
        console.error(`Failed to send to token ${fcmTokens[i]}:`, r.reason);
        return fcmTokens[i];
      });

    if (failedTokens.length) {
      await FcmToken.deleteMany({ token: { $in: failedTokens } });
    }

    const isSuccess = successCount > 0;
    
    return {
      success: isSuccess,
      status: 200,
      message: isSuccess 
        ? `Notification sent successfully to ${successCount} out of ${fcmTokens.length} devices in "${data.category}" category${failureCount > 0 ? ` (${failureCount} failed)` : ''}`
        : `Failed to send notification to any devices in "${data.category}" category`,
      data: {
        successCount,
        failureCount,
        total: fcmTokens.length,
        category: data.category,
        targetUsers: targetUsers.length
      }
    };

  } catch (error) {
    console.error('Group notification send error:', error);
    return {
      success: false,
      status: 500,
      message: 'Internal server error while sending group notification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
  }
};


// Send notification to specific users
const sendNotificationToUsers = async (data) => {
  try {
    if (!data.notificationId || !data.userIds || !data.userIds.length) {
      return {
        success: false,
        status: 400,
        message: 'Notification ID and user IDs are required'
      };
    }

    const notification = await Notification.findById(data.notificationId);
    if (!notification) {
      return {
        success: false,
        status: 404,
        message: 'Notification not found'
      };
    }

    // Get FCM tokens for specific users
    const tokens = await FcmToken.find({ userId: { $in: data.userIds } }, 'token userId');
    
    if (!tokens.length) {
      return {
        success: false,
        status: 400,
        message: 'No registered devices found for selected users'
      };
    }

    const payload = {
      notification: {
        title: notification.title,
        body: notification.description,
        image: notification.image || ''
      },
      data: {
        notificationId: notification._id.toString(),
        type: 'individual'
      }
    };

    const fcmTokens = tokens.map(t => t.token);
    const results = await Promise.allSettled(
      fcmTokens.map(token => admin.messaging().send({ token, ...payload }))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    // Clean up failed tokens
    const failedTokens = results
      .filter(r => r.status === 'rejected')
      .map((r, i) => {
        console.error(`Failed to send to token ${fcmTokens[i]}:`, r.reason);
        return fcmTokens[i];
      });

    if (failedTokens.length) {
      await FcmToken.deleteMany({ token: { $in: failedTokens } });
    }

    return {
      success: true,
      status: 200,
      message: `Notification sent to selected users ${failedTokens.length > 0 ? 'with some failures' : 'successfully'}`,
      data: {
        successCount,
        failureCount: failedTokens.length,
        total: fcmTokens.length,
        targetUsers: data.userIds.length
      }
    };

  } catch (error) {
    console.error('Individual notification send error:', error);
    return {
      success: false,
      status: 500,
      message: 'Failed to send individual notification',
      error: error.message
    };
  }
};

const sendNotification = async (data) => {
  try {
    if (!data.notificationId) {
      return {
        success: false,
        status: 400,
        message: 'Notification ID is required'
      };
    }

    const notification = await Notification.findById(data.notificationId);
    if (!notification) {
      return {
        success: false,
        status: 404,
        message: 'Notification not found'
      };
    }

    const tokens = await FcmToken.find({}, 'token');
    if (!tokens.length) {
      return {
        success: false,
        status: 400,
        message: 'No registered devices'
      };
    }

    const payload = {
      notification: {
        title: notification.title,
        body: notification.description,
        image: notification.image || ''
      },
      data: {
        notificationId: notification._id.toString()
      }
    };

    const fcmTokens = tokens.map(t => t.token);
    const results = await Promise.allSettled(
      fcmTokens.map(token => admin.messaging().send({ token, ...payload }))
    );

    const successCount = results.filter(r => r.status === 'fulfilled').length;

    // Clean up failed tokens
    const failedTokens = results
      .filter(r => r.status === 'rejected')
      .map((r, i) => {
        console.error(`Failed to send to token ${fcmTokens[i]}:`, r.reason);
        return fcmTokens[i];
      });

    if (failedTokens.length) {
      await FcmToken.deleteMany({ token: { $in: failedTokens } });
    }

    return {
      success: true,
      status: 200,
      message:
        failedTokens.length > 0
          ? 'Notification sent with some failures'
          : 'Notification sent successfully',
      data: {
        successCount,
        failureCount: failedTokens.length,
        total: fcmTokens.length
      }
    };

  } catch (error) {
    console.error('Notification send error:', error);
    return {
      success: false,
      status: 500,
      message: 'Failed to send notification',
      error: error.message
    };
  }
};

const getNotifications = async (page, limit) => {
  const skip = (page - 1) * limit;
  const total = await Notification.countDocuments();
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



const getUsersWithFcmTokens = async () => {
  try {
    const usersWithTokens = await FcmToken.aggregate([
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'userId',
          foreignField: 'user',
          as: 'userProfile'
        }
      },
      {
        $unwind: {
          path: '$userProfile',
          preserveNullAndEmptyArrays: false
        }
      },
      {
        $project: {
          _id: '$userId',
          fullName: {
            $concat: ['$userProfile.firstName', ' ', '$userProfile.lastName']
          },
          firstName: '$userProfile.firstName',
          lastName: '$userProfile.lastName'
        }
      }
    ]);

    return usersWithTokens;
  } catch (error) {
    console.error("Error getting users with FCM tokens:", {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
};

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
  getUsersWithFcmTokens,
  
};