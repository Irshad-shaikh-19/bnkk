// src/routes/notification.routes.js

const router = require('express').Router();
const auth = require('../../middlewares/auth');
const notificationTableController = require('../../controllers/notification_table.controller');

router.post('/create',auth(), notificationTableController.createNotification);
router.get('/get-list',auth(), notificationTableController.getNotifications);
router.get('/get-by-id/:id',auth(), notificationTableController.getNotificationById);
router.put('/:id',auth(), notificationTableController.updateNotification);
router.delete('/:id',auth(), notificationTableController.deleteNotification);

module.exports = router;
