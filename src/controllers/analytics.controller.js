const { downloadAppleAnalytics } = require("../services/scarpingService");
const { downloadImpressionAnalytics } = require("../services/impressionService")
const { downloadAppleDownloadAnalytics } = require("../services/downloadService")
const { downloadAppleActiveUserAnalytics } = require("../services/activeUser.service")
const { downloadAppleSessionAnalytics } = require("../services/session.service")


const { getAppleAnalyticsData,getAppleImpressionData,getAppleDownloadData,getAppleActiveUserData,getAppleSessionData } = require("../services/analytic.service");
const Analytic = require("../models/analytics.model");
const Impression = require("../models/impression.model");
const Download = require("../models/download.model");
const ActiveUser = require("../models/activeUser.model");
const Session = require("../models/session.model");


// GET: Return parsed data from existing CSV
const fetchAppleAnalytics = async (req, res) => {
  try {
    const analyticsData = await Analytic.find().sort({ date: 1 });
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("❌ Error fetching Apple Analytics from DB:", error.message);
    res.status(500).json({ message: "Failed to load analytics data from DB" });
  }
};

// POST: Automate downloading and return parsed data
const automateAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation...");

    await downloadAppleAnalytics();

    const analyticsData = await getAppleAnalyticsData();

    res.status(200).json({
      message: "✅ Data successfully fetched!",
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Automation failed:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
      error,
    });
    res.status(500).json({ error: "Automation failed", detail: error.message });
  }
};








// GET: Impressions Data
const fetchAppleImpression = async (req, res) => {
  try {
    const data = await Impression.find().sort({ date: 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Impression Analytics:", error.message);
    res.status(500).json({ message: "Failed to fetch impression data" });
  }
};


// POST: Automate downloading Impressions data
const automateImpressionAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation (Impressions)...");
    await downloadImpressionAnalytics();
    const impressionData = await getAppleImpressionData();
    res.status(200).json({
      message: "✅ Impressions data fetched!",
      data: impressionData,
    });
  } catch (error) {
    console.error("❌ Impressions Automation failed:", error.message);
    res.status(500).json({ error: "Automation failed", detail: error.message });
  }
};








// GET: Download Data
const fetchAppleDownload = async (req, res) => {
  try {
    const data = await Download.find().sort({ date: 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Download Analytics:", error.message);
    res.status(500).json({ message: "Failed to fetch impression data" });
  }
};


// POST: Automate downloading Downloads data
const automateDownloadAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation (Downloads)...");
    await downloadAppleDownloadAnalytics();
    const downloadData = await getAppleDownloadData();
    res.status(200).json({
      message: "✅ Downloads data fetched!",
      data: downloadData,
    });
  } catch (error) {
    console.error("❌ Downloads Automation failed:", error.message);
    res.status(500).json({ error: "Automation failed", detail: error.message });
  }
};









// GET: Active User Data
const fetchAppleActiveUser = async (req, res) => {
  try {
    const data = await ActiveUser.find().sort({ date: 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Active User Analytics:", error.message);
    res.status(500).json({ message: "Failed to fetch active user data" });
  }
};


// POST: Automate downloading Active User data
const automateActiveUserAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation (active users)...");
    await downloadAppleActiveUserAnalytics();
    const downloadData = await getAppleActiveUserData();
    res.status(200).json({
      message: "✅ Active Users data fetched!",
      data: downloadData,
    });
  } catch (error) {
    console.error("❌ Active Users Automation failed:", error.message);
    res.status(500).json({ error: "Automation failed", detail: error.message });
  }
};





// GET: Session Data
const fetchAppleSession = async (req, res) => {
  try {
    const data = await Session.find().sort({ date: 1 });
    res.status(200).json(data);
  } catch (error) {
    console.error("❌ Error fetching Session Analytics:", error.message);
    res.status(500).json({ message: "Failed to fetch Session data" });
  }
};


// POST: Automate downloading Session data
const automateSessionAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation (sessions)...");
    await downloadAppleSessionAnalytics();
    const sessionData = await getAppleSessionData();
    res.status(200).json({
      message: "✅ Session data fetched!",
      data: sessionData,
    });
  } catch (error) {
    console.error("❌ Session Automation failed:", error.message);
    res.status(500).json({ error: "Automation failed", detail: error.message });
  }
};


module.exports = { fetchAppleAnalytics, automateAnalytics, fetchAppleImpression,automateImpressionAnalytics, fetchAppleDownload, automateDownloadAnalytics, fetchAppleActiveUser,automateActiveUserAnalytics,fetchAppleSession, automateSessionAnalytics };
