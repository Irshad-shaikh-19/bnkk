const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const DOWNLOADS_DIR = path.join(__dirname, "../downloads");
const SESSION_FILE = path.join(__dirname, "../session/apple_auth.json");

if (!fs.existsSync(DOWNLOADS_DIR)) {
  fs.mkdirSync(DOWNLOADS_DIR);
}

async function downloadAppleAnalytics() {
  console.log("🚀 Starting Apple Analytics Automation...");

  const browser = await chromium.launch({
    headless: true,  // ✅ FIXED: Changed to `true` to avoid X server issues
    args: [
      "--disable-blink-features=AutomationControlled",
      "--no-sandbox",  // ✅ FIXED: Disable sandbox for cloud environments
      "--disable-setuid-sandbox",
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
    await page.waitForTimeout(3000);
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
  





    console.log("🔹 Opening date range dropdown...");

    
    const dateRangeButton = await page.locator('button:has-text("-")').first();
    await dateRangeButton.waitFor({ state: 'visible', timeout: 10000 });
    await dateRangeButton.click();
    
  
    console.log("🔹 Selecting 'Lifetime'...");
    await page.waitForSelector('text=Lifetime', { timeout: 10000 });
    await page.click('text=Lifetime');
    
   
    console.log("⏳ Waiting for data to reload after selecting Lifetime...");
    await page.waitForTimeout(35000);
    
    
    console.log("🔹 Opening Export menu...");
    const exportMenuButton = await page.locator('button:has(svg path[d*="M8.99442777"])').first();
await exportMenuButton.waitFor({ state: 'visible', timeout: 15000 });
await exportMenuButton.click();
    
   
    console.log("🔹 Clicking 'Export as CSV'...");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page.click('text=Export as CSV'),
    ]);
    
    const filePath = await download.path();
    if (!filePath) {
      console.error("❌ Download path is undefined! Exiting...");
      await browser.close();
      return;
    }
  
    // ✅ Ensure download directory exists
    if (!fs.existsSync(DOWNLOADS_DIR)) {
      fs.mkdirSync(DOWNLOADS_DIR, { recursive: true });
    }
  
    const finalPath = path.join(DOWNLOADS_DIR, "analytics.csv");
  
    // ✅ Remove existing file before saving
    if (fs.existsSync(finalPath)) {
      fs.unlinkSync(finalPath);
      console.log("🗑 Old analytics.csv removed.");
    }
  
    // ✅ Save new CSV
    await download.saveAs(finalPath);
    console.log(`✅ CSV Downloaded: ${finalPath}`);
  
    await browser.close();
    return finalPath;
  
}

module.exports = { downloadAppleAnalytics };