const subscriptionService = require("../services/subscription.service");


const getSalesReport = async (req, res) => {
    try {
        const { vendorNumber, frequency, reportType, reportSubType, version } = req.query;

       
        if (![vendorNumber, frequency, reportType, reportSubType, version].every(Boolean)) {
            return res.status(400).json({
                error: "Missing required query parameters. Please provide vendorNumber, frequency, reportType, reportSubType, and version."
            });
        }

        console.log("Fetching sales report with params:", { vendorNumber, frequency, reportType, reportSubType, version });

        const data = await subscriptionService.getSalesReportService(vendorNumber, frequency, reportType, reportSubType, version);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getSalesReportController:", error.response?.data || error.message);
        
        res.status(500).json({
            success: false,
            error: error.response?.data || "Failed to fetch sales report."
        });
    }
};



const getFinanceReport = async (req, res) => {
    try {
        const { vendorNumber, reportDate, regionCode, reportType } = req.query;

        // Validate required parameters
        if (![vendorNumber, reportDate, regionCode, reportType].every(Boolean)) {
            return res.status(400).json({
                error: "Missing required query parameters. Please provide vendorNumber, reportDate, regionCode, and reportType."
            });
        }

        console.log("Fetching finance report with params:", { vendorNumber, reportDate, regionCode, reportType });

        // Call the finance report service
        const data = await subscriptionService.getFinanceReportService(vendorNumber, reportDate, regionCode, reportType);

        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        console.error("Error in getFinanceReportController:", error.response?.data || error.message);

        res.status(500).json({
            success: false,
            error: error.response?.data || "Failed to fetch finance report."
        });
    }
};

const getAppDetails = async (req, res) => {
    try {
        const data = await subscriptionService.fetchAppDetails(); // Call the updated service function
        res.json({ success: true, data });
    } catch (error) {
        console.error("Error fetching app details:", error);
        res.status(500).json({ success: false, error: error.message });
    }
}







module.exports = { getSalesReport,getFinanceReport,getAppDetails };
