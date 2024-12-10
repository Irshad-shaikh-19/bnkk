const mongoose = require('mongoose');
const connection = mongoose.connection;
const collection = connection.collection('tbl_system_logs');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');
const { concateDate } = require('../utils/date');
const getAllSystemLog = async (filter, options) => {
  try {
    let searchData = [];
    let sort = {};

    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      sort = { [key]: order === 'desc' ? -1 : 1 };
    }

    if (filter.status && filter.status !== 'undefined') {
      searchData.push({
        $or: [{ status: Number(filter.status) }],
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
      searchData.push({
        $or: [
          {
            createdAt: {
              $gte: startDate,
              $lte: endDate,
            },
          },
        ],
      });
    }

    if (filter.search) {
      const searchvalue = {
        $regex: '.*' + filter.search + '.*',
        $options: 'i',
      };
      searchData.push({
        $or: [
          { operation: searchvalue },
          { key: searchvalue },
          // { _id: new mongoose.Types.ObjectId(filter.search) },
          { ip_address: searchvalue },
          { 'user_data.email': searchvalue },
          { device: searchvalue },
          { "role_data.role_name": searchvalue },
          { 'user_profile_data.lastName': searchvalue },
          { 'user_profile_data.firstName': searchvalue },
        ],
      });
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
        // { $unwind: { path: '$user_profile_data', preserveNullAndEmptyArrays: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'operation_by',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user_data._id',
            foreignField: 'user',
            as: 'user_profile_data',
          },
        },
        {
          $addFields: {
            roleIds: { $arrayElemAt: ['$user_data.roles', 0] }
          }
        },
        {
          $addFields: {
            roleId: { $arrayElemAt: ['$roleIds', 0] }
          }
        },
        {
          $lookup: {
            from: 'tbl_roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'role_data',
          },
        },
        {
          $project: {
            _id: 1,
            operation: 1,
            key: 1,
            operation_by: 1,
            ip_address: 1,
            device: 1,
            createdAt: 1,
            // role_data: 1,
            // roleId: 1,
            firstName: { $arrayElemAt: ['$user_profile_data.firstName', 0] },
            lastName: { $arrayElemAt: ['$user_profile_data.lastName', 0] },
            email: { $arrayElemAt: ['$user_data.email', 0] },
            role: { $arrayElemAt: ['$role_data.role_name', 0] },
          },
        },
        { $count: 'count' },
      ];
      let docsPromiseArr = [
        // { $unwind: { path: '$user_profile_data', preserveNullAndEmptyArrays: true } },
        // { $match: { operation_by: mongoose.Types.ObjectId('65f99b90fd393552c6e68e59') } },
        {
          $lookup: {
            from: 'users',
            localField: 'operation_by',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user_data._id',
            foreignField: 'user',
            as: 'user_profile_data',
          },
        },
        {
          $addFields: {
            roleIds: { $arrayElemAt: ['$user_data.roles', 0] }
          }
        },
        {
          $addFields: {
            roleId: { $arrayElemAt: ['$roleIds', 0] }
          }
        },
        {
          $lookup: {
            from: 'tbl_roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'role_data',
          },
        },
        {
          $project: {
            _id: 1,
            operation: 1,
            key: 1,
            operation_by: 1,
            ip_address: 1,
            device: 1,
            createdAt: 1,
            firstName: { $arrayElemAt: ['$user_profile_data.firstName', 0] },
            lastName: { $arrayElemAt: ['$user_profile_data.lastName', 0] },
            email: { $arrayElemAt: ['$user_data.email', 0] },
            role: { $arrayElemAt: ['$role_data.role_name', 0] },
          },
        },
        { $sort: sort },
        { $skip: skip },
        { $limit: limit },
      ];

      if (searchData.length > 0) {
        countPromiseArr.splice(5, 0, { $match: { $and: searchData } });
        docsPromiseArr.splice(5, 0, { $match: { $and: searchData } });
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
            from: 'users',
            localField: 'operation_by',
            foreignField: '_id',
            as: 'user_data',
          },
        },
        {
          $lookup: {
            from: 'userprofiles',
            localField: 'user_data._id',
            foreignField: 'user',
            as: 'user_profile_data',
          },
        },
        {
          $addFields: {
            roleIds: { $arrayElemAt: ['$user_data.roles', 0] }
          }
        },
        {
          $addFields: {
            roleId: { $arrayElemAt: ['$roleIds', 0] }
          }
        },
        {
          $lookup: {
            from: 'tbl_roles',
            localField: 'roleId',
            foreignField: '_id',
            as: 'role_data',
          },
        },
        { $sort: sort },
        {
          $project: {
            _id: 1,
            operation: 1,
            key: 1,
            operation_by: 1,
            ip_address: 1,
            device: 1,
            createdAt: concateDate('$createdAt'),
            firstName: { $arrayElemAt: ['$user_profile_data.firstName', 0] },
            lastName: { $arrayElemAt: ['$user_profile_data.lastName', 0] },
            email: { $arrayElemAt: ['$user_data.email', 0] },
            role: { $arrayElemAt: ['$role_data.role_name', 0] },
          },
        },
      ];

      if (searchData.length > 0) {
        docsPromiseArr.splice(5, 0, { $match: { $and: searchData } });
      }

      // if (options.sortBy) {
      //   docsPromiseArr.push({ $sort: sort });
      // }

      let docsPromise = await collection.aggregate(docsPromiseArr).toArray();
      return {
        pagination: {},
        data: docsPromise,
        status: httpStatus.OK,
      };
    }
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-system-log-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};


module.exports = {
  getAllSystemLog,
};
