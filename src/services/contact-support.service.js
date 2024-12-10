const { ContactSupportModel } = require('../models');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');

const getAllContactSupport = async (filter, options) => {
  try {
    let searchData = [];

    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      order === 'desc' ? (sort = { [key]: -1 }) : (sort = { [key]: 1 });
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
          { name: searchvalue },
          { email: searchvalue },
          { subject: searchvalue },
          { message: searchvalue },
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

    let countPromiseArr = [{ $count: 'count' }];
    let docsPromiseArr = [
      { $sort: sort },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          name: 1,
          email: 1,
          subject: 1,
          createdAt: 1,
          message: 1,
        },
      },
    ];

    if (searchData.length > 0) {
      countPromiseArr.splice(0, 0, { $match: { $and: searchData } });
      docsPromiseArr.splice(0, 0, { $match: { $and: searchData } });
    }
    const countPromise = await ContactSupportModel.aggregate(countPromiseArr);
    let docsPromise = await ContactSupportModel.aggregate(docsPromiseArr);
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
      action_type: 'get-contact-support-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

module.exports = {
  getAllContactSupport,
};
