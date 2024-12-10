const { ObjectId } = require('mongodb');
const { UserAccounts } = require('../models');

/**
 * Get user accounts by User ID
 * @param {string} userId - User ID as a string
 * @returns {Promise<Object>}
 */
const getUserAccountsByUserId = async (userId) => {
  try {
    // Convert userId to ObjectId
    const userObjectId = new ObjectId(userId);

    // Query the UserAccounts collection using the 'user' field
    const accounts = await UserAccounts.find({ user: userObjectId });

    if (!accounts || accounts.length === 0) {
      return {
        status: 200,
        message: 'No accounts found for this user',
        accounts: [],
      };
    }

    return {
      status: 200,
      message: 'Accounts retrieved successfully',
      accounts,
    };
  } catch (error) {
    return {
      status: 400,
      message: `Error retrieving user accounts: ${error.message}`,
    };
  }
};

/**
 * Get all user accounts
 * @returns {Promise<Object>}
 */
const getAllUserAccounts = async () => {
  try {
    // Query the UserAccounts collection to find all records
    const accounts = await UserAccounts.find({});

    if (!accounts || accounts.length === 0) {
      return {
        status: 200,
        message: 'No user accounts found',
        accounts: [],
      };
    }

    return {
      status: 200,
      message: 'User accounts retrieved successfully',
      accounts,
    };
  } catch (error) {
    return {
      status: 400,
      message: `Error retrieving user accounts: ${error.message}`,
    };
  }
};

module.exports = {
  getUserAccountsByUserId,
  getAllUserAccounts,
};
