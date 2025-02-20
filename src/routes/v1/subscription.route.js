const express = require("express");
const subscriptionController = require("../../controllers/subscription.controller");

const router = express.Router();

router.get("/sales", subscriptionController.getSalesReport); 
router.get("/finance", subscriptionController.getFinanceReport)
router.get("/app-details", subscriptionController.getAppDetails);
module.exports = router;
