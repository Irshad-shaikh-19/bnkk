const { SupportModel } = require('../models');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');
const mongoose = require('mongoose');

const getAllSupport = async (filter, options) => {
  try {
    let searchData = [{ status: { $ne: 2 } }];

    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      order === 'desc' ? (sort = { [key]: -1 }) : (sort = { [key]: 1 });
    }

    if (filter.isSuperAdmin === 'false') {
      searchData.push({
        $or: [{ user: mongoose.Types.ObjectId(filter.userId) }],
      });
    }

    if (filter.search) {
      const searchvalue = {
        $regex: '.*' + filter.search + '.*',
        $options: 'i',
      };
      searchData.push({
        $or: [
          { subject: searchvalue },
          { message: searchvalue },
          { category: searchvalue },
          { 'user_profile_data.lastName': searchvalue },
          { 'user_profile_data.firstName': searchvalue },
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
          localField: 'user',
          foreignField: 'user',
          as: 'user_profile_data',
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
          as: 'user_profile_data',
        },
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          subject: 1,
          user: 1,
          message: 1,
          createdAt: 1,
          status: 1,
          category: 1,
          file: 1,
          firstName: {
            $arrayElemAt: ['$user_profile_data.firstName', 0],
          },
          lastName: {
            $arrayElemAt: ['$user_profile_data.lastName', 0],
          },
        },
      },
    ];

    if (searchData.length > 0) {
      countPromiseArr.splice(1, 0, { $match: { $and: searchData } });
      docsPromiseArr.splice(1, 0, { $match: { $and: searchData } });
    }
    const countPromise = await SupportModel.aggregate(countPromiseArr);
    let docsPromise = await SupportModel.aggregate(docsPromiseArr);
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
      action_type: 'get-support-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

module.exports = {
  getAllSupport,
};
