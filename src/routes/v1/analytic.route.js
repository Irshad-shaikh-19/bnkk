const express = require("express");
const { fetchAppleAnalytics, automateAnalytics,fetchAppleImpression,automateImpressionAnalytics, automateDownloadAnalytics,fetchAppleDownload, fetchAppleActiveUser,automateActiveUserAnalytics, fetchAppleSession,automateSessionAnalytics  } = require("../../controllers/analytics.controller");

const router = express.Router();

router.get("/fetch-user", fetchAppleAnalytics);
router.post("/fetch-user/automate", automateAnalytics);

router.get("/fetch-impression", fetchAppleImpression);
router.post("/fetch-impression/automate", automateImpressionAnalytics);

router.get("/fetch-download", fetchAppleDownload);
router.post("/fetch-download/automate", automateDownloadAnalytics);

router.get("/fetch-active-users", fetchAppleActiveUser);
router.post("/fetch-active-users/automate", automateActiveUserAnalytics);

router.get("/fetch-session", fetchAppleSession);
router.post("/fetch-session/automate", automateSessionAnalytics);

module.exports = router;
