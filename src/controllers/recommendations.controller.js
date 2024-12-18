const catchAsync = require('../utils/catchAsync');
const { recommendationsService } = require('../services');
const pick = require('../utils/pick');
const httpStatus = require('http-status');

// Centralized response handler
const handleResponse = (res, { status, message, data, pagination = null }) => {
  res.status(status).send({ status, message, data, pagination });
};

// Get all recommendations (with search and pagination)
const getAllRecommendations = catchAsync(async (req, res) => {
  const filter = pick(req.query, ['search']);
  const options = pick(req.query, ['sortBy', 'limit', 'page']);

  const response = await recommendationsService.getRecommendations(filter, {
    limit: parseInt(options.limit) || 10,
    page: parseInt(options.page) || 1,
    sortBy: options.sortBy || 'createdAt:desc',
  });

  handleResponse(res, response);
});



// Get recommendation by ID
const getRecommendationById = catchAsync(async (req, res) => {
  const response = await recommendationsService.getRecommendationById(req.params.id);
  handleResponse(res, response);
});



const addRecommendation = catchAsync(async (req, res) => {
  const bodyData = req.body; // Get the body data (no need for user authentication if not used)

  const response = await recommendationsService.addRecommendation(bodyData); // Call the service with the bodyData
  handleResponse(res, response); // Send back the response
});


// Update recommendation details
const updateRecommendation = catchAsync(async (req, res) => {
  const { id } = req.params;


  const response = await recommendationsService.updateRecommendationDetails(id, req.body);
  handleResponse(res, response);
});



//Toggle recommendation status
const toggleRecommendationStatus = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body;

  // Wrap `isActive` in an object for correct MongoDB update format
  const response = await recommendationsService.updateRecommendationStatus(id, { isActive });
  handleResponse(res, response);
});


module.exports = {
  getAllRecommendations,
  getRecommendationById,
  addRecommendation,
  updateRecommendation,
  toggleRecommendationStatus,
};
