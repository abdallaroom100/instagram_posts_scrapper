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


import { chromium } from 'playwright';
import fetch from 'node-fetch';
import fs from 'fs';

// ⚙️ الإعدادات
const CONFIG = {
  USERNAME: "abdallarroom13",
  PASSWORD: "Az01027101373@#",
  TARGET_USER: "nannis_cakes",
  COOKIES_FILE: "cookies.json",
  INSTAGRAM_LOGIN_URL: "https://www.instagram.com/accounts/login/",
  RETRY_DELAY: 15000, // 15 ثانية بين المحاولات
  MAX_RETRIES: 3,
};

// 💤 دالة انتظار مع رسالة
function sleep(ms, message = "") {
  if (message) console.log(message);
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 🍪 دالة تحميل الكوكيز من الملف
async function loadCookiesFromFile() {
  if (fs.existsSync(CONFIG.COOKIES_FILE)) {
    console.log("🍪 Loading cookies from file...");
    const cookies = JSON.parse(fs.readFileSync(CONFIG.COOKIES_FILE, "utf8"));
    
    // التحقق من صلاحية الكوكيز
    const sessionCookie = cookies.find(c => c.name === 'sessionid');
    if (!sessionCookie) {
      console.log("⚠️  Invalid cookies, need fresh login");
      return null;
    }
    
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  return null;
}

// 🔐 دالة تسجيل الدخول والحصول على الكوكيز
async function loginAndGetCookies() {
  let browser;
  
  try {
    console.log("\n🚀 Launching browser with enhanced stealth...");
    
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-blink-features=AutomationControlled',
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      viewport: { width: 1366, height: 768 },
      locale: 'en-US',
      timezoneId: 'America/New_York',
      permissions: ['geolocation'],
      geolocation: { longitude: -74.006, latitude: 40.7128 },
    });

    // إضافة headers إضافية
    await context.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    });

    const page = await context.newPage();

    // إخفاء automation
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
      Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
      Object.defineProperty(navigator, 'languages', { get: () => ['en-US', 'en'] });
      window.chrome = { runtime: {} };
    });

    console.log("🌐 Opening Instagram login page...");
    await page.goto(CONFIG.INSTAGRAM_LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    // انتظار عشوائي طويل (2-4 ثواني)
    await sleep(Math.random() * 2000 + 2000, "⏳ Simulating human behavior...");

    console.log("⏳ Waiting for login form...");
    await page.waitForSelector('input[name="username"]', { timeout: 30000 });

    // رفض الكوكيز إذا ظهرت
    try {
      const rejectButton = page.locator('button:has-text("Decline optional cookies")');
      if (await rejectButton.isVisible({ timeout: 3000 })) {
        await rejectButton.click();
        await sleep(1000);
      }
    } catch (e) {}

    await sleep(Math.random() * 1500 + 1500);

    console.log("⌨️  Typing username slowly...");
    await page.type('input[name="username"]', CONFIG.USERNAME, { 
      delay: Math.random() * 50 + 100 
    });
    
    await sleep(Math.random() * 1000 + 1500);

    console.log("⌨️  Typing password slowly...");
    await page.type('input[name="password"]', CONFIG.PASSWORD, { 
      delay: Math.random() * 50 + 100 
    });

    await sleep(Math.random() * 1000 + 2000);

    console.log("🔐 Clicking login button...");
    await page.click('button[type="submit"]');

    console.log("⏳ Waiting for login to complete...");
    await sleep(8000);

    // التعامل مع الـ popups بعد تسجيل الدخول
    try {
      // "Save Your Login Info?" popup
      const notNowButton = page.locator('button:has-text("Not now"), button:has-text("Not Now")').first();
      if (await notNowButton.isVisible({ timeout: 5000 })) {
        await notNowButton.click();
        await sleep(2000);
      }
    } catch (e) {}

    try {
      // "Turn on Notifications?" popup
      const notNowButton = page.locator('button:has-text("Not now"), button:has-text("Not Now")').first();
      if (await notNowButton.isVisible({ timeout: 3000 })) {
        await notNowButton.click();
        await sleep(2000);
      }
    } catch (e) {}

    // التحقق من نجاح تسجيل الدخول
    const currentUrl = page.url();
    console.log("📍 Current URL:", currentUrl);

    if (currentUrl.includes('/accounts/login/') || currentUrl.includes('/challenge/')) {
      throw new Error("Login failed! Check credentials or Instagram requires verification.");
    }

    console.log("✅ Login successful! Getting cookies...");
    await sleep(3000);

    const cookies = await context.cookies();
    
    if (cookies.length === 0) {
      throw new Error("No cookies received!");
    }

    // التحقق من وجود sessionid
    const sessionCookie = cookies.find(c => c.name === 'sessionid');
    if (!sessionCookie) {
      throw new Error("Session cookie not found! Login might have failed.");
    }

    // حفظ الكوكيز
    fs.writeFileSync(CONFIG.COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log(`💾 Cookies saved to ${CONFIG.COOKIES_FILE}`);

    const cookieString = cookies.map(c => `${c.name}=${c.value}`).join("; ");
    console.log("🍪 Cookie preview:", cookieString.substring(0, 100) + "...\n");

    await browser.close();
    return cookieString;

  } catch (error) {
    console.error("\n❌ Login Error:", error.message);
    if (browser) await browser.close();
    throw error;
  }
}

// 📊 دالة جلب بيانات البروفايل مع retry
async function getInstagramProfile(username, cookies, retryCount = 0) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.instagram.com/",
    "Cookie": cookies,
  };

  console.log(`📊 Fetching profile for @${username}...`);
  
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      { headers }
    );

    if (res.status === 429 || res.status === 401) {
      const errorText = await res.text();
      
      if (retryCount < CONFIG.MAX_RETRIES) {
        const waitTime = CONFIG.RETRY_DELAY * (retryCount + 1);
        await sleep(waitTime, `⚠️  Rate limited! Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
        return getInstagramProfile(username, cookies, retryCount + 1);
      }
      
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    const json = await res.json();
    return json.data.user;
    
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES && error.message.includes('fetch')) {
      await sleep(CONFIG.RETRY_DELAY, `⚠️  Network error, retrying...`);
      return getInstagramProfile(username, cookies, retryCount + 1);
    }
    throw error;
  }
}

// 🖼️ دالة جلب منشورات المستخدم مع retry
async function getUserPosts(userId, cookies, count = 12, retryCount = 0) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.instagram.com/",
    "Cookie": cookies,
  };

  console.log(`🖼️  Fetching ${count} latest posts...`);
  
  // انتظار قبل الطلب
  await sleep(Math.random() * 3000 + 2000, "⏳ Waiting before fetching posts...");
  
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/feed/user/${userId}/?count=${count}`,
      { headers }
    );

    if (res.status === 429 || res.status === 401) {
      const errorText = await res.text();
      
      if (retryCount < CONFIG.MAX_RETRIES) {
        const waitTime = CONFIG.RETRY_DELAY * (retryCount + 1);
        await sleep(waitTime, `⚠️  Rate limited! Waiting ${waitTime/1000}s before retry ${retryCount + 1}/${CONFIG.MAX_RETRIES}...`);
        return getUserPosts(userId, cookies, count, retryCount + 1);
      }
      
      throw new Error(`HTTP ${res.status}: ${errorText}`);
    }

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP ${res.status} for posts: ${errorText}`);
    }

    const json = await res.json();
    return json.items || [];
    
  } catch (error) {
    if (retryCount < CONFIG.MAX_RETRIES && error.message.includes('fetch')) {
      await sleep(CONFIG.RETRY_DELAY, `⚠️  Network error, retrying...`);
      return getUserPosts(userId, cookies, count, retryCount + 1);
    }
    throw error;
  }
}

// 🎯 البرنامج الرئيسي
(async () => {
  console.log("═══════════════════════════════════════════");
  console.log("   📸 Instagram Profile & Posts Scraper   ");
  console.log("        Enhanced with Anti-Detection       ");
  console.log("═══════════════════════════════════════════\n");

  try {
    // 1️⃣ محاولة تحميل الكوكيز من الملف
    let cookies = await loadCookiesFromFile();
    
    // 2️⃣ إذا لم تكن موجودة أو غير صالحة، قم بتسجيل الدخول
    if (!cookies) {
      console.log("⚠️  No valid cookies found, need fresh login...\n");
      cookies = await loginAndGetCookies();
      
      // انتظار بعد تسجيل الدخول
      await sleep(5000, "⏳ Waiting after login...");
    }

    // 3️⃣ جلب بيانات البروفايل
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    const user = await getInstagramProfile(CONFIG.TARGET_USER, cookies);

    const profileData = {
      username: user.username,
      name: user.full_name,
      bio: user.biography,
      followers: user.edge_followed_by.count,
      following: user.edge_follow.count,
      posts_count: user.edge_owner_to_timeline_media.count,
      is_private: user.is_private,
      is_verified: user.is_verified,
      profile_pic: user.profile_pic_url_hd || user.profile_pic_url,
      user_id: user.id,
      external_url: user.external_url || null,
      category: user.category_name || null,
    };

    console.log("\n✅ Profile Data:");
    console.log("   👤 Username:", profileData.username);
    console.log("   📝 Name:", profileData.name);
    console.log("   👥 Followers:", profileData.followers.toLocaleString());
    console.log("   ➕ Following:", profileData.following.toLocaleString());
    console.log("   📷 Posts:", profileData.posts_count);
    console.log("   🔒 Private:", profileData.is_private ? "Yes" : "No");
    console.log("   ✔️  Verified:", profileData.is_verified ? "Yes" : "No");
    if (profileData.bio) {
      console.log("   💬 Bio:", profileData.bio.substring(0, 100) + (profileData.bio.length > 100 ? "..." : ""));
    }

    // 4️⃣ جلب المنشورات
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    const postsRaw = await getUserPosts(user.id, cookies, 12);

    const posts = postsRaw.map((post, index) => {
      const shortcode = post.code || post.shortcode || "undefined";
      return {
        position: index + 1,
        caption: (post.caption?.text || post.edge_media_to_caption?.edges[0]?.node.text || "").substring(0, 200),
        image: post.image_versions2?.candidates?.[0]?.url || post.display_url || post.video_url || "",
        likes: post.like_count || post.edge_liked_by?.count || 0,
        comments: post.comment_count || post.edge_media_to_comment?.count || 0,
        url: `https://www.instagram.com/p/${shortcode}/`,
        type: post.media_type === 2 || post.is_video ? "video" : "image",
        timestamp: post.taken_at || post.taken_at_timestamp || null,
      };
    });

    console.log(`✅ Found ${posts.length} posts:\n`);
    posts.slice(0, 3).forEach(post => {
      console.log(`   ${post.position}. ${post.type === 'video' ? '🎥' : '📷'} ${post.url}`);
      console.log(`      ❤️  ${post.likes.toLocaleString()} likes | 💬 ${post.comments.toLocaleString()} comments`);
      if (post.caption) {
        console.log(`      📝 ${post.caption.substring(0, 60)}...`);
      }
      console.log("");
    });

    // 5️⃣ حفظ البيانات في ملف JSON
    const fullData = { 
      profile: profileData, 
      posts: posts,
      scraped_at: new Date().toISOString(),
      total_posts_fetched: posts.length
    };
    
    const outputFile = `${CONFIG.TARGET_USER}_data.json`;
    fs.writeFileSync(outputFile, JSON.stringify(fullData, null, 2));

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Data saved to ${outputFile}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("\n❌ Fatal Error:", err.message);
    console.error("\n💡 Troubleshooting tips:");
    console.error("   • Wait 10-15 minutes if rate limited");
    console.error("   • Delete cookies.json and try fresh login: rm cookies.json");
    console.error("   • Verify credentials are correct");
    console.error("   • Instagram might require manual verification from browser");
    console.error("   • Try using a different IP/VPN");
    console.error("   • Don't run the script too frequently\n");
    
    // حذف الكوكيز التالفة
    if (err.message.includes('401') || err.message.includes('login')) {
      if (fs.existsSync(CONFIG.COOKIES_FILE)) {
        fs.unlinkSync(CONFIG.COOKIES_FILE);
        console.log("🗑️  Deleted invalid cookies. Run again for fresh login.\n");
      }
    }
    
    process.exit(1);
  }
})();