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
import { resolve } from 'path';

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
    await new Promise(resolve,setTimeout(resolve,Math.random() * 1500 + 1000))


    console.log("⌨️  Typing username...");
    await page.fill('input[name="username"]', CONFIG.USERNAME);
       await new Promise(resolve,setTimeout(resolve,Math.random() * 800 + 500))
  

    console.log("⌨️  Typing password...");
    await page.fill('input[name="password"]', CONFIG.PASSWORD);
          await new Promise(resolve,setTimeout(resolve,Math.random() * 800 + 500))

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
         await new Promise(resolve,setTimeout(resolve,Math.random() * 8000))
    }

    // التأكد من نجاح تسجيل الدخول
    const currentUrl = page.url();
    if (currentUrl.includes('/accounts/login/')) {
      throw new Error("Login failed! Still on login page.");
    }

    console.log("✅ Login successful! Getting cookies...");
        await new Promise(resolve,setTimeout(resolve,Math.random() *3000))

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
})()