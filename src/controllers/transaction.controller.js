const catchAsync = require('../utils/catchAsync');
const { transactionsService } = require('../services');
const pick = require('../utils/pick');

const getAllTransactionDetails = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'search',
    'status',
    'startDate',
    'endDate',
    'isPending',
    'csv',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } =
    await transactionsService.getAllTransactionDetails(filter, options);
  res.send({ status, message, data, pagination });
});

const getUserTransactionPercentages = catchAsync(async (req, res) => {
  const { status, data } = await transactionsService.getUserTransactionPercentages();
  res.status(status).send({ data });
});

const getTransactionDetailsById = catchAsync(async (req, res) => {
  const { status, message, data } =
    await transactionsService.getTransactionDetailsById(req.params.id);
  res.status(status).send({ status, message, data });
});

const GetTransactionsByInstitutionAndUser = catchAsync(async (req, res) => {
  const filter = pick(req.query, [
    'institution',
    'user',
    'search',
    'status',
    'startDate',
    'endDate',
    'isPending',
    'csv',
  ]);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);
  const { status, message, data, pagination } =
    await transactionsService.GetTransactionsByInstitutionAndUser(filter, options);
  res.send({ status, message, data, pagination });
});


const updateTransactionDetails = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // All the updates will come from the request body

  const { status, message, data } = await transactionsService.updateTransactionDetails(id, updates);

  res.status(status).send({ status, message, data });
});

module.exports = {
  getAllTransactionDetails,
  getTransactionDetailsById,
  GetTransactionsByInstitutionAndUser,
  updateTransactionDetails,
  getUserTransactionPercentages
};
