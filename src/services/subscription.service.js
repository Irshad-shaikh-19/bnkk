const axios = require('axios');
const generateJWT = require('../middlewares/authApple');
require('dotenv').config();
const zlib = require('zlib');

const APP_ID = process.env.APP_ID;

function parseTSVtoJSON(tsvString) {
  const rows = tsvString.split('\n').filter((row) => row.trim() !== '');
  const headers = rows[0].split('\t');

  return rows.slice(1).map((row) => {
    const values = row.split('\t');
    return headers.reduce((acc, header, index) => {
      acc[header] = values[index] || '';
      return acc;
    }, {});
  });
}



const getAnalyticsReportService = async (appId) => {
  try {
    const token = generateJWT(); // Ensure this function is implemented correctly
    if (!token) throw new Error('JWT generation failed');

    if (!appId) throw new Error('App ID is required');

    const url = `https://api.appstoreconnect.apple.com/v1/apps/${appId}/analyticsReportRequests`;

    console.log('Requesting URL:', url);

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Fetched Analytics Report:', JSON.stringify(response.data, null, 2));
    return response.data;

  } catch (error) {
    let errorMessage = 'Unknown error occurred';
    let statusCode = 500; // Default status

    if (axios.isAxiosError(error)) {
      // If it's an Axios error, extract relevant information
      statusCode = error.response?.status || 500;
      errorMessage = error.response?.data?.errors?.[0]?.detail || JSON.stringify(error.response?.data || 'No error details');
    } else if (error instanceof SyntaxError) {
      errorMessage = 'JSON Parsing Error: ' + error.message;
    } else {
      errorMessage = error.message;
    }

    console.error(`Error fetching analytics report [${statusCode}]:`, errorMessage);

    // Throw an error with the status and detailed message
    const errorObj = new Error(errorMessage);
    errorObj.status = statusCode;
    throw errorObj;
  }
};

const getSalesReportService = async (
  vendorNumber,
  frequency,
  reportType,
  reportSubType,
  version,
  reportDate // New parameter added
) => {
  try {
    const token = generateJWT();
    if (!token) throw new Error('Failed to generate JWT');

    const url = 'https://api.appstoreconnect.apple.com/v1/salesReports';

    let params = {
      'filter[vendorNumber]': String(vendorNumber),
      'filter[frequency]': String(frequency),
      'filter[reportType]': String(reportType),
      'filter[reportSubType]': String(reportSubType),
      'filter[version]': String(version),
      'filter[reportDate]': String(reportDate), // Dynamically added
    };

    console.log('Requesting URL:', url);
    console.log('With Params:', JSON.stringify(params, null, 2));

    const response = await axios.get(url, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept-Encoding': 'gzip',
      },
      responseType: 'arraybuffer',
    });

    const decompressedData = zlib.gunzipSync(response.data).toString('utf8');

    const jsonData = parseTSVtoJSON(decompressedData);

    console.log('Parsed Sales Report:', JSON.stringify(jsonData, null, 2));
    return jsonData;
  } catch (error) {
    let errorMessage = 'Unknown error occurred';

    if (error.response?.data) {
      try {
        const errorJson = JSON.parse(error.response.data.toString('utf8'));
        errorMessage =
          errorJson.errors?.[0]?.detail || JSON.stringify(errorJson);
      } catch (parseError) {
        errorMessage = error.response.data.toString('utf8');
      }
    }

    console.error('Error fetching sales report:', errorMessage);

    if (error.response?.status === 404) {
      throw new Error('No sales report available for the requested period.');
    }

    throw new Error(`Failed to fetch sales report: ${errorMessage}`);
  }
};








const getfinanceService = async (vendorNumber, regionCode, reportType, reportDate) => {
  try {
    const token = generateJWT();
    if (!token) throw new Error("Failed to generate JWT");

    const url = "https://api.appstoreconnect.apple.com/v1/financeReports";

    const params = {
      "filter[vendorNumber]": String(vendorNumber),
      "filter[regionCode]": String(regionCode),
      "filter[reportType]": String(reportType),
      "filter[reportDate]": String(reportDate),
    };

    console.log("Requesting URL:", url);
    console.log("With Params:", JSON.stringify(params, null, 2));

    const response = await axios.get(url, {
      params: params,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Encoding": "gzip",
      },
      responseType: "arraybuffer",
    });

    let decompressedData;
    try {
      decompressedData = zlib.gunzipSync(response.data).toString("utf8");
    } catch (decompressionError) {
      console.warn("Response not gzipped, using raw data.");
      decompressedData = response.data.toString("utf8");
    }

    const jsonData = parseTSVtoJSON(decompressedData);

    console.log("Parsed Finance Report:", JSON.stringify(jsonData, null, 2));
    return jsonData;
  } catch (error) {
    let errorMessage = "Unknown error occurred while fetching finance report.";
    let errorDetails = {};

    if (error.response) {
      try {
        const errorJson = JSON.parse(error.response.data.toString("utf8"));
        errorMessage = errorJson.errors?.[0]?.detail || JSON.stringify(errorJson);
        errorDetails = errorJson;
      } catch (parseError) {
        errorMessage = error.response.data.toString("utf8");
      }

      console.error("Error fetching finance report:", {
        message: errorMessage,
        status: error.response.status,
        details: errorDetails,
      });

      switch (error.response.status) {
        case 400:
          throw new Error(`Invalid request parameters: ${errorMessage}`);
        case 403:
          throw new Error(`Access forbidden: ${errorMessage}`);
        case 404:
          throw new Error("No finance report available for the requested period.");
        default:
          throw new Error(`Finance API Error (${error.response.status}): ${errorMessage}`);
      }
    } else {
      console.error("Network or Unknown Error:", {
        message: error.message,
        stack: error.stack,
      });
      throw new Error(`Failed to fetch finance report: ${error.message}`);
    }
  }
};




const apps = async () => {
  try {
    const token = generateJWT();
      if (!token) throw new Error("Failed to generate JWT");

      const response = await axios.get("https://api.appstoreconnect.apple.com/v1/apps", {
          headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
          },
      });

      console.log("Apps List:", JSON.stringify(response.data, null, 2));

      // Extract App ID from response
      const apps = response.data.data;
      if (apps.length === 0) throw new Error("No apps found in your account");

      return apps.map((app) => ({
          name: app.attributes.name,
          bundleId: app.attributes.bundleId,
          appId: app.id, // This is the required App ID
      }));
  } catch (error) {
      console.error("Error fetching App ID:", error.response?.data || error.message);
      throw new Error("Failed to fetch App ID");
  }
};





const getDownloadsReportService = async (vendorNumber, frequency, startDate, endDate, measures, dimensions) => {
  try {
    const token = generateJWT();
    if (!token) throw new Error("Failed to generate JWT");

    const url = "https://analytics.itunes.apple.com/analytics/api/v1/data/time-series";

    let params = {
      filter: JSON.stringify({
        frequency: frequency,
        measures: measures, // e.g., ["app_downloads"]
        dimensionFilters: {
          appAppleId: [vendorNumber] // Using vendorNumber as App ID
        },
        startTime: startDate,
        endTime: endDate
      })
    };

    if (dimensions.length) {
      params.filter = JSON.stringify({
        ...JSON.parse(params.filter),
        dimensionFilters: {
          ...JSON.parse(params.filter).dimensionFilters,
          [dimensions]: ["all"] // Pass selected dimension (e.g., "storefrontId", "source", "platformVersion")
        }
      });
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

    console.log("Parsed Downloads Report:", JSON.stringify(response.data, null, 2));
    return response.data;
  } catch (error) {
    let errorMessage = "Unknown error occurred";

    if (error.response?.data) {
      try {
        const errorJson = JSON.parse(error.response.data.toString("utf8"));
        errorMessage = errorJson.errors?.[0]?.detail || JSON.stringify(errorJson);
      } catch (parseError) {
        errorMessage = error.response.data.toString("utf8");
      }
    }

    console.error("Error fetching downloads report:", errorMessage);

    if (error.response?.status === 404) {
      throw new Error("No downloads report available for the requested period.");
    }

    throw new Error(`Failed to fetch downloads report: ${errorMessage}`);
  }
};




module.exports = { getSalesReportService,getfinanceService,apps,getAnalyticsReportService , getDownloadsReportService};
