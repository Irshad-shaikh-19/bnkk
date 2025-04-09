const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const DOWNLOADS_DIR = path.join(__dirname, "../downloads");
const SESSION_FILE = path.join(__dirname, "../session/apple_auth.json");

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

async function downloadAppleSessionAnalytics() {
  console.log("🚀 Starting Apple Analytics Automation...");

  const browser = await chromium.launch({
    headless: true,
    slowMo: 200,
    args: [
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--start-maximized"
    ],
});

  let context;

  if (fs.existsSync(SESSION_FILE)) {
    console.log("🔹 Using saved authentication session...");
    context = await browser.newContext({ storageState: SESSION_FILE });
  } else {
    console.log("🔹 No session found. Logging in fresh...");
    context = await browser.newContext();
  }

  const page = await context.newPage();

  console.log("🔹 Opening App Store Connect...");
  await page.goto("https://appstoreconnect.apple.com/analytics", { waitUntil: "load" });

  if (!fs.existsSync(SESSION_FILE)) {
    console.log("🔹 Waiting for login page to load...");
    await page.waitForTimeout(5000);

    console.log("🔹 Checking for Apple login iframe...");
    const iframeElement = await page.waitForSelector("iframe#aid-auth-widget-iFrame", { timeout: 30000 });

    if (!iframeElement) {
      console.error("❌ Login iframe not found! Exiting...");
      await browser.close();
      return;
    }

    console.log("✅ Found login iframe! Switching context...");
    const frame = await iframeElement.contentFrame();
    if (!frame) {
      console.error("❌ Unable to access iframe! Exiting...");
      await browser.close();
      return;
    }

    console.log("🔹 Typing email...");
    await frame.waitForSelector('input#account_name_text_field', { timeout: 20000 });
    await frame.type('input#account_name_text_field', process.env.APPLE_EMAIL, { delay: 100 });

    console.log("🔹 Clicking Continue...");
    const continueButton = await frame.waitForSelector("#sign-in", { timeout: 30000 }).catch(() => null);
    if (continueButton) {
      await continueButton.click();
    } else {
      console.error("❌ Continue button not found! Exiting...");
      await browser.close();
      return;
    }

    console.log("🔹 Waiting for password field...");
    await frame.waitForSelector('input#password_text_field', { timeout: 30000 });

    console.log("🔹 Typing password...");
    await frame.type('input#password_text_field', process.env.APPLE_PASSWORD, { delay: 100 });

    console.log("🔹 Clicking Sign In...");
    const signInButton = await frame.waitForSelector("#sign-in", { timeout: 30000 }).catch(() => null);
    if (signInButton) {
      await signInButton.click();
    } else {
      console.error("❌ Sign In button not found! Exiting...");
      await browser.close();
      return;
    }

    console.log("🔹 Waiting for CAPTCHA/MFA...");
    console.log("🚨 PLEASE ENTER OTP MANUALLY AND PRESS 'Trust' TO REMEMBER DEVICE 🚨");
    await page.waitForTimeout(60000); 

    console.log("✅ Saving session to avoid OTP next time...");
    await context.storageState({ path: SESSION_FILE });
  }








  console.log("🔹 Opening account dropdown...");
  try {
    // Wait for user-profile button and click it
    await page.waitForSelector('.user-profile', { timeout: 15000 });
    await page.click('.user-profile');
    console.log("✅ Account dropdown opened.");
  } catch (err) {
    console.error("❌ Failed to open account dropdown. Exiting...");
    return;
  }
  
  console.log("🔹 Waiting for provider list to appear...");
  try {
    await page.waitForSelector('#providers .provider-list li', { timeout: 20000 });
  
    const providerElements = await page.$$('#providers .provider-list li');
    console.log(`🔍 Found ${providerElements.length} providers. Checking for 'SwapGroup LTD'...`);
  
    let swapGroupProvider = null;
  
    for (const provider of providerElements) {
      const text = await provider.innerText();
      console.log("➡️ Provider Option:", text.trim());
      if (text.trim().includes("SwapGroup LTD")) {
        swapGroupProvider = provider;
        break;
      }
    }
  
    if (swapGroupProvider) {
      await Promise.all([
        page.waitForNavigation({ waitUntil: "domcontentloaded" }),
        swapGroupProvider.click()
      ]);
      console.log("✅ 'SwapGroup LTD' selected.");
      await page.waitForTimeout(5000); 
    } else {
      console.error("❌ 'SwapGroup LTD' not found in provider list! Exiting...");
      return;
    }
  
  } catch (err) {
    console.error("❌ Error during provider switch:", err.message);
    return;
  }
  







  console.log("🔹 Waiting for the analytics page to fully load...");
  await page.waitForTimeout(10000); 

 

  console.log("🔹 Scrolling down to ensure 'Freeze Debt' is visible...");
  await page.evaluate(() => window.scrollBy(0, 500));

  console.log("🔹 Searching for 'Freeze Debt' app...");
  let freezeDebtApp;
  for (let i = 0; i < 5; i++) {
    freezeDebtApp = await page.$('text="Freeze Debt"');
    if (freezeDebtApp) break;
    console.log(`🔄 Attempt ${i + 1}: 'Freeze Debt' not found. Retrying in 3 seconds...`);
    await page.waitForTimeout(4000);
    await page.evaluate(() => window.scrollBy(0, 500)); 
  }

  if (!freezeDebtApp) {
    console.error("❌ 'Freeze Debt' app not found! Exiting...");
    await browser.close();
    return;
  }

  console.log("✅ 'Freeze Debt' found! Clicking on it...");
  await freezeDebtApp.click();
  
 
  console.log("🔹 Waiting for app details page to load...");
  await page.waitForTimeout(5000); 
  await page.waitForLoadState("domcontentloaded");
  
 
  console.log("🔹 Searching for 'Metrics' tab...");
    const metricsTabSelector = 'a:has-text("Metrics")';
  
    await context.pages()[0].waitForSelector(metricsTabSelector, { state: "visible", timeout: 30000 });
    const metricsTab = await context.pages()[0].$(metricsTabSelector);
  
    if (!metricsTab) {
      console.error("❌ Metrics tab not found! Exiting...");
      await browser.close();
      return;
    }
  
    console.log("✅ Metrics tab found! Navigating directly...");
    const metricsPageUrl = "https://appstoreconnect.apple.com/analytics/app/d30/1452264470/metrics";
    await context.pages()[0].goto(metricsPageUrl, { waitUntil: "domcontentloaded" });
  
    if (!context.pages()[0].url().includes('/metrics')) {
      console.error("❌ Failed to navigate to Metrics page!");
      await browser.close();
      return;
    }
  
    console.log("✅ Successfully navigated to Metrics page!");
  


    // 🔽 Select "Impressions" from the left-side metric dropdown
    console.log("🔹 Opening metric type dropdown (e.g., 'Product Page Views')...");

    // Find and click the metric dropdown (Product Page Views)
    const metricDropdown = await page.locator('button:has-text("Product Page Views")');
    await metricDropdown.waitFor({ state: "visible", timeout: 10000 });
    await metricDropdown.click();
    
    console.log("🔁 Switching to 'Sessions'...");


    // Select 'Downloads'
    console.log("🔹 Selecting 'Usage'...");
    await page.waitForSelector('text=Usage', { timeout: 10000 });
    await page.click('text=Usage');

    // Then select 'Total Downloads'
    console.log("🔹 Selecting 'Sessions'...");
    await page.waitForSelector('text=Sessions', { timeout: 10000 });
    await page.click('text=Sessions');

    // Wait for chart/data to reload
    console.log("⏳ Waiting for data to reload with Sessions...");
    await page.waitForTimeout(3000);



// Click the dropdown that shows the selected period (e.g., 'Months', 'Weeks', etc.)
console.log("🔹 Opening time range dropdown (e.g., Months)...");

await page.waitForSelector('button[class*="jijsjF"]', { timeout: 10000 });
await page.click('button[class*="jijsjF"]');

// Wait for the dropdown options to appear and click 'Days'
console.log("🔹 Selecting 'Days'...");
await page.waitForSelector('text=Days', { timeout: 5000 });
await page.click('text=Days');

// Wait for the data to reload
console.log("⏳ Waiting for daily data to load...");
await page.waitForTimeout(3000);




    // Open date range dropdown again
    console.log("🔹 Opening date range dropdown...");
    const dateRangeButton2 = await page.locator('button:has-text("Lifetime"), button:has-text("-")').first();
    await dateRangeButton2.waitFor({ state: 'visible', timeout: 10000 });
    await dateRangeButton2.click();

    console.log("🔹 Selecting 'Lifetime' again...");
    await page.waitForSelector('text=Lifetime', { timeout: 10000 });
    await page.click('text=Lifetime');

    console.log("⏳ Waiting for data to reload after selecting Lifetime...");
    await page.waitForTimeout(45000);

    console.log("🔹 Opening Export menu...");
    const exportMenuButton2 = await page.locator('button:has(svg path[d*="M8.99442777"])').first();
    await exportMenuButton2.waitFor({ state: 'visible', timeout: 35000 });
    await exportMenuButton2.click();

    console.log("🔹 Clicking 'Export as CSV' for Sessions...");
    const [download2] = await Promise.all([
      page.waitForEvent("download"),
      page.click('text=Export as CSV'),
    ]);

    const filePath2 = await download2.path();
    if (!filePath2) {
      console.error("❌ Download path is undefined for Sessions! Exiting...");
      return;
    }

    const sessionPath = path.join(DOWNLOADS_DIR, "sessions.csv");

    // Remove existing file before saving
    if (fs.existsSync(sessionPath)) {
      fs.unlinkSync(sessionPath);
      console.log("🗑 Old sessions.csv removed.");
    }

    await download2.saveAs(sessionPath);
    console.log(`✅ CSV Downloaded: ${sessionPath}`);

    await browser.close();
    return sessionPath;
  
}

module.exports = {  downloadAppleSessionAnalytics };