const express = require("express");
const subscriptionController = require("../../controllers/subscription.controller");

const router = express.Router();

router.get("/sales", subscriptionController.getSalesReport); 
router.get("/finance", subscriptionController.getFinanceReport); 
router.get("/app-usage", subscriptionController.getAppUsageReport); 
router.get("/reports/:appId", subscriptionController.getanalytics);
router.get("/downloads", subscriptionController.getDownloadsReport); 



module.exports = router;
