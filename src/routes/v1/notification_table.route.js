const router = require('express').Router();
const auth = require('../../middlewares/auth');
const notificationController = require('../../controllers/notification_table.controller');

// Static routes first
router.post('/create', auth(), notificationController.createNotification);
router.post('/send', auth(), notificationController.sendNotification);
router.get('/list', auth(), notificationController.getNotifications);

router.post('/send-group', auth(), notificationController.sendNotificationToGroup);
router.post('/send-users', auth(), notificationController.sendNotificationToUsers);
router.get('/user-categories', auth(), notificationController.getUserCategories);

router.get('/users-with-tokens', auth(), notificationController.getUsersWithFcmTokens);

// Dynamic routes last
router.get('/:id', auth(), notificationController.getNotificationById);
router.put('/:id', auth(), notificationController.updateNotification);
router.delete('/:id', auth(), notificationController.deleteNotification);


module.exports = router;
