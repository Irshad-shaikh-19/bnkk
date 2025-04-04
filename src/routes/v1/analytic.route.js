const express = require("express");
const { fetchAppleAnalytics, automateAnalytics } = require("../../controllers/analytics.controller");

const router = express.Router();

router.get("/fetch-user", fetchAppleAnalytics);
router.post("/fetch-user/automate", automateAnalytics);

module.exports = router;
