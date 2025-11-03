import puppeteer from "puppeteer";

(async () => {
  try {
    console.log("🚀 Launching browser...");
    
    const browser = await puppeteer.launch({
    headless: true,
    dumpio: true, // ⬅️ ضيف السطر ده
    executablePath: '/usr/bin/chromium',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
    ],
  });

    const page = await browser.newPage();
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    
    console.log("🌐 Opening Instagram...");
    
    await page.goto('https://www.instagram.com/', { 
      waitUntil: 'networkidle2', 
      timeout: 120000 
    });
    
    console.log("✅ Instagram loaded!");
    
    // خد screenshot
    await page.screenshot({ path: 'instagram.png' });
    console.log("📸 Screenshot saved as instagram.png");
    
    await browser.close();
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Full error:", error);
  }
})();