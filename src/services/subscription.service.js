const axios = require("axios");
const generateJWT = require("../middlewares/authApple");
require("dotenv").config();

const APP_ID = process.env.APP_ID






const getSalesReportService = async (vendorNumber, frequency, reportType, reportSubType, version) => {
    try {
        const token = generateJWT();
        if (!token) throw new Error("Failed to generate JWT");

        const url = "https://api.appstoreconnect.apple.com/v1/salesReports";

        let params = {
            "filter[vendorNumber]": String(vendorNumber),
            "filter[frequency]": String(frequency),
            "filter[reportType]": String(reportType),
            "filter[reportSubType]": String(reportSubType),
            "filter[version]": String(version),
        };

        if (frequency === "WEEKLY") {
            params["filter[reportDate]"] = "2020-12-31"; 
        } else if (frequency === "MONTHLY") {
            params["filter[reportDate]"] = "2020-05"; 
        } else if (frequency === "YEARLY") {
            params["filter[reportDate]"] = "2022"; 
        }

        console.log("Requesting URL:", url);
        console.log("With Params:", JSON.stringify(params, null, 2));

        const response = await axios.get(url, {
            params: params,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Fetched Sales Report:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Error fetching sales report:", JSON.stringify(error.response?.data || error.message, null, 2));

        if (error.response?.status === 404) {
            throw new Error("No sales report available for the requested period in 2023.");
        }

        throw new Error(`Failed to fetch sales report: ${JSON.stringify(error.response?.data?.error || error.message)}`);
    }
};









const getFinanceReportService = async (vendorNumber, reportDate, regionCode, reportType) => {
    try {
        const token = generateJWT();
        if (!token) throw new Error("Failed to generate JWT");

        const url = "https://api.appstoreconnect.apple.com/v1/financeReports";

        const params = {
            "filter[vendorNumber]": String(vendorNumber),
            "filter[reportDate]": String(reportDate),
            "filter[regionCode]": String(regionCode),
            "filter[reportType]": String(reportType) 
        };

        console.log("Requesting Finance Report URL:", url);
        console.log("With Params:", JSON.stringify(params, null, 2));

        const response = await axios.get(url, {
            params: params,
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("Fetched Finance Report:", JSON.stringify(response.data, null, 2));
        return response.data;
    } catch (error) {
        console.error("Error fetching finance report:", JSON.stringify(error.response?.data || error.message, null, 2));
        throw new Error(`Failed to fetch finance report: ${JSON.stringify(error.response?.data?.error || error.message)}`);
    }
};







const fetchAppDetails = async () => {
    try {
        if (!APP_ID) {
            throw new Error("APP_ID is not defined in environment variables.");
        }

        const token = generateJWT(); // Generate JWT for authentication
        const url = `https://api.appstoreconnect.apple.com/v1/apps/${APP_ID}`;

        const response = await axios.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        });

        return response.data; // Return the app details
    } catch (error) {
        console.error("Error fetching app details:", error.response?.data || error.message);
        throw new Error("Failed to fetch app details.");
    }
};







module.exports = { getSalesReportService, getFinanceReportService, fetchAppDetails };
