// import puppeteer from "puppeteer";
// import fetch from "node-fetch";
// import fs from "fs";

// /**
//  * Launches a Puppeteer browser, navigates to a webpage, and then closes the browser.
//  *
//  * Launch Options:
//  * - headless: Run the browser in headless mode (no GUI).
//  * - args:
//  *   - "--no-sandbox": Required if running as the root user.
//  *   - "--disable-setuid-sandbox": Optional, try if you encounter sandbox errors.
//  */
// const INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/";
// const TARGET_USER = "nannis_cakes";
// const YOUR_USERNAME = "abdallarroom13";
// const YOUR_PASSWORD = "Az01027101373@#";

// const COOKIES_FILE = "cookies.json";
// const loginAndGetCookies = async () => {
//   try {
//     // Launch a Puppeteer browser instance with custom arguments
//     const browser = await puppeteer.launch({
//       headless: true,
//       args: [
//         "--no-sandbox",
//         "--disable-setuid-sandbox",
//       ],
//     });

//     // Open a new page in the browser
//     const page = await browser.newPage();


// // ✅ استخدم domcontentloaded بدل networkidle2
// await page.goto(INSTAGRAM_LOGIN_URL, {
//   waitUntil: "domcontentloaded",
//   timeout: 60000,
// });

// // ✅ انتظر ظهور الـ input عشان تتأكد إن الصفحة اتحملت
// await page.waitForSelector('input[name="username"]', { timeout: 30000 });

// // ✅ اكتب بيانات الدخول
// await page.type('input[name="username"]', YOUR_USERNAME, { delay: 80 });
// await page.type('input[name="password"]', YOUR_PASSWORD, { delay: 80 });

// // ✅ دوس تسجيل الدخول
// await Promise.all([
//   page.click('button[type="submit"]'),
//   page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
// ]);

// // ✅ بعد ما يسجل الدخول، خُد الكوكيز
// const cookies = await page.cookies();
// await browser.close();

// const cookieString = cookies.map(c => `${c.name}=${c.value}`).join("; ");
// console.log("✅ Cookies obtained:", cookieString.substring(0, 150) + "...");


// return cookieString;

//     // Close the browser
//     console.log("Browser closed successfully.");
//   } catch (error) {
//     console.error("An error occurred:", error);
//   }
// };
// async function loadCookies() {
//   if (fs.existsSync(COOKIES_FILE)) {
//     console.log("🍪 Loading cookies from file...");
//     const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
//     return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
//   }
//   return null;
// }

// async function getInstagramProfile(username, cookies) {
//   const headers = {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
//     "Accept": "*/*",
//     "X-IG-App-ID": "936619743392459",
//     "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
//     "Cookie": cookies,
//   };

//   const res = await fetch(
//     `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
//     { headers }
//   );

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error(`HTTP ${res.status}: ${errorText}`);
//   }

//   const json = await res.json();
//   return json.data.user;
// }


// async function getUserPosts(userId, cookies, count = 12) {
//   const headers = {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
//     "Accept": "*/*",
//     "X-IG-App-ID": "936619743392459",
//     "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
//     "Cookie": cookies,
//   };

//   const res = await fetch(
//     `https://i.instagram.com/api/v1/feed/user/${userId}/?count=${count}`,
//     { headers }
//   );

//   if (!res.ok) {
//     const errorText = await res.text();
//     throw new Error(`HTTP ${res.status} for posts: ${errorText}`);
//   }

//   const json = await res.json();
//   return json.items || [];
// }


// (async () => {
//   try {
//     let cookies = await loadCookies();
//     if (!cookies) {
//       cookies = await loginAndGetCookies();
//     }

//     console.log("\n📊 Fetching profile data...");
//     const user = await getInstagramProfile(TARGET_USER, cookies);

//     const profileData = {
//       username: user.username,
//       name: user.full_name,
//       bio: user.biography,
//       followers: user.edge_followed_by.count,
//       following: user.edge_follow.count,
//       posts_count: user.edge_owner_to_timeline_media.count,
//       is_private: user.is_private,
//       profile_pic: user.profile_pic_url,
//       user_id: user.id,
//     };

//     console.log("📊 Profile:", profileData);

//     console.log("\n🖼️ Fetching latest posts...");
//     const postsRaw = await getUserPosts(user.id, cookies, 12);

//     const posts = postsRaw.map((post) => {
//       const shortcode = post.shortcode || post.code || "undefined";
//       return {
//         caption:
//           post.edge_media_to_caption?.edges[0]?.node.text ||
//           post.caption?.text ||
//           "",
//         image:
//           post.display_url ||
//           post.image_versions2?.candidates?.[0]?.url ||
//           post.video_url ||
//           "",
//         likes: post.edge_liked_by?.count || post.like_count || 0,
//         comments: post.edge_media_to_comment?.count || post.comment_count || 0,
//         url: `https://www.instagram.com/p/${shortcode}/`,
//         type: post.is_video ? "video" : "image",
//       };
//     });

//     const fullData = { profile: profileData, posts };
//     fs.writeFileSync(
//       `${TARGET_USER}_data.json`,
//       JSON.stringify(fullData, null, 2)
//     );

//     console.log(`💾 Data saved to ${TARGET_USER}_data.json`);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//     console.error(
//       "💡 Tip: لو لسة ناقص مكتبات أو حصل block، جرّب تسجيل الدخول يدوي أو headless=false محليًا."
//     );
//   }
// })();
// // Execute the function







// import puppeteer from "puppeteer";
// import fs from "fs";

// const YOUR_USERNAME = "abdallarroom13";
// const YOUR_PASSWORD = "Az01027101373@#";

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: true, // عشان تشوف الصفحة
//   });

//   const page = await browser.newPage();
  
//   await page.goto("https://www.instagram.com/accounts/login/");
  
//   await page.waitForSelector('input[name="username"]');
//   await page.type('input[name="username"]', YOUR_USERNAME, { delay: 100 });
//   await page.type('input[name="password"]', YOUR_PASSWORD, { delay: 100 });
  
//   await Promise.all([
//     page.click('button[type="submit"]'),
//     page.waitForNavigation(),
//   ]);

//   // انتظر شوية عشان تتأكد إن الـ login تم  
//   await new Promise(resolve=>setTimeout(resolve, 5000))
// //   await page.waitForTimeout(5000);

//   // خد الكوكيز
//   const cookies = await page.cookies();
  
//   // احفظها في ملف
//   fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
  
//   console.log("✅ Cookies saved to cookies.json");
  
//   await browser.close();
// })();


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
