const mongoose = require('mongoose');
const connection = mongoose.connection;
const collection = connection.collection('transactions');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');

const getTransactionCount = async () => {
  try {
    const transactionCount = await collection.countDocuments();
    const transactionPendingCount = await collection.countDocuments({
      isPending: true,
    });
    const completedTransactionCount = await collection.countDocuments({
      isPending: false,
    });
    const accountBalances = await collection
      .aggregate([
        {
          $match: {
            isPending: false,
          },
        },
        {
          $group: {
            _id: null,
            totalAmount: {
              $sum: '$amount',
            },
            totalNegativeAmount: {
              $sum: {
                $cond: [{ $lt: ['$amount', 0] }, '$amount', 0],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            totalAmount: 1,
            totalNegativeAmount: 1,
            netTotalAmount: {
              $add: ['$totalAmount', '$totalNegativeAmount'],
            },
          },
        },
      ])
      .toArray();
    // Extract the total amount from the result
    const netTotalAmount = await accountBalances[0].netTotalAmount;

    return {
      status: httpStatus.OK,
      Message: 'Success',
      data: {
        totalTransactions: transactionCount,
        totalPendingTransactionCount: transactionPendingCount,
        totalCompletedTransactionCount: completedTransactionCount,
        totalAccountBalances: netTotalAmount,
      },
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-total-transaction-type-count',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      Message: 'Something went wrong.',
    };
  }
};

const getTransactionTypeCount = async (req, res) => {
  try {
    const transactionTypeCursor = collection.aggregate([
      {
        $group: {
          _id: '$name',
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          name: '$_id',
          count: 1,
        },
      },
    ]);
    const transactionType = await transactionTypeCursor.toArray();

    return {
      status: httpStatus.OK,
      Message: 'Success',
      data: {
        transactionTypeCursor: transactionType,
      },
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-transaction-type',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      Message: 'Something went wrong.',
    };
  }
};

module.exports = {
  getTransactionCount,
  getTransactionTypeCount,
};
