const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { recommendationsController } = require('../../controllers');

// Get all recommendations with filters, pagination, and sorting
router.get('/get-list', auth(), recommendationsController.getAllRecommendations);

// Get a recommendation by ID
router.get('/get-by-id/:id', auth(), recommendationsController.getRecommendationById);

// Add a new recommendation
router.post('/add', auth(), recommendationsController.addRecommendation);

// Update an existing recommendation by ID
router.put('/update/:id', auth(), recommendationsController.updateRecommendation);

// Toggle the isActive status of a recommendation
router.put('/toggle-status/:id', auth(), recommendationsController.toggleRecommendationStatus);

module.exports = router;