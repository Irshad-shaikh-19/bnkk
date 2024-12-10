const mongoose = require('mongoose');
const connection = mongoose.connection;
const collection = connection.collection('tbl_notifications');
const transactionsCollection = connection.collection('transactions');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');

const getAllNotification = async () => {
  try {
    let docsPromiseArr = [
      { $match: { status: 1 } },
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'user',
          foreignField: 'user',
          as: 'user_profile_data',
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          action: 1,
          status: 1,
          createdAt: 1,
          firstName: {
            $arrayElemAt: ['$user_profile_data.firstName', 0],
          },
          lastName: {
            $arrayElemAt: ['$user_profile_data.lastName', 0],
          },
        },
      },
    ];
    let docsPromise = await collection.aggregate(docsPromiseArr).toArray();
    return {
      data: docsPromise,
      message: 'notification-list',
      status: httpStatus.OK,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'notification-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

const getAllTransaction = async () => {
  try {
    const transactionsWithData = await transactionsCollection.aggregate([
      {
        $match: { amount: { $gte: 10000 } }
      },
      {
        $lookup: {
          from: 'userprofiles',  // Name of the users collection
          localField: 'user',  // Field in the transactions collection
          foreignField: 'user',   // Field in the users collection
          as: 'user_data'
        }
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          createdAt: '$transactionDate',
          action: 'Above 10000 Transaction',
          firstName: {
            $arrayElemAt: ['$user_data.firstName', 0],
          },
          lastName: {
            $arrayElemAt: ['$user_data.lastName', 0],
          },
        }
      }
    ]).toArray();

    if (transactionsWithData.length > 0) {
      return {
        status: httpStatus.OK,
        message: 'Transactions retrieved successfully.',
        data: transactionsWithData,
      };
    } else {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'No transactions found with amount greater than or equal to 10000.',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve transactions.',
      data: [],
    };
  }
};

const getAllSameTransaction = async (data) => {
  try {
    const resultdata = data.currentTime;
    const transactionDate = new Date(resultdata);

    // Subtract one hour from the transactionDate
    const oneHourAgo = new Date(transactionDate.getTime() - (60 * 60 * 1000)); // Subtracting milliseconds
    oneHourAgo.setUTCHours(transactionDate.getUTCHours() - 1);

    const transactionsWithData = await transactionsCollection.aggregate([
      {
        $match: {
          transactionDate: {
            $gte: oneHourAgo,
            $lt: transactionDate
          }
        }
      },
      {
        $lookup: {
          from: 'userprofiles',  // Name of the users collection
          localField: 'user',  // Field in the transactions collection
          foreignField: 'user',   // Field in the users collection
          as: 'user_data'
        }
      },
      {
        $project: {
          _id: 1,
          amount: 1,
          createdAt: '$transactionDate',
          action: '1 hour Transaction',
          firstName: { $arrayElemAt: ["$user_data.firstName", 0] },
          lastName: { $arrayElemAt: ["$user_data.lastName", 0] }
        }
      }
    ]).toArray();

    if (transactionsWithData.length > 0) {
      return {
        status: httpStatus.OK,
        message: 'Transactions retrieved successfully.',
        data: transactionsWithData,
      };
    } else {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'No transactions found with the same amount by the same user within 1 hour.',
        data: [],
      };
    }
  } catch (error) {
    console.error('Error retrieving transactions:', error);
    return {
      status: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Failed to retrieve transactions.',
      data: [],
    };
  }
};

module.exports = {
  getAllNotification,
  getAllTransaction,
  getAllSameTransaction
};
