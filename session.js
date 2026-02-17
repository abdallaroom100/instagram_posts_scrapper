import puppeteer from "puppeteer";

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: false, // لو مفيش شاشة عندك، لازم xvfb يكون شغال
            args: [
                "--no-sandbox",             // ضروري جداً للينكس
                "--disable-setuid-sandbox"  // ضروري جداً للينكس
            ] 
        });

        const page = await browser.newPage();

        // 1. تصحيح الرابط بإضافة https
        // 2. زيادة وقت الانتظار (timeout) لأن النت عندك كان فيه مشاكل
        await page.goto("https://www.instagram.com", { 
            waitUntil: "networkidle2",
            timeout: 60000 
        });

        console.log("✅ Page opened successfully");

        // await browser.close(); // اقفل المتصفح لما تخلص

    } catch (e) {
        console.error("❌ Error:", e.message);
    }
})();
