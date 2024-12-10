const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { notificationController } = require('../../controllers');

router.get('/get-list', auth(), notificationController.getAllNotification);
router.get('/get-transaction-list', auth(), notificationController.getAllTransaction);
router.post('/get-same-transaction-list', auth(), notificationController.getAllSameTransaction);

module.exports = router;
