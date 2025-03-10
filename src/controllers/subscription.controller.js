const subscriptionService = require("../services/subscription.service");


const getSalesReport = async (req, res) => {
    try {
        const { vendorNumber, frequency, reportType, reportSubType, version, reportDate } = req.query;

        // Ensure all required parameters are provided
        if (![vendorNumber, frequency, reportType, reportSubType, version, reportDate].every(Boolean)) {
            return res.status(400).json({
                error: "Missing required query parameters. Please provide vendorNumber, frequency, reportType, reportSubType, version, and reportDate."
            });
        }

        console.log("Fetching sales report with params:", { vendorNumber, frequency, reportType, reportSubType, version, reportDate });

        // Call the service function with the updated parameters
        const data = await subscriptionService.getSalesReportService(vendorNumber, frequency, reportType, reportSubType, version, reportDate);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getSalesReport Controller:", error.message);

        res.status(500).json({
            success: false,
            error: error.message || "Failed to fetch sales report."
        });
    }
};







const getFinanceReport = async (req, res) => {
    try {
        const { vendorNumber, regionCode, reportType, reportDate } = req.query;

        if (![vendorNumber, regionCode, reportType, reportDate].every(Boolean)) {
            throw new Error("Missing required query parameters.");
        }

        console.log("Fetching finance report with params:", { vendorNumber, regionCode, reportType, reportDate });

        const data = await subscriptionService.getfinanceService(vendorNumber, regionCode, reportType, reportDate);

        return res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in Finance Controller:", {
            message: error.message,
            stack: error.stack,
        });

        return res.status(500).json({
            success: false,
            error: {
                message: error.message || "Unknown error occurred while fetching finance report.",
                stack: process.env.NODE_ENV === "development" ? error.stack : "Stack trace hidden",
            }
        });
    }
};










const getAppUsageReport = async (req, res) => {
    try {
        const data = await subscriptionService.apps();
        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Error in getAppUsageReport Controller:", error);

        // Ensure error has a status and message
        const status = error.status || 500;
        const message = error.message || "Internal Server Error";

        return res.status(status).json({ error: message });
    }
};


const getanalytics = async (req, res) => {
    try {
        const { appId } = req.params; // Assuming appId is passed in URL params
        if (!appId) return res.status(400).json({ error: 'App ID is required' });

        const data = await subscriptionService.getAnalyticsReportService(appId);
        return res.status(200).json({ success: true, data });

    } catch (error) {
        console.error("Error in getanalytics Controller:", error);

        const status = error.status || 500;
        const message = error.message || "Internal Server Error";

        return res.status(status).json({ error: message });
    }
};




const getDownloadsReport = async (req, res) => {
  try {
    const { vendorNumber, frequency, startDate, endDate, measures, dimensions } = req.query;

    // Ensure required parameters are provided
    if (![vendorNumber, frequency, startDate, endDate, measures].every(Boolean)) {
      return res.status(400).json({
        error: "Missing required query parameters. Please provide vendorNumber, frequency, startDate, endDate, and measures."
      });
    }

    console.log("Fetching downloads report with params:", { vendorNumber, frequency, startDate, endDate, measures, dimensions });

    // Call the service function with the provided parameters
    const data = await subscriptionService.getDownloadsReportService(vendorNumber, frequency, startDate, endDate, JSON.parse(measures), dimensions || []);

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    console.error("Error in getDownloadsReport Controller:", error.message);

    res.status(500).json({
      success: false,
      error: error.message || "Failed to fetch downloads report."
    });
  }
};





module.exports = { getSalesReport,getFinanceReport,getAppUsageReport,getanalytics,getDownloadsReport };
