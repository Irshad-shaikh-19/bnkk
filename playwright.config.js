const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  use: {
    headless: true,  // ✅ Ensures it runs in headless mode
    executablePath: process.env.CHROME_BIN || undefined,  // Use system Chrome if available
  },
});
