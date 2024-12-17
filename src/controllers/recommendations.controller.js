const catchAsync = require('../utils/catchAsync');
const { recommendationsService } = require('../services');
const pick = require('../utils/pick');



// Get all recommendations with filters, pagination, and sorting
const getAllRecommendations = catchAsync(async (req, res) => {
  // Extract query parameters from the request
  const filter = pick(req.query, ['search', 'category', 'isActive']);  // Picking filters for search, category, and isActive
  const options = pick(req.query, ['sortBy', 'limit', 'page']);  // Picking pagination and sorting options

  console.log('Filter:', filter);  // Logs the applied filters
  console.log('Options:', options);  // Logs the pagination and sorting options

  // Default pagination and sorting options
  const defaultOptions = {
    limit: options.limit ? parseInt(options.limit) : 10,  // If limit exists, use it, otherwise default to 10
    page: options.page ? parseInt(options.page) : 1,  // If page exists, use it, otherwise default to 1
    sortBy: options.sortBy || 'createdAt:desc',  // If sortBy exists, use it, otherwise default to createdAt:desc
  };

  // Fetch recommendations using the service function
  const { status, message, data, pagination } = await recommendationsService.getRecommendations(filter, defaultOptions);

  // Send the response to the client
  res.status(status).send({
    status,  // The status code of the response
    message,  // A message (could be success/error)
    data,  // The data of the recommendations
    pagination,  // Pagination info (total count, page, etc.)
  });
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


// Toggle the isActive status of a recommendation
const toggleRecommendationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;  // Assuming the request body contains 'isActive' field
  const userId = req.user.id; // Extract userId from middleware
  const info = req.headers['user-agent']; // Optional user-agent information

  // Ensure 'isActive' is provided and is a boolean
  if (typeof isActive !== 'boolean') {
    return res.status(400).send({
      status: 400,
      message: '"isActive" should be a boolean value.',
      data: {},
    });
  }

  const { status, message, data } = await recommendationsService.updateRecommendationStatus(id, userId, { isActive }, info);

  res.status(status).send({ status, message, data });
});

// Export controller functions
module.exports = {
  getAllRecommendations,
  getRecommendationById,
  toggleRecommendationStatus,
  addRecommendation,
  updateRecommendation,
};
