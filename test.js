import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";

const config = {
  username: "abdallarroom13",
  password: "Az01027101373@#",
  targetUser: "nannis_cakes",
  host: "https://www.instagram.com",
  postsLimit: 9,
};

const COOKIES_FILE = "cookies.json";

async function loginAndGetCookies() {
  console.log("🔐 Logging into Instagram...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--window-size=1366,768",
    ],
  });

  const page = await browser.newPage();

  // 🧠 خبي خاصية webdriver عشان ما يكتشفوش الـ bot
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
  );

  console.log("🌍 Opening Instagram login...");
  await page.goto(`${config.host}/accounts/login/`, {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  await page.waitForSelector('input[name="username"]', { timeout: 60000 });

  console.log("⌨️ Typing credentials...");
  await page.type('input[name="username"]', config.username, { delay: 20 });
  await page.type('input[name="password"]', config.password, { delay: 20 });

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
  ]);

  const currentUrl = page.url();
  console.log("📍 Current URL:", currentUrl);

  // ✅ تأكد إنه مش في صفحة challenge
  if (currentUrl.includes("/challenge/")) {
    throw new Error("Instagram triggered a login challenge. Please login manually once.");
  }

  const cookies = await page.cookies();
  await fs.promises.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));

  console.log("🍪 Cookies saved!");
  await browser.close();

  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

async function loadCookies() {
  if (!fs.existsSync(COOKIES_FILE)) return null;
  const cookies = JSON.parse(await fs.promises.readFile(COOKIES_FILE, "utf8"));
  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

async function fetchInstagramAPI(endpoint, cookies) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "Cookie": cookies,
  };

  const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed: ${res.status} - ${text}`);
  }

  return JSON.parse(text);
}

async function scrapeInstagram() {
  try {
    let cookies = await loadCookies();
    if (!cookies) cookies = await loginAndGetCookies();

    console.log(`📊 Fetching profile for ${config.targetUser}...`);
    const { data } = await fetchInstagramAPI(
      `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
      cookies
    );

    const user = data.user;
    if (!user) throw new Error("Could not extract profile data!");

    console.log(`📸 Fetching posts for ${user.username}...`);
    const { items } = await fetchInstagramAPI(
      `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
      cookies
    );

    const posts = items.map((post) => ({
      id: post.id,
      image: post.image_versions2?.candidates?.[0]?.url || "",
      caption: post.caption?.text || "",
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
    }));

    const result = { profile: user, posts };
    fs.writeFileSync(`${config.targetUser}_data.json`, JSON.stringify(result, null, 2));

    console.log(`💾 Data saved to ${config.targetUser}_data.json`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("💡 Tip: If you get blocked, delete cookies.json and re-login.");
  }
}

scrapeInstagram();
