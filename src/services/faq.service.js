const { FaqModel } = require('../models');
const httpStatus = require('http-status');
const errorHandler = require('../utils/error.handler');

const getFaqList = async (filter, options) => {
  try {
    let searchData = [{ status: { $ne: 2 } }];

    let sort = {};
    if (options.sortBy) {
      const [key, order] = options.sortBy.split(':');
      order === 'desc' ? (sort = { [key]: -1 }) : (sort = { [key]: 1 });
    }

    if (filter.search) {
      const searchvalue = {
        $regex: '.*' + filter.search + '.*',
        $options: 'i',
      };
      searchData.push({
        $or: [{ question: searchvalue }, { answer: searchvalue }],
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
          question: 1,
          answer: 1,
          createdAt: 1,
        },
      },
    ];

    if (searchData.length > 0) {
      countPromiseArr.splice(0, 0, { $match: { $and: searchData } });
      docsPromiseArr.splice(0, 0, { $match: { $and: searchData } });
    }
    const countPromise = await FaqModel.aggregate(countPromiseArr);
    let docsPromise = await FaqModel.aggregate(docsPromiseArr);
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
      message: 'Success.',
      data: results,
      status: httpStatus.OK,
    };
  } catch (error) {
    errorHandler.errorM({
      action_type: 'get-faq-list',
      error_data: error,
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Something Went Wrong.',
    };
  }
};

module.exports = {
  getFaqList,
};
