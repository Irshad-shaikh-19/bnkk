const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

const getAppleAnalyticsData = () => {
  return new Promise((resolve, reject) => {
    const filePath = path.join(__dirname, "../downloads/analytics.csv");

    if (!fs.existsSync(filePath)) {
      return reject(new Error("CSV file not found"));
    }

    const lines = fs.readFileSync(filePath, "utf-8").split("\n");
    const headerIndex = lines.findIndex(line => line.startsWith("Date,"));
    if (headerIndex === -1) {
      return reject(new Error("Header row not found in CSV"));
    }

    const cleanedLines = lines.slice(headerIndex).join("\n");
    const cleanedPath = path.join(__dirname, "../downloads/cleaned.csv");
    fs.writeFileSync(cleanedPath, cleanedLines);

    const results = [];

    fs.createReadStream(cleanedPath)
      .pipe(csv())
      .on("data", (data) => {
        console.log("Row:", data); 

        const date = data["Date"];
        const views = data["Product Page Views"];

        if (date && views) {
          results.push({
            date: date.trim(),
            views: parseFloat(views),
          });
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

module.exports = { getAppleAnalyticsData };
