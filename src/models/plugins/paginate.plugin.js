const paginate = (schema) => {
  /**
   * @typedef {Object} QueryResult
   * @property {Document[]} results - Results found
   * @property {number} page - Current page
   * @property {number} limit - Maximum number of results per page
   * @property {number} totalPages - Total number of pages
   * @property {number} totalResults - Total number of documents
   */
  /**
   * Query for documents with pagination
   * @param {Object} [filter] - Mongo filter
   * @param {Object} [options] - Query options
   * @param {string} [options.sortBy] - Sorting criteria using the format: sortField:(desc|asc). Multiple sorting criteria should be separated by commas (,)
   * @param {string} [options.populate] - Populate data fields. Hierarchy of fields should be separated by (.). Multiple populating criteria should be separated by commas (,)
   * @param {number} [options.limit] - Maximum number of results per page (default = 10)
   * @param {number} [options.page] - Current page (default = 1)
   * @returns {Promise<QueryResult>}
   */
  schema.statics.paginate = async function (filter, options, searchArr) {
    let searchData = [];
    const tmpStatus = parseInt(filter.status);
    searchData.push({ status: { $ne: 2 } });
    if (tmpStatus === 1 || tmpStatus === 0) {
      searchData = [{ status: tmpStatus }];
    }
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
      const sArray = [];
      searchArr.forEach((ele) => {
        sArray.push({ [ele]: searchvalue });
      });
      searchData.push({
        $or: sArray,
      });
    }
    if (filter.user_type && filter.user_type !== 'undefined') {
      const searchvalue = {
        $regex: '.*' + filter.user_type + '.*',
        $options: 'i',
      };
      const sArray = [];
      searchArr.forEach((ele) => {
        sArray.push({ [ele]: searchvalue });
      });
      searchData.push({
        $or: sArray,
      });
    }

    let { startDate, endDate } = filter;
    if (startDate && startDate !== '' && endDate && endDate != '') {
      startDate = new Date(startDate);
      endDate = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
      searchData.push({ publishedAt: { $gte: startDate, $lte: endDate } });
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
    const countPromise = await this.aggregate([
      { $match: { $and: searchData } },
      { $count: 'count' },
    ]).exec();
    let docsPromise = this.aggregate([
      { $match: { $and: searchData } },
      {
        $sort: sort,
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (options.populate) {
      options.populate.split(',').forEach((populateOption) => {
        docsPromise = docsPromise.populate(
          populateOption
            .split('.')
            .reverse()
            .reduce((a, b) => ({ path: b, populate: a }))
        );
      });
    }

    docsPromise = docsPromise.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalCount, results] = values;
      const totalResults = totalCount[0] && totalCount[0].count;
      const totalPages = Math.ceil(totalResults / limit) || 1;
      const result = {
        results,
        pagination: {
          page: page,
          size: limit,
          lastPage: totalPages,
          length: totalResults,
        },
      };
      return Promise.resolve(result);
    });
  };
};

module.exports = paginate;
