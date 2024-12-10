/* eslint-disable no-self-assign */
const httpStatus = require('http-status');
const { User, UserProfile } = require('../models');
const ApiError = require('../utils/ApiError');
const errorHandler = require('../utils/error.handler');
const emailService = require('./email.service');
const mongoose = require('mongoose');
const { systemLog } = require('../utils/system-log');
const connection = mongoose.connection;
const collection = connection.collection('users');
const { NotificationModel, GeneralSettingModel } = require('../models');
/**
 * Create a user
 * @param {Object} userBody
 * @returns {Promise<User>}
 */
const createUser = async (userBody, info) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const userData = await User.create(userBody);
  if (userData) {
    userBody['user'] = userData._id;
    await UserProfile.create(userBody);
    delete userBody.password;
    await systemLog('CREATE', userBody, userData._id, 'create-user', {}, info);
    return {
      status: httpStatus.OK,
      message: 'User created',
      res: userData,
    };
  } else {
    errorHandler.errorM({
      action_type: 'add-user',
      error_data: { message: 'occures while create new user.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'User not created',
    };
  }
};

/**
 * Query for users
 * @param {Object} filter - Mongo filter
 * @param {Object} options - Query options
 * @param {string} [options.sortBy] - Sort option in the format: sortField:(desc|asc)
 * @param {number} [options.limit] - Maximum number of results per page (default = 10)
 * @param {number} [options.page] - Current page (default = 1)
 * @returns {Promise<QueryResult>}
 */
const queryUsers = async (filter, options) => {
  try {
    let searchData = [
      {
        status: { $ne: 2 },
        isSuperAdmin: false,
      },
    ];

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
    if (filter.search) {
      const searchvalue = {
        $regex: '.*' + filter.search + '.*',
        $options: 'i',
      };
      searchData.push({
        $or: [
          { email: searchvalue },
          { 'user_data.lastName': searchvalue },
          { 'user_data.firstName': searchvalue },
          { 'role_data.role_name': searchvalue },
        ],
      });
    }

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
          localField: '_id',
          foreignField: 'user',
          as: 'user_data',
        },
      },
      { $unwind: '$roles' },
      {
        $lookup: {
          from: 'tbl_roles',
          localField: 'roles',
          foreignField: '_id',
          as: 'role_data',
        },
      },
      { $count: 'count' },
    ];
    let docsPromiseArr = [
      {
        $lookup: {
          from: 'userprofiles',
          localField: '_id',
          foreignField: 'user',
          as: 'user_data',
        },
      },
      { $unwind: '$roles' },
      {
        $lookup: {
          from: 'tbl_roles',
          localField: 'roles',
          foreignField: '_id',
          as: 'role_data',
        },
      },
      {
        $project: {
          status: 1,
          email: 1,
          isEmailVerified: 1,
          isMobileVerified: 1,
          isFirstLogin: 1,
          roles: 1,
          created: 1,
          firstName: {
            $arrayElemAt: ['$user_data.firstName', 0],
          },
          lastName: {
            $arrayElemAt: ['$user_data.lastName', 0],
          },
          address: {
            $arrayElemAt: ['$user_data.address', 0],
          },
          nationality: {
            $arrayElemAt: ['$user_data.nationality', 0],
          },
          dob: {
            $arrayElemAt: ['$user_data.dob', 0],
          },
          role_name: {
            $arrayElemAt: ['$role_data.role_name', 0],
          },
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
    ];

    if (searchData.length > 0) {
      countPromiseArr.splice(3, 0, { $match: { $and: searchData } });
      docsPromiseArr.splice(3, 0, { $match: { $and: searchData } });
    }
    const countPromise = await collection.aggregate(countPromiseArr).toArray();
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
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-user-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserById = async (id) => {
  const user = await User.findById(id);
  if (user) {
    const userProfile = await UserProfile.findOne({
      user: mongoose.Types.ObjectId(user._id),
    });
    return {
      status: httpStatus.OK,
      message: 'User created.',
      user,
      userProfile,
    };
  } else {
    errorHandler.errorM({
      action_type: 'get-user',
      error_data: { message: 'occures while get user.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'User not found',
    };
  }
};

/**
 * Get user by id
 * @param {ObjectId} id
 * @returns {Promise<User>}
 */
const getUserDetails = async (id) => {
  const user = await User.findById(id).lean();
  if (user) {
    const userProfile = await UserProfile.findOne({
      user: mongoose.Types.ObjectId(user._id),
    });

    const { firstName, lastName } = userProfile;
    user.displayName = `${firstName && firstName !== '' ? firstName + ' ' : ''
      }${lastName ? lastName : ''}`;
    user['preferredName'] = userProfile.preferredName;
    user['firstName'] = userProfile.firstName;
    user['lastName'] = userProfile.lastName;
    user.address = {
      house: userProfile.address.house,
      street: userProfile.address.street,
      city: userProfile.address.city,
      pincode: userProfile.address.pincode,
      country: userProfile.address.country,
    };
    user.dob = {
      day: userProfile.dob.day,
      month: userProfile.dob.month,
      year: userProfile.dob.year,
    };
    user['contact_no'] = userProfile.contact_no;
    user['nationality'] = userProfile.nationality;

    return {
      status: httpStatus.OK,
      message: 'User details.',
      user,
    };
  } else {
    errorHandler.errorM({
      action_type: 'get-user',
      error_data: { message: 'occures while get user.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'User not found',
    };
  }
};

/**
 * Get user by email
 * @param {string} email
 * @returns {Promise<User>}
 */
const getUserByEmail = async (email) => {
  let user = await User.findOne({ email });
  return user;
};

const getUserByID = async (id) => {
  let user = await User.findById(id);
  return user;
};

/**
 * Update user by id
 * @param {ObjectId} userId
 * @param {Object} updateBody
 * @returns {Promise<User>}
 */
const updateUserById = async (userId, updateBody, info) => {
  const user = await getUserById(userId);
  if (!user) {
    return {
      status: httpStatus.NOT_FOUND,
      message: 'User not found',
      user: '',
    };
  }
  const userData = await User.findOne({
    _id: { $ne: userId },
    status: { $ne: 2 },
    email: updateBody.email,
  });
  if (userData) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  // if (updateBody.password && updateBody.password !== '') {
  //   updateBody['password'] = updateBody.password;
  // }

  const result = await User.findByIdAndUpdate(userId, updateBody, {
    new: true,
  });
  if (!user.user.isSuperAdmin) {
    const resultData = await GeneralSettingModel.findOne();

    if (resultData) {
      const { notification_type } = resultData;
      const { firstName, lastName } = user.userProfile;

      if (notification_type.includes('email')) {
        // If email notification type is present
        await emailService.sendUpdateProfileEmail(firstName, lastName);
      }

      if (notification_type.includes('app')) {
        // If app notification type is present
        const obj = {
          user: userId,
          action: 'update-profile',
        };
        await NotificationModel.create(obj);
      }
    }
  }
  if (result) {
    await UserProfile.findOneAndUpdate(
      { user: mongoose.Types.ObjectId(result._id) },
      updateBody
    );
    await systemLog('UPDATE', updateBody, result._id, 'update-user', user, info);
    return {
      status: httpStatus.OK,
      message: 'sucessfully updated',
      user: result,
    };
  } else {
    errorHandler.errorM({
      action_type: 'update-user',
      error_data: { message: 'occures while update user.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'something want wrong, please try again',
    };
  }
};

const updatePasswordById = async (userId, updateBody, info) => {
  const user = await getUserById(userId);
  if (!user) {
    return {
      status: httpStatus.NOT_FOUND,
      message: 'User not found',
      user: '',
    };
  }

  const data = {
    modified_date: new Date(),
  };
  if (updateBody.password && updateBody.password !== '') {
    data['password'] = updateBody.password;
  }

  const result = await User.findByIdAndUpdate(userId, data, { new: true });
  if (result) {
    await systemLog('UPDATE', data, result._id, 'update-user-password', user, info);
    return {
      status: httpStatus.OK,
      message: 'sucessfully updated',
      user: result,
    };
  } else {
    errorHandler.errorM({
      action_type: 'update-user-password',
      error_data: { message: 'occures while update user password.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'something want wrong, please try again',
    };
  }
};

/**
 * Delete user by id
 * @param {ObjectId} userId
 * @returns {Promise<User>}
 */
const deleteUserById = async (userId, data, info) => {
  const user = await getUserById(userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  // await user.remove();
  const res = await User.findByIdAndUpdate(userId, data, { new: true });
  if (res) {
    await systemLog('DELETE', res, userId, 'delete-user', {}, info);
    return {
      status: httpStatus.OK,
      data: res,
      message: '',
    };
  } else {
    errorHandler.errorM({
      action_type: 'delete-user',
      error_data: { message: 'occures while delete user.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      data: '',
      message: 'Something want wrong, Please try again',
    };
  }
};

const updateUserStatus = async (id, userId, bodyData, info) => {
  try {
    const existingData = await User.findById(id);
    await User.findByIdAndUpdate(id, bodyData);
    await systemLog(
      'UPDATE',
      bodyData,
      userId,
      'update-user-status',
      existingData,
      info
    );
    return {
      status: httpStatus.OK,
      message: ' Updated.',
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'update-user-status',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

module.exports = {
  createUser,
  queryUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  updatePasswordById,
  updateUserStatus,
  getUserDetails,
  getUserByID,
};
