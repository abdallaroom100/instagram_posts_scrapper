import puppeteer from "puppeteer";


/**
 * Launches a Puppeteer browser, navigates to a webpage, and then closes the browser.
 *
 * Launch Options:
 * - headless: Run the browser in headless mode (no GUI).
 * - args:
 *   - "--no-sandbox": Required if running as the root user.
 *   - "--disable-setuid-sandbox": Optional, try if you encounter sandbox errors.
 */

const runPuppeteer = async () => {
  try {
    // Launch a Puppeteer browser instance with custom arguments
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    // Open a new page in the browser
    const page = await browser.newPage();

    // Navigate to the specified URL
    await page.goto("https://instagram.com");

    console.log("Navigation to instagram completed.");

    // Close the browser
    await browser.close();
    console.log("Browser closed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};

// Execute the function
runPuppeteer();