// import puppeteer from "puppeteer";
// import fs from "fs";
// import fetch from "node-fetch";

// const config = {
//   username: "abdallarroom13",
//   password: "Az01027101373@#",
//   targetUser: "nannis_cakes",
//   host: "https://www.instagram.com",
//   postsLimit: 9,
// };

// const COOKIES_FILE = "cookies.json";

// async function loginAndGetCookies() {
//   console.log("🔐 Logging into Instagram...");

//   const browser = await chromium.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-blink-features=AutomationControlled",
//       "--disable-dev-shm-usage",
//       "--window-size=1366,768",
//     ],
//   });

//   const page = await browser.newPage();

//   // 🧠 خبي خاصية webdriver عشان ما يكتشفوش الـ bot
//   await page.evaluateOnNewDocument(() => {
//     Object.defineProperty(navigator, "webdriver", { get: () => false });
//   });

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
//       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//   );

//   console.log("🌍 Opening Instagram login...");
//   await page.goto(`${config.host}/accounts/login/`, {
//     waitUntil: "networkidle2",
//     timeout: 60000,
//   });

//   await page.waitForSelector('input[name="username"]', { timeout: 60000 });

//   console.log("⌨️ Typing credentials...");
//   await page.type('input[name="username"]', config.username, { delay: 20 });
//   await page.type('input[name="password"]', config.password, { delay: 20 });

//   await Promise.all([
//     page.click('button[type="submit"]'),
//     page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
//   ]);

//   const currentUrl = page.url();
//   console.log("📍 Current URL:", currentUrl);

//   // ✅ تأكد إنه مش في صفحة challenge
//   if (currentUrl.includes("/challenge/")) {
//     throw new Error("Instagram triggered a login challenge. Please login manually once.");
//   }

//   const cookies = await page.cookies();
//   await fs.promises.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));

//   console.log("🍪 Cookies saved!");
//   await browser.close();

//   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// }

// async function loadCookies() {
//   if (!fs.existsSync(COOKIES_FILE)) return null;
//   const cookies = JSON.parse(await fs.promises.readFile(COOKIES_FILE, "utf8"));
//   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// }

// async function fetchInstagramAPI(endpoint, cookies) {
//   const headers = {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     "Accept": "*/*",
//     "X-IG-App-ID": "936619743392459",
//     "Cookie": cookies,
//   };

//   const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(`Failed: ${res.status} - ${text}`);
//   }

//   return JSON.parse(text);
// }

// async function scrapeInstagram() {
//   try {
//     let cookies = await loadCookies();
//     if (!cookies) cookies = await loginAndGetCookies();

//     console.log(`📊 Fetching profile for ${config.targetUser}...`);
//     const { data } = await fetchInstagramAPI(
//       `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
//       cookies
//     );

//     const user = data.user;
//     if (!user) throw new Error("Could not extract profile data!");

//     console.log(`📸 Fetching posts for ${user.username}...`);
//     const { items } = await fetchInstagramAPI(
//       `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
//       cookies
//     );

//     const posts = items.map((post) => ({
//       id: post.id,
//       image: post.image_versions2?.candidates?.[0]?.url || "",
//       caption: post.caption?.text || "",
//       likes: post.like_count || 0,
//       comments: post.comment_count || 0,
//     }));

//     const result = { profile: user, posts };
//     fs.writeFileSync(`${config.targetUser}_data.json`, JSON.stringify(result, null, 2));

//     console.log(`💾 Data saved to ${config.targetUser}_data.json`);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//     console.error("💡 Tip: If you get blocked, delete cookies.json and re-login.");
//   }
// }

// scrapeInstagram();
// scrape_ephemeral_fixed.js
import { chromium } from "playwright";
import fetch from "node-fetch";

const config = {
  username: "abdallarroom13",
  password: "Az01027101373@#",
  targetUser: "nannis_cakes",
  host: "https://www.instagram.com",
  postsLimit: 9,
};

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

async function loginAndGetCookiesHeader() {
  console.log("🔐 Logging into Instagram (ephemeral cookies)...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--window-size=1366,768",
    ],
  });

  // حط الـ userAgent على الـ context مباشرة
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1366, height: 768 },
  });

  // stealth: hide webdriver before any page script runs
  await context.addInitScript(() => {
    try {
      Object.defineProperty(navigator, "webdriver", { get: () => false });
    } catch (e) {}
  });

  const page = await context.newPage();

  await page.goto(`${config.host}/accounts/login/`, {
    waitUntil: "networkidle",
    timeout: 60000,
  });

  await page.waitForSelector('input[name="username"]', { timeout: 60000 });

  console.log("⌨️ Typing credentials...");
  await page.fill('input[name="username"]', config.username);
  await page.fill('input[name="password"]', config.password);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }),
  ]);

  const currentUrl = page.url();
  console.log("📍 Current URL:", currentUrl);

  if (currentUrl.includes("/challenge/")) {
    await browser.close();
    throw new Error("Instagram triggered a login challenge. Please login manually once.");
  }

  const cookies = await context.cookies();
  const cookiesHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  console.log("🍪 Cookies retrieved (ephemeral).");
  await browser.close();
  return cookiesHeader;
}

async function fetchInstagramAPI(endpoint, cookiesHeader) {
  const headers = {
    "User-Agent": USER_AGENT,
    Accept: "*/*",
    "X-IG-App-ID": "936619743392459",
    Cookie: cookiesHeader,
  };

  const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
  const text = await res.text();

  if (!res.ok) {
    throw new Error(`Failed: ${res.status} - ${text}`);
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error("Failed to parse JSON from Instagram response.");
  }
}

async function scrapeInstagramEphemeral() {
  try {
    const cookiesHeader = await loginAndGetCookiesHeader();

    console.log(`📊 Fetching profile for ${config.targetUser}...`);
    const profileResp = await fetchInstagramAPI(
      `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
      cookiesHeader
    );

    const user = profileResp.data?.user;
    if (!user) throw new Error("Could not extract profile data!");

    console.log(`📸 Fetching posts for ${user.username}...`);
    const feedResp = await fetchInstagramAPI(
      `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
      cookiesHeader
    );

    const items = feedResp.items || [];
    const posts = items.map((post) => ({
      id: post.id,
      image: post.image_versions2?.candidates?.[0]?.url || "",
      caption: post.caption?.text || "",
      likes: post.like_count || 0,
      comments: post.comment_count || 0,
    }));

    const result = { profile: user, posts };
    console.log("✅ Result:", JSON.stringify(result, null, 2));
    return result;
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

scrapeInstagramEphemeral();
