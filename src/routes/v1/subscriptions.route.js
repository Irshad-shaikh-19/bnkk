const express = require('express');
const router = express.Router();
const subscriptionController = require('../../controllers/subscriptions.controller');

router.post('/add-subscription', subscriptionController.createSubscription);
router.get('/all-subscription', subscriptionController.getAllSubscriptions);
router.get('/one-subscription/:id', subscriptionController.getSubscriptionById);
router.put('/update-subscription/:id', subscriptionController.updateSubscription);
router.delete('/delete-subscription/:id', subscriptionController.deleteSubscription);
router.get('/arpu', subscriptionController.getARPUPerUser);

module.exports = router;
