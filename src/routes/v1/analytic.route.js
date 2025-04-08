const express = require("express");
const { fetchAppleAnalytics, automateAnalytics,fetchAppleImpression,automateImpressionAnalytics, automateDownloadAnalytics,fetchAppleDownload  } = require("../../controllers/analytics.controller");

const router = express.Router();

router.get("/fetch-user", fetchAppleAnalytics);
router.post("/fetch-user/automate", automateAnalytics);

router.get("/fetch-impression", fetchAppleImpression);
router.post("/fetch-impression/automate", automateImpressionAnalytics);

router.get("/fetch-download", fetchAppleDownload);
router.post("/fetch-download/automate", automateDownloadAnalytics);

module.exports = router;
