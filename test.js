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
