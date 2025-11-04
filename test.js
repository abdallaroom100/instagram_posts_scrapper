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

const INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/";
const TARGET_USER = "nannis_cakes";
const YOUR_USERNAME = "abdallarroom13";
const YOUR_PASSWORD = "Az01027101373@#";
const COOKIES_FILE = "cookies.json";

// helpers
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
function randomSleep(min = 2000, max = 6000) {
  const ms = Math.floor(min + Math.random() * (max - min));
  return sleep(ms);
}

async function fetchWithRetries(url, options = {}, tries = 3) {
  for (let attempt = 1; attempt <= tries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok) return res;
      // For 401/429 retry with backoff
      if ([401, 429, 500, 502, 503, 504].includes(res.status) && attempt < tries) {
        const wait = 2000 * attempt + Math.random() * 2000;
        console.warn(`⚠️ Fetch ${url} returned ${res.status}. Retrying in ${Math.round(wait)}ms (attempt ${attempt}/${tries})`);
        await sleep(wait);
        continue;
      }
      return res;
    } catch (e) {
      if (attempt < tries) {
        const wait = 1000 * attempt + Math.random() * 1000;
        console.warn(`⚠️ Fetch error: ${e.message}. Retrying in ${Math.round(wait)}ms (attempt ${attempt}/${tries})`);
        await sleep(wait);
        continue;
      }
      throw e;
    }
  }
  throw new Error("fetchWithRetries: unexpected flow");
}

async function loginAndGetCookies() {
  // remove old cookies so every run logs in fresh
  if (fs.existsSync(COOKIES_FILE)) {
    try {
      fs.unlinkSync(COOKIES_FILE);
      console.log("🧹 Deleted old cookies.json");
    } catch {}
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

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
  });

  const page = await context.newPage();

  console.log("🌐 Opening Instagram login page...");
  await page.goto(INSTAGRAM_LOGIN_URL, { waitUntil: "domcontentloaded", timeout: 90000 });

  // try to close cookie/privacy banners if present
  try {
    // multiple textual possibilities
    const cookieSelectors = [
      'text=Allow all',
      'text=Allow all cookies',
      'text=Accept all',
      'text=Accept',
      'text=Allow essential cookies',
      'text=Only essential',
    ];
    for (const s of cookieSelectors) {
      const locator = page.locator(s);
      if (await locator.isVisible({ timeout: 1500 }).catch(() => false)) {
        await locator.click().catch(() => null);
        console.log(`🍪 Clicked cookie button: ${s}`);
        await sleep(500);
        break;
      }
    }
  } catch (e) {}

  console.log("⏳ Waiting for login form...");
  await page.waitForSelector('input[name="username"]', { timeout: 30000 });

  // fill credentials
  await page.fill('input[name="username"]', YOUR_USERNAME);
  await randomSleep(300, 900);
  await page.fill('input[name="password"]', YOUR_PASSWORD);
  await randomSleep(300, 900);

  // ensure button visible and try click with retries and force
  const loginButton = page.locator('button[type="submit"]');
  await loginButton.scrollIntoViewIfNeeded();

  let clicked = false;
  for (let i = 0; i < 4 && !clicked; i++) {
    try {
      await Promise.all([
        // use force:true because overlays sometimes intercept
        loginButton.click({ force: true }),
        page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 90000 }),
      ]);
      clicked = true;
    } catch (e) {
      console.warn(`⚠️ login click attempt ${i + 1} failed: ${e.message}`);
      await randomSleep(1000, 3000);
      // try to close any new popups that may appear
      try {
        // some overlays can be closed by pressing Escape
        await page.keyboard.press("Escape").catch(() => null);
      } catch {}
    }
  }
  if (!clicked) {
    await browser.close();
    throw new Error("Failed to click login button after retries");
  }

  // wait a bit to stabilize session
  console.log("⏳ Waiting a bit for session to stabilize...");
  await sleep(5000);

  // Visit home and your profile to make the session look real
  try {
    console.log("🏠 Visiting Instagram home...");
    await page.goto("https://www.instagram.com/", { waitUntil: "networkidle", timeout: 60000 });
    await randomSleep(3000, 6000);

    console.log("👤 Visiting your profile to stabilize session...");
    await page.goto(`https://www.instagram.com/${YOUR_USERNAME}/`, { waitUntil: "networkidle", timeout: 60000 });
    await randomSleep(3000, 7000);
  } catch (e) {
    console.warn("⚠️ Warning while stabilizing session:", e.message);
  }

  // final wait & collect cookies
  await sleep(2000);
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  await browser.close();

  // build cookie string
  const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  console.log("✅ Logged in and saved fresh cookies.");
  return { cookieString, cookies };
}

async function getInstagramProfile(username, cookieString) {
  const csrftoken = (cookieString.match(/csrftoken=([^;]+)/) || [])[1] || "";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Referer: `https://www.instagram.com/${YOUR_USERNAME}/`,
    Accept: "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrftoken,
    Cookie: cookieString,
  };

  const url = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`;
  const res = await fetchWithRetries(url, { headers }, 3);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  return json.data.user;
}

async function getUserPosts(userId, cookieString, count = 12) {
  const csrftoken = (cookieString.match(/csrftoken=([^;]+)/) || [])[1] || "";
  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    Referer: `https://www.instagram.com/${YOUR_USERNAME}/`,
    Accept: "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrftoken,
    Cookie: cookieString,
  };

  const url = `https://i.instagram.com/api/v1/feed/user/${userId}/?count=${count}`;
  const res = await fetchWithRetries(url, { headers }, 3);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for posts: ${text}`);
  }
  const json = await res.json();
  return json.items || [];
}

// main
(async () => {
  try {
    // always login fresh
    const { cookieString } = await loginAndGetCookies();

    // small pause just in case
    await randomSleep(2000, 5000);

    console.log("\n📊 Fetching profile data...");
    const user = await getInstagramProfile(TARGET_USER, cookieString);

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

    // wait a bit before posts
    await randomSleep(3000, 8000);

    console.log("\n🖼️ Fetching latest posts...");
    const postsRaw = await getUserPosts(user.id, cookieString, 12);

    const posts = postsRaw.map((post) => {
      const shortcode = post.shortcode || post.code || "undefined";
      return {
        caption:
          post.edge_media_to_caption?.edges?.[0]?.node?.text ||
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
    fs.writeFileSync(`${TARGET_USER}_data.json`, JSON.stringify(fullData, null, 2));
    console.log(`💾 Data saved to ${TARGET_USER}_data.json`);

  } catch (err) {
    console.error("❌ Error:", err.message);
    console.error("💡 Tip: لو استمرت مشكلة 401 فجرب: 1) تشغيل محلي مرة (مش VPS)، 2) استخدام proxy ريزيدنشيال، 3) زوّد الانتظار بعد login (30s+).");
  }
})();
