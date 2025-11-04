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
};

// 🍪 دالة تحميل الكوكيز من الملف
async function loadCookiesFromFile() {
  if (fs.existsSync(CONFIG.COOKIES_FILE)) {
    console.log("🍪 Loading cookies from file...");
    const cookies = JSON.parse(fs.readFileSync(CONFIG.COOKIES_FILE, "utf8"));
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  return null;
}

// 🔐 دالة تسجيل الدخول والحصول على الكوكيز
async function loginAndGetCookies() {
  let browser;
  
  try {
    console.log("\n🚀 Launching browser...");
    
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    const page = await context.newPage();

    console.log("🌐 Opening Instagram login page...");
    await page.goto(CONFIG.INSTAGRAM_LOGIN_URL, {
      waitUntil: 'domcontentloaded',
      timeout: 90000
    });

    console.log("⏳ Waiting for login form...");
    await page.waitForSelector('input[name="username"]', { timeout: 30000 });

    // إضافة تأخير عشوائي (يبدو أكثر طبيعية)
    await page.waitForTimeout(Math.random() * 1500 + 1000);

    console.log("⌨️  Typing username...");
    await page.fill('input[name="username"]', CONFIG.USERNAME);
    await page.waitForTimeout(Math.random() * 800 + 500);

    console.log("⌨️  Typing password...");
    await page.fill('input[name="password"]', CONFIG.PASSWORD);
    await page.waitForTimeout(Math.random() * 800 + 500);

    console.log("🔐 Submitting login form...");
    await page.click('button[type="submit"]');

    // انتظار التنقل بعد تسجيل الدخول
    console.log("⏳ Waiting for login to complete...");
    try {
      await page.waitForURL(/instagram.com\/(?!accounts\/login)/, { 
        timeout: 60000 
      });
    } catch (err) {
      // أحياناً Instagram مش بيعمل redirect كامل، فنستنى شوية
      console.log("⚠️  Navigation might be slow, waiting extra time...");
      await page.waitForTimeout(8000);
    }

    // التأكد من نجاح تسجيل الدخول
    const currentUrl = page.url();
    if (currentUrl.includes('/accounts/login/')) {
      throw new Error("Login failed! Still on login page.");
    }

    console.log("✅ Login successful! Getting cookies...");
    await page.waitForTimeout(3000);

    const cookies = await context.cookies();
    
    if (cookies.length === 0) {
      throw new Error("No cookies received!");
    }

    // حفظ الكوكيز في ملف
    fs.writeFileSync(CONFIG.COOKIES_FILE, JSON.stringify(cookies, null, 2));
    console.log(`💾 Cookies saved to ${CONFIG.COOKIES_FILE}`);

    // تحويل الكوكيز لـ string
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

// 📊 دالة جلب بيانات البروفايل
async function getInstagramProfile(username, cookies) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "Cookie": cookies,
  };

  console.log(`📊 Fetching profile for @${username}...`);
  
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

// 🖼️ دالة جلب منشورات المستخدم
async function getUserPosts(userId, cookies, count = 12) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": cookies.split("csrftoken=")[1]?.split(";")[0] || "",
    "Cookie": cookies,
  };

  console.log(`🖼️  Fetching ${count} latest posts...`);
  
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

// 🎯 البرنامج الرئيسي
(async () => {
  console.log("═══════════════════════════════════════════");
  console.log("   📸 Instagram Profile & Posts Scraper   ");
  console.log("═══════════════════════════════════════════\n");

  try {
    // 1️⃣ محاولة تحميل الكوكيز من الملف
    let cookies = await loadCookiesFromFile();
    
    // 2️⃣ إذا لم تكن موجودة، قم بتسجيل الدخول
    if (!cookies) {
      console.log("⚠️  No cookies found, logging in...\n");
      cookies = await loginAndGetCookies();
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

    console.log("✅ Profile Data:");
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
    console.error("   • Check your internet connection");
    console.error("   • Verify your Instagram credentials");
    console.error("   • Instagram might be blocking automated access");
    console.error("   • Try deleting cookies.json and login again");
    console.error("   • Check if Instagram requires verification\n");
    process.exit(1);
  }
})();