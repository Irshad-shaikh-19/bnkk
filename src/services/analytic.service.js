const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const Analytic = require("../models/analytics.model");
const Impression = require("../models/impression.model")
const Download = require("../models/download.model")

const getAppleAnalyticsData = () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../downloads/analytics.csv");

    if (!fs.existsSync(filePath)) {
      return reject(new Error("CSV file not found"));
    }

    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    const headerIndex = lines.findIndex((line) => line.startsWith("Date,"));
    if (headerIndex === -1) {
      return reject(new Error("Header row not found in CSV"));
    }

    const cleanedLines = lines.slice(headerIndex).join("\n");
    const cleanedPath = path.join(__dirname, "../downloads/cleaned.csv");
    fs.writeFileSync(cleanedPath, cleanedLines);

    const results = [];

    fs.createReadStream(cleanedPath)
      .pipe(csv())
      .on("data", async (data) => {
        const date = data["Date"];
        const views = data["Product Page Views"];

        if (date && views) {
          const row = {
            date: new Date(date.trim()),
            views: parseFloat(views),
          };
          results.push(row);

          // 🆕 Save or update in MongoDB
          try {
            await Analytic.updateOne(
              { date: row.date },
              { $set: { views: row.views } },
              { upsert: true }
            );
          } catch (dbErr) {
            console.error("Error saving to DB:", dbErr.message);
          }
        }
      })
      .on("end", () => {
        fs.unlinkSync(cleanedPath);
        resolve(results);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};




const getAppleImpressionData = () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../downloads/impression.csv");

    if (!fs.existsSync(filePath)) {
      return reject(new Error("CSV file not found"));
    }

    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    const headerIndex = lines.findIndex(line => line.startsWith("Date,"));
    if (headerIndex === -1) {
      return reject(new Error("Header row not found in CSV"));
    }

    const cleanedLines = lines.slice(headerIndex).join("\n");
    const cleanedPath = path.join(__dirname, "../downloads/cleaned_impression.csv");
    fs.writeFileSync(cleanedPath, cleanedLines);

    const results = [];

    fs.createReadStream(cleanedPath)
      .pipe(csv())
      .on("data", (data) => {
        const date = data["Date"];
        const impressions = data["Impressions"];

        if (date && impressions) {
          results.push({
            date: new Date(date.trim()),
            impressions: parseFloat(impressions),
          });
        }
      })
      .on("end", async () => {
        try {
          fs.unlinkSync(cleanedPath);

          // Clear old records (optional)
          await Impression.deleteMany({});

          // Insert new records
          await Impression.insertMany(results);

          resolve(results);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};




const getAppleDownloadData = () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../downloads/total_downloads.csv");

    if (!fs.existsSync(filePath)) {
      return reject(new Error("CSV file not found"));
    }

    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    const headerIndex = lines.findIndex(line => line.startsWith("Date,"));
    if (headerIndex === -1) {
      return reject(new Error("Header row not found in CSV"));
    }

    const cleanedLines = lines.slice(headerIndex).join("\n");
    const cleanedPath = path.join(__dirname, "../downloads/cleaned_downloads.csv");
    fs.writeFileSync(cleanedPath, cleanedLines);

    const results = [];

    fs.createReadStream(cleanedPath)
      .pipe(csv())
      .on("data", (data) => {
        const date = data["Date"];
        const downloads = data["Total Downloads"];

        if (date && downloads) {
          results.push({
            date: new Date(date.trim()),
            downloads: parseFloat(downloads),
          });
        }
      })
      .on("end", async () => {
        try {
          fs.unlinkSync(cleanedPath);

          // Clear old records (optional)
          await Download.deleteMany({});

          // Insert new records
          await Download.insertMany(results);

          resolve(results);
        } catch (err) {
          reject(err);
        }
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

module.exports = { getAppleAnalyticsData,getAppleImpressionData,getAppleDownloadData };
