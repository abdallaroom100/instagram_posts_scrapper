// // import puppeteer from "puppeteer";
// // import fs from "fs";
// // import fetch from "node-fetch";

// // const config = {
// //   username: "abdallarroom13",
// //   password: "Az01027101373@#",
// //   targetUser: "nannis_cakes",
// //   host: "https://www.instagram.com",
// //   postsLimit: 9,
// // };

// // const COOKIES_FILE = "cookies.json";

// // async function loginAndGetCookies() {
// //   console.log("🔐 Logging into Instagram...");

// //   const browser = await chromium.launch({
// //     headless: true,
// //     args: [
// //       "--no-sandbox",
// //       "--disable-setuid-sandbox",
// //       "--disable-blink-features=AutomationControlled",
// //       "--disable-dev-shm-usage",
// //       "--window-size=1366,768",
// //     ],
// //   });

// //   const page = await browser.newPage();

// //   // 🧠 خبي خاصية webdriver عشان ما يكتشفوش الـ bot
// //   await page.evaluateOnNewDocument(() => {
// //     Object.defineProperty(navigator, "webdriver", { get: () => false });
// //   });

// //   await page.setUserAgent(
// //     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
// //       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
// //   );

// //   console.log("🌍 Opening Instagram login...");
// //   await page.goto(`${config.host}/accounts/login/`, {
// //     waitUntil: "networkidle2",
// //     timeout: 60000,
// //   });

// //   await page.waitForSelector('input[name="username"]', { timeout: 60000 });

// //   console.log("⌨️ Typing credentials...");
// //   await page.type('input[name="username"]', config.username, { delay: 20 });
// //   await page.type('input[name="password"]', config.password, { delay: 20 });

// //   await Promise.all([
// //     page.click('button[type="submit"]'),
// //     page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
// //   ]);

// //   const currentUrl = page.url();
// //   console.log("📍 Current URL:", currentUrl);

// //   // ✅ تأكد إنه مش في صفحة challenge
// //   if (currentUrl.includes("/challenge/")) {
// //     throw new Error("Instagram triggered a login challenge. Please login manually once.");
// //   }

// //   const cookies = await page.cookies();
// //   await fs.promises.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));

// //   console.log("🍪 Cookies saved!");
// //   await browser.close();

// //   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// // }

// // async function loadCookies() {
// //   if (!fs.existsSync(COOKIES_FILE)) return null;
// //   const cookies = JSON.parse(await fs.promises.readFile(COOKIES_FILE, "utf8"));
// //   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// // }

// // async function fetchInstagramAPI(endpoint, cookies) {
// //   const headers = {
// //     "User-Agent":
// //       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
// //     "Accept": "*/*",
// //     "X-IG-App-ID": "936619743392459",
// //     "Cookie": cookies,
// //   };

// //   const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
// //   const text = await res.text();

// //   if (!res.ok) {
// //     throw new Error(`Failed: ${res.status} - ${text}`);
// //   }

// //   return JSON.parse(text);
// // }

// // async function scrapeInstagram() {
// //   try {
// //     let cookies = await loadCookies();
// //     if (!cookies) cookies = await loginAndGetCookies();

// //     console.log(`📊 Fetching profile for ${config.targetUser}...`);
// //     const { data } = await fetchInstagramAPI(
// //       `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
// //       cookies
// //     );

// //     const user = data.user;
// //     if (!user) throw new Error("Could not extract profile data!");

// //     console.log(`📸 Fetching posts for ${user.username}...`);
// //     const { items } = await fetchInstagramAPI(
// //       `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
// //       cookies
// //     );

// //     const posts = items.map((post) => ({
// //       id: post.id,
// //       image: post.image_versions2?.candidates?.[0]?.url || "",
// //       caption: post.caption?.text || "",
// //       likes: post.like_count || 0,
// //       comments: post.comment_count || 0,
// //     }));

// //     const result = { profile: user, posts };
// //     fs.writeFileSync(`${config.targetUser}_data.json`, JSON.stringify(result, null, 2));

// //     console.log(`💾 Data saved to ${config.targetUser}_data.json`);
// //   } catch (err) {
// //     console.error("❌ Error:", err.message);
// //     console.error("💡 Tip: If you get blocked, delete cookies.json and re-login.");
// //   }
// // }

// // scrapeInstagram();
// // scrape_ephemeral_fixed.js
// import { chromium } from "playwright";
// import fetch from "node-fetch";

// const config = {
//   username: "abdallarroom13",
//   password: "Az01027101373@#",
//   targetUser: "nannis_cakes",
//   host: "https://www.instagram.com",
//   postsLimit: 9,
// };

// const USER_AGENT =
//   "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

// async function loginAndGetCookiesHeader() {
//   console.log("🔐 Logging into Instagram (ephemeral cookies)...");

//   const browser = await chromium.launch({
//     headless: false,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-blink-features=AutomationControlled",
//       "--disable-dev-shm-usage",
//       "--window-size=1366,768",
//     ],
//   });

//   // حط الـ userAgent على الـ context مباشرة
//   const context = await browser.newContext({
//     userAgent: USER_AGENT,
//     viewport: { width: 1366, height: 768 },
//   });

//   // stealth: hide webdriver before any page script runs
//   await context.addInitScript(() => {
//     try {
//       Object.defineProperty(navigator, "webdriver", { get: () => false });
//     } catch (e) {}
//   });

//   const page = await context.newPage();

//   await page.goto(`${config.host}/accounts/login/`, {
//     waitUntil: "networkidle",
//     timeout: 60000,
//   });

//   await page.waitForSelector('input[name="username"]', { timeout: 60000 });

//   console.log("⌨️ Typing credentials...");
//   await page.fill('input[name="username"]', config.username);
//   await page.fill('input[name="password"]', config.password);

//   await Promise.all([
//     page.click('button[type="submit"]'),
//     page.waitForNavigation({ waitUntil: "networkidle", timeout: 60000 }),
//   ]);

//   const currentUrl = page.url();
//   console.log("📍 Current URL:", currentUrl);

//   if (currentUrl.includes("/challenge/")) {
//     await browser.close();
//     throw new Error("Instagram triggered a login challenge. Please login manually once.");
//   }

//   const cookies = await context.cookies();
//   const cookiesHeader = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

//   console.log("🍪 Cookies retrieved (ephemeral).");
//   await browser.close();
//   return cookiesHeader;
// }

// async function fetchInstagramAPI(endpoint, cookiesHeader) {
//   const headers = {
//     "User-Agent": USER_AGENT,
//     Accept: "*/*",
//     "X-IG-App-ID": "936619743392459",
//     Cookie: cookiesHeader,
//   };

//   const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(`Failed: ${res.status} - ${text}`);
//   }

//   try {
//     return JSON.parse(text);
//   } catch (e) {
//     throw new Error("Failed to parse JSON from Instagram response.");
//   }
// }

// async function scrapeInstagramEphemeral() {
//   try {
//     const cookiesHeader = await loginAndGetCookiesHeader();

//     console.log(`📊 Fetching profile for ${config.targetUser}...`);
//     const profileResp = await fetchInstagramAPI(
//       `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
//       cookiesHeader
//     );

//     const user = profileResp.data?.user;
//     if (!user) throw new Error("Could not extract profile data!");

//     console.log(`📸 Fetching posts for ${user.username}...`);
//     const feedResp = await fetchInstagramAPI(
//       `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
//       cookiesHeader
//     );

//     const items = feedResp.items || [];
//     const posts = items.map((post) => ({
//       id: post.id,
//       image: post.image_versions2?.candidates?.[0]?.url || "",
//       caption: post.caption?.text || "",
//       likes: post.like_count || 0,
//       comments: post.comment_count || 0,
//     }));

//     const result = { profile: user, posts };
//     console.log("✅ Result:", JSON.stringify(result, null, 2));
//     return result;
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// }

// scrapeInstagramEphemeral();
import { chromium } from "playwright";
import fetch from "node-fetch";
import fs from "fs";

// ===== الإعدادات الأساسية =====
const INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/";
const TARGET_USER = "nannis_cakes";
const YOUR_USERNAME = "abdallarroom13";
const YOUR_PASSWORD = "Az01027101373@#";
const COOKIES_FILE = "cookies.json";

// ===== تسجيل الدخول وجلب الكوكيز =====
async function loginAndGetCookies() {
  // 🧹 احذف أي كوكيز قديمة
  if (fs.existsSync(COOKIES_FILE)) {
    fs.unlinkSync(COOKIES_FILE);
    console.log("🧹 Deleted old cookies.json");
  }

  console.log("🚀 Launching Playwright browser...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(INSTAGRAM_LOGIN_URL, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // ✏️ إدخال بيانات تسجيل الدخول
  await page.waitForSelector('input[name="username"]', { timeout: 30000 });
  await page.fill('input[name="username"]', YOUR_USERNAME);
  await page.fill('input[name="password"]', YOUR_PASSWORD);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
  ]);

  // ✅ الحصول على الكوكيز بعد تسجيل الدخول
  const cookies = await context.cookies();
  await browser.close();

  fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log("✅ Logged in and got fresh cookies.");

  const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  return cookieString;
}

// ===== جلب بيانات البروفايل =====
async function getInstagramProfile(username, cookies) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "Cookie": cookies,
  };

  const res = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    { headers }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  return json.data.user;
}

// ===== جلب البوستات =====
async function getUserPosts(userId, cookies, count = 12) {
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "Cookie": cookies,
  };

  const res = await fetch(
    `https://i.instagram.com/api/v1/feed/user/${userId}/?count=${count}`,
    { headers }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`HTTP ${res.status} for posts: ${errorText}`);
  }

  const json = await res.json();
  return json.items || [];
}

// ===== التشغيل الأساسي =====
(async () => {
  try {
    console.log("🔐 Logging into Instagram with Playwright...");
    const cookies = await loginAndGetCookies();

    console.log("\n📊 Fetching profile data...");
    const user = await getInstagramProfile(TARGET_USER, cookies);

    const profileData = {
      username: user.username,
      name: user.full_name,
      bio: user.biography,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts_count: user.edge_owner_to_timeline_media.count,
      is_private: user.is_private,
      profile_pic: user.profile_pic_url,
      user_id: user.id,
    };

    console.log("✅ Profile fetched successfully.");

    console.log("\n🖼️ Fetching latest posts...");
    const postsRaw = await getUserPosts(user.id, cookies, 12);

    const posts = postsRaw.map((post) => {
      const shortcode = post.shortcode || post.code || "undefined";
      return {
        caption:
          post.edge_media_to_caption?.edges[0]?.node.text ||
          post.caption?.text ||
          "",
        image:
          post.display_url ||
          post.image_versions2?.candidates?.[0]?.url ||
          post.video_url ||
          "",
        likes: post.edge_liked_by?.count || post.like_count || 0,
        comments: post.edge_media_to_comment?.count || post.comment_count || 0,
        url: `https://www.instagram.com/p/${shortcode}/`,
        type: post.is_video ? "video" : "image",
      };
    });

    const fullData = { profile: profileData, posts };
    fs.writeFileSync(
      `${TARGET_USER}_data.json`,
      JSON.stringify(fullData, null, 2)
    );

    console.log(`💾 Data saved to ${TARGET_USER}_data.json`);
  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("💡 Tip: امسح cookies.json وشغّل تاني لو حصل Block أو Timeout.");
  }
})();
