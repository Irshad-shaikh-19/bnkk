const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { fcmtokenController } = require('../../controllers');

// Add a new FCM token
router.post('/add', auth(), fcmtokenController.addFcmToken);

// Get all FCM tokens
router.get('/all', auth(), fcmtokenController.getAllFcmTokens);

module.exports = router;
