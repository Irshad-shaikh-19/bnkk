const { downloadAppleAnalytics } = require("../services/scarpingService");
const { getAppleAnalyticsData } = require("../services/analytic.service");

// GET: Return parsed data from existing CSV
const fetchAppleAnalytics = async (req, res) => {
  try {
    const analyticsData = await getAppleAnalyticsData();
    res.status(200).json(analyticsData);
  } catch (error) {
    console.error("❌ Error fetching Apple Analytics:", error.message);
    res.status(500).json({ message: "Failed to load analytics data" });
  }
};

// POST: Automate downloading and return parsed data
const automateAnalytics = async (req, res) => {
  try {
    console.log("🚀 Starting Analytics Automation...");

    // Step 1: Download latest CSV from Apple
    await downloadAppleAnalytics();

    // Step 2: Read and parse CSV
    const analyticsData = await getAppleAnalyticsData();

    // Step 3: Respond with parsed data
    res.status(200).json({
      message: "✅ Data successfully fetched!",
      data: analyticsData,
    });
  } catch (error) {
    console.error("❌ Automation failed:", error.message);
    res.status(500).json({ error: "Automation failed" });
  }
};

module.exports = { fetchAppleAnalytics, automateAnalytics };
