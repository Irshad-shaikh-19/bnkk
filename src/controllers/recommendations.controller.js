const catchAsync = require('../utils/catchAsync');
const { recommendationsService } = require('../services');
const pick = require('../utils/pick');

// Middleware for validating pagination queries
const validatePagination = (req, res, next) => {
  const { limit, page } = req.query;

  if (limit && (!Number.isInteger(+limit) || +limit <= 0)) {
    return res.status(400).send({ message: 'Limit must be a positive integer.' });
  }
  if (page && (!Number.isInteger(+page) || +page <= 0)) {
    return res.status(400).send({ message: 'Page must be a positive integer.' });
  }

  next();
};

// Get all recommendations with filters, pagination, and sorting
const getAllRecommendations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search', 'category', 'rewardType', 'isActive', 'expiresAt']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const { status, message, data } = await recommendationsService.getAllRecommendations(filter, options);
  const pagination = data?.pagination || {};
  res.status(status).send({ status, message, data: data.recommendations, pagination });
});

// Get recommendation details by ID
const getRecommendationById = catchAsync(async (req, res) => {
  const { status, message, data } = await recommendationsService.getRecommendationById(req.params.id);
  if (!data) {
    return res.status(status).send({ status, message, data: null });
  }
  res.status(status).send({ status, message, data });
});

// Add a new recommendation
const addRecommendation = catchAsync(async (req, res) => {
  const userId = req.user.id; // Extract userId from middleware
  const info = req.headers['user-agent']; // Optional user-agent information

  const { status, message, data } = await recommendationsService.addRecommendation(req.body, userId, info);
  res.status(status).send({ status, message, data });
});

// Update an existing recommendation
const updateRecommendation = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updates = req.body; // Extract updates from request body
  const userId = req.user.id; // Extract userId from middleware
  const info = req.headers['user-agent']; // Optional user-agent information

  const { status, message, data } = await recommendationsService.updateRecommendationDetails(id, userId, updates, info);
  res.status(status).send({ status, message, data });
});

// Export controller functions
module.exports = {
  getAllRecommendations,
  getRecommendationById,
  addRecommendation,
  updateRecommendation,
};
