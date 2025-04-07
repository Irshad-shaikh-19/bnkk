const { downloadAppleAnalytics } = require("../services/scarpingService");
const { downloadImpressionAnalytics } = require("../services/impressionService")

const { getAppleAnalyticsData,getAppleImpressionData } = require("../services/analytic.service");
const Analytic = require("../models/analytics.model");
const Impression = require("../models/impression.model");


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


module.exports = { fetchAppleAnalytics, automateAnalytics, fetchAppleImpression,automateImpressionAnalytics };
