const mongoose = require('mongoose');
const connection = mongoose.connection;
const collection = connection.collection('transactions');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');
const { concateDate } = require('../utils/date');
const { systemLog } = require('../utils/system-log');
const getAllTransactionDetails = async (filter, options) => {
  try {
    let searchData = [];
    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      order === 'desc' ? (sort = { [key]: -1 }) : (sort = { [key]: 1 });
    }
    if (filter.status && filter.status !== 'undefined') {
      searchData.push({
        $or: [{ status: Number(filter.status) }],
      });
    }

    if (filter.isPending === 'true' || filter.isPending === 'false') {
      searchData.push({
        $or: [{ isPending: filter.isPending === 'true' ? true : false }],
      });
    }

    if (
      filter.startDate &&
      filter.endDate &&
      filter.startDate !== 'null' &&
      filter.endDate !== 'null'
    ) {
      let startDate = new Date(
        new Date(filter.startDate).setUTCHours(0, 0, 0, 1)
      );
      let endDate = new Date(
        new Date(filter.endDate).setUTCHours(23, 59, 59, 999)
      );
      startDate.setDate(startDate.getDate() - 1);
      // endDate.setDate(endDate.getDate() + 1);
      searchData.push({
        $or: [
          {
            transactionDate: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        ],
      });
    }

    if (filter.search) {
      const searchValues = filter.search.split(',').map(value => new RegExp('.*' + value.trim() + '.*', 'i'));

      const searchCriteria = {
        $or: [
          { category: { $in: searchValues } }, // Search for documents where any element of category array matches any of the search values
          { b4nkdCategory: { $in: searchValues } },
          { b4nkdValuePoint: { $in: searchValues } }, // Add this line for b4nkdValuePoint search
          { plaidTransactionId: { $in: searchValues } },
          { paymentChannel: { $in: searchValues } },
          { paymentMethod: { $in: searchValues } },
          { institution: { $in: searchValues } },
          { personalFinanceCategoryPrimary: { $in: searchValues } },
          { 'user_data.lastName': { $regex: '.*' + filter.search + '.*', $options: 'i' } },
          { 'user_data.firstName': { $regex: '.*' + filter.search + '.*', $options: 'i' } },
          { amount: Number(filter.search) }// assuming amount should be searched as Number
        ]
      };

      // Check if search input contains space (indicating it might be first name and last name)
      if (/\s/.test(filter.search)) {
        const [firstName, lastName] = filter.search.split(' ');
        searchCriteria.$or.push({
          'user_data.firstName': { $regex: new RegExp('.*' + firstName + '.*', 'i') },
          'user_data.lastName': { $regex: new RegExp('.*' + lastName + '.*', 'i') }
        });
      }

      searchData.push(searchCriteria);
    }

    if (filter.csv === '1') {
      const limit =
        options.limit && parseInt(options.limit, 10) > 0
          ? parseInt(options.limit, 10)
          : 10;
      const page =
        options.page && parseInt(options.page, 10) > 0
          ? parseInt(options.page, 10)
          : 1;
      const skip = (page - 1) * limit;

      let countPromiseArr = [
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user',
            foreignField: 'user',
            as: 'user_data',
          },
        },
        { $count: 'count' },
      ];

      let docsPromiseArr = [
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user',
            foreignField: 'user',
            as: 'user_data',
          },
        },
        {
          $lookup: {
            from: 'institutions',
            localField: 'institution',
            foreignField: 'plaidInstitutionId',
            as: 'institution_data',
          },
        },
        {
          $project: {
            user: 1,
            b4nkdCategory: 1,
            b4nkdValuePoint: 1, // Add this line to include b4nkdValuePoint in the response
            paymentChannel: 1,
            paymentMethod: 1,
            personalFinanceCategoryPrimary: 1,
            institution: 1,
            institutionName: { $arrayElemAt: ['$institution_data.name', 0] },
            category: 1,
            transactionDate: 1,
            plaidTransactionId: 1,
            amount: 1,
            isPending: 1,
            created: 1,
            firstName: {
              $arrayElemAt: ['$user_data.firstName', 0],
            },
            lastName: {
              $arrayElemAt: ['$user_data.lastName', 0],
            },
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ];

      if (searchData.length > 0) {
        countPromiseArr.splice(1, 0, { $match: { $and: searchData } });
        docsPromiseArr.splice(1, 0, { $match: { $and: searchData } });
      }
      const countPromise = await collection
        .aggregate(countPromiseArr)
        .toArray();
      let docsPromise = await collection.aggregate(docsPromiseArr).toArray();
      const values = await Promise.all([countPromise, docsPromise]);
      const [totalCount, results] = values;
      const totalResults = totalCount[0] && totalCount[0].count;
      const totalPages = Math.ceil(totalResults / limit) || 1;
      const pagination = {
        length: totalResults,
        size: limit,
        page: page,
        lastPage: totalPages,
      };
      return {
        pagination,
        data: results,
        status: httpStatus.OK,
      };
    } else {
      let docsPromiseArr = [
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user',
            foreignField: 'user',
            as: 'user_data',
          },
        },
        {
          $project: {
            b4nkdCategory: 1,
            b4nkdValuePoint: 1, // Add this line to include b4nkdValuePoint in the response
            paymentChannel: 1,
            institution: 1,
            category: 1,
            personalFinanceCategoryPrimary: 1,
            transactionDate: concateDate('$transactionDate'),
            plaidTransactionId: 1,
            amount: 1,
            isPending: 1,
            created: concateDate('$created'),
            fullName: {
              $concat: [
                { $arrayElemAt: ['$user_data.firstName', 0] },
                ' ',
                { $arrayElemAt: ['$user_data.lastName', 0] },
              ],
            },
          },
        },
        { $sort: sort },
      ];

      if (searchData.length > 0) {
        docsPromiseArr.splice(1, 0, { $match: { $and: searchData } });
      }
      let docsPromise = await collection.aggregate(docsPromiseArr).toArray();
      return {
        pagination: {},
        data: docsPromise,
        status: httpStatus.OK,
      };
    }
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-transaction-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

const getTransactionDetailsById = async (id) => {
  let docsPromiseArr = [
    {
      $match: {
        _id: mongoose.Types.ObjectId(id),
      },
    },
    {
      $lookup: {
        from: 'userprofiles',
        localField: 'user',
        foreignField: 'user',
        as: 'user_data',
      },
    },
    {
      $lookup: {
        from: 'institutions',
        localField: 'institution',
        foreignField: 'plaidInstitutionId',
        as: 'institution_data',
      },
    },
    {
      $project: {
        b4nkdCategory: 1,
        b4nkdValuePoint: 1, // Add this line to include b4nkdValuePoint in the response
        paymentChannel: 1,
        paymentMethod: 1,
        personalFinanceCategoryPrimary: 1,
        institution: 1,
        institutionName: { $arrayElemAt: ['$institution_data.name', 0] }, // Retrieve the institution name
        category: 1,
        transactionDate: 1,
        plaidTransactionId: 1,
        amount: 1,
        isPending: 1,
        created: 1,
        firstName: {
          $arrayElemAt: ['$user_data.firstName', 0],
        },
        lastName: {
          $arrayElemAt: ['$user_data.lastName', 0],
        },
      },
    },
  ];

  let docsPromise = await collection.aggregate(docsPromiseArr).toArray();

  if (docsPromise.length > 0) {
    return {
      status: httpStatus.OK,
      message: 'Transaction details.',
      data: docsPromise[0], // Assuming there's only one matching document
    };
  } else {
    errorHandler.errorM({
      action_type: 'get-transaction-details-by-id',
      error_data: {
        message: 'occures while delete get-transaction-details-by-id.',
      },
    });
    return {
      status: httpStatus.NOT_FOUND,
      message: 'Transaction details not found.',
    };
  }
};

const GetTransactionsByInstitutionAndUser = async (filter, options) => {
  try {
    // Define pagination variables using the same variable names from the first function
    const page = options.page && parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
    const limit = options.limit && parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 10;
    const skip = (page - 1) * limit;

    console.log(`Page: ${page}, Limit: ${limit}, Skip: ${skip}`); // Debugging logs

    // Construct searchData array using the same pattern as the first code
    let searchData = [
      { institution: filter.institution },
      { user: filter.user },
    ];

    // Add filters based on status (from the first code)
    if (filter.status) {
      const status = parseInt(filter.status);
      if (!isNaN(status)) {
        searchData.push({ status });
      }
    }

    // Add filters based on isPending (from the first code)
    if (filter.isPending === 'true' || filter.isPending === 'false') {
      searchData.push({ isPending: filter.isPending === 'true' });
    }

    // Add date range filters (from the first code)
    if (filter.startDate && filter.endDate) {
      const startDate = new Date(filter.startDate);
      const endDate = new Date(filter.endDate);
      if (!isNaN(startDate) && !isNaN(endDate)) {
        searchData.push({ transactionDate: { $gte: startDate, $lte: endDate } });
      }
    }

    // Add search term filters (from the first code)
    if (filter.search) {
      const searchValues = filter.search.split(',').map(value => new RegExp(value.trim(), 'i'));
      const searchCriteria = {
        $or: [
          { category: { $in: searchValues } },
          { b4nkdCategory: { $in: searchValues } },
          { b4nkdValuePoint: { $in: searchValues } },
          { plaidTransactionId: { $in: searchValues } },
          { paymentChannel: { $in: searchValues } },
          { paymentMethod: { $in: searchValues } },
          { institution: { $in: searchValues } },
          { personalFinanceCategoryPrimary: { $in: searchValues } },
          { 'user_data.lastName': { $regex: filter.search, $options: 'i' } },
          { 'user_data.firstName': { $regex: filter.search, $options: 'i' } },
        ],
      };

      // Handle full name searches (from the first code)
      if (filter.search.includes(' ')) {
        const [firstName, lastName] = filter.search.split(' ');
        searchCriteria.$or.push({
          $and: [
            { 'user_data.firstName': { $regex: new RegExp(firstName, 'i') } },
            { 'user_data.lastName': { $regex: new RegExp(lastName, 'i') } },
          ],
        });
      }

      searchData.push(searchCriteria);
    }

    // Handle sorting (from the first code)
    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      sort[key] = order === 'desc' ? -1 : 1;
    }

    // Aggregation pipeline for fetching the documents
    let docsPromiseArr = [
      { $match: { $and: searchData } },
      {
        $lookup: {
          from: 'userprofiles',
          localField: 'user',
          foreignField: 'user',
          as: 'user_data',
        },
      },
      {
        $lookup: {
          from: 'institutions',
          localField: 'institution',
          foreignField: 'plaidInstitutionId',
          as: 'institution_data',
        },
      },
      {
        $project: {
          user: 1,
          institution: 1,
          institutionName: { $arrayElemAt: ['$institution_data.name', 0] },
          transactionDate: 1,
          amount: 1,
          b4nkdCategory: 1,
          b4nkdValuePoint: 1,
          isPending: 1,
          personalFinanceCategoryPrimary: 1,
          plaidTransactionId: 1,
          category: 1,
          paymentChannel: 1,
          paymentMethod: 1,
          firstName: { $arrayElemAt: ['$user_data.firstName', 0] },
          lastName: { $arrayElemAt: ['$user_data.lastName', 0] },
        },
      },
      { $sort: sort },
      { $skip: skip }, // Pagination: Skip the previous pages
      { $limit: limit }, // Pagination: Limit the number of results
    ];

    // Fetch the documents from the database
    const docsPromise = await collection.aggregate(docsPromiseArr).toArray();

    // Count total records for pagination (from the first code)
    const countPromiseArr = [
      { $match: { $and: searchData } },
      { $count: 'count' },
    ];
    const totalCountResult = await collection.aggregate(countPromiseArr).toArray();
    const totalResults = totalCountResult[0] && totalCountResult[0].count;
    const totalPages = Math.ceil(totalResults / limit) || 1; // Calculate total pages

    // Return results with pagination info
    return {
      pagination: {
        length: totalResults,
        size: limit,
        page: page,
        lastPage: totalPages,
      },
      data: docsPromise,
      status: httpStatus.OK,
    };
  } catch (error) {
    console.error('Error fetching transactions:', error);

    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
      error: error.message || error,
    };
  }
};








const updateTransactionDetails = async (id, updates) => {
  try {
    // Ensure amount is a number and valid
    if (typeof updates.amount !== 'number' || isNaN(updates.amount) || !isFinite(updates.amount)) {
      throw new Error('Invalid amount value');
    }

    // Separate the updates based on the collection they belong to
    const transactionUpdate = {};
    const userProfileUpdate = {};
    const institutionUpdate = {};

    for (const key in updates) {
      if (['amount', 'b4nkdCategory', 'b4nkdValuePoint', 'transactionDate', 'paymentMethod', 'paymentChannel', 'personalFinanceCategoryPrimary', 'category', 'institution'].includes(key)) {
        transactionUpdate[key] = updates[key];
      } else if (['firstName', 'lastName'].includes(key)) {
        userProfileUpdate[key] = updates[key];
      } else if (key === 'institutionName') {
        institutionUpdate.name = updates[key];
      }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Update the transaction document
      const transactionResult = await connection.collection('transactions').findOneAndUpdate(
        { _id: mongoose.Types.ObjectId(id) },
        { $set: transactionUpdate },
        { returnDocument: 'after', session, new: true }
      );

      if (!transactionResult.value) {
        throw new Error('Transaction not found');
      }

      // Log the user ID for debugging
      console.log('Updating user profile for user:', transactionResult.value.user);

      // Update the user profile if needed
      if (Object.keys(userProfileUpdate).length > 0) {
        const userProfileUpdateResult = await connection.collection('userprofiles').findOneAndUpdate(
          { user: mongoose.Types.ObjectId(transactionResult.value.user) },
          { $set: userProfileUpdate },
          { session, returnDocument: 'after' }
        );

        if (userProfileUpdateResult.modifiedCount === 0) {
          throw new Error('Failed to update user profile');
        }
      }

      // Update the institution if needed
      if (Object.keys(institutionUpdate).length > 0) {
        const institutionUpdateResult = await connection.collection('institutions').findOneAndUpdate(
          { plaidInstitutionId: transactionResult.value.institution },
          { $set: institutionUpdate },
          { session, returnDocument: 'after' }
        );

        if (institutionUpdateResult.modifiedCount === 0) {
          throw new Error('Failed to update institution');
        }
      }

      await session.commitTransaction();

      // Retrieve the updated transaction details, including the updated user profile and institution data
      const updatedTransaction = await collection.aggregate([
        {
          $match: { _id: mongoose.Types.ObjectId(id) }
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user',
            foreignField: 'user',
            as: 'user_data'
          }
        },
        {
          $lookup: {
            from: 'institutions',
            localField: 'institution',
            foreignField: 'plaidInstitutionId',
            as: 'institution_data'
          }
        },
        {
          $project: {
            _id: 1,
            plaidTransactionId: 1,
            updated: 1,
            isPending: 1,
            merchantName: 1,
            paymentMethod: 1,
            location: 1,
            personalFinanceCategoryPrimary: 1,
            personalFinanceCategoryDetailed: 1,
            category: 1,
            authorizedDate: 1,
            transactionDate: 1,
            name: 1,
            isoCurrencyCode: 1,
            amount: 1,
            paymentChannel: 1,
            account: 1,
            institution: 1,
            b4nkdValuePoint: 1, // Add this line to include b4nkdValuePoint in the response
            b4nkdCategory: 1,
            user: 1,
            created: 1,
            'user_data.firstName': { $arrayElemAt: ['$user_data.firstName', 0] },
            'user_data.lastName': { $arrayElemAt: ['$user_data.lastName', 0] },
            'institution_data.name': { $arrayElemAt: ['$institution_data.name', 0] }
          }
        }
      ]).toArray();

      session.endSession();
      // Log the successful update
      await systemLog('UPDATE', updates, id, 'update-transaction-details', updatedTransaction[0], info);
      return {
        status: httpStatus.OK,
        message: 'Transaction updated successfully',
        data: updatedTransaction[0] // Assuming there's only one matching document
      };
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Error during transaction update:', error);
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Something went wrong during the transaction update.'
      };
    }
  } catch (error) {
    console.error('Error during transaction update:', error);
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something went wrong while updating the transaction.'
    };
  }
};

module.exports = {
  getAllTransactionDetails,
  getTransactionDetailsById,
  GetTransactionsByInstitutionAndUser,
  updateTransactionDetails
};
