const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { recommendationsController } = require('../../controllers');

// Get all recommendations
router.get('/get-list',auth(),  recommendationsController.getAllRecommendations);

// Get a single recommendation by ID
router.get('/get/:id', auth(), recommendationsController.getRecommendationById);

// Add a new recommendation
router.post('/add', auth(), recommendationsController.addRecommendation);

// Update an existing recommendation
router.put('/update/:id', auth(), recommendationsController.updateRecommendation);

// Toggle the status (isActive) of a recommendation
router.put('/toggle-status/:id', auth(), recommendationsController.toggleRecommendationStatus);

module.exports = router;
