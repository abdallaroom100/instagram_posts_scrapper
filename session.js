// import fetch from "node-fetch";
    
// const COOKIES = `csrftoken=K7itPBXLKDXV2czTTAYXynNbuoPBQ2JY; rur="RVA\\05477697263321\\0541793364270:01fe946758bca62f7bcbaba432495dcccdfa1b9b7117e8fb8b432303d79f421e74a9fcf5"; ds_user_id=77697263321`;
// const TARGET_USER = "nannis_cakes";

// async function getInstagramProfile(username) {
//   const headers = {
//     "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
//     "Accept": "*/*",
//     "Accept-Language": "en-US,en;q=0.9",
//     "X-IG-App-ID": "936619743392459",
//     "Cookie": COOKIES,
//   };

//   const res = await fetch(
//     `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
//     { headers }
//   );
   
//   if (!res.ok) throw new Error(`HTTP ${res.status}`);

//   const json = await res.json();
//   return json.data.user;
// }

// (async () => {
//   try {
//     const user = await getInstagramProfile(TARGET_USER);

//     console.log("📊 Profile:", {
//       username: user.username,
//       name: user.full_name,
//       followers: user.edge_followed_by.count,
//       following: user.edge_follow.count,
//       posts_count: user.edge_owner_to_timeline_media.count,
//     });


//     const posts = user.edge_owner_to_timeline_media.edges
//       .slice(0, 12) 
//       .map((edge) => ({
//         caption: edge.node.edge_media_to_caption.edges[0]?.node.text || "",
//         image: edge.node.display_url,
//         likes: edge.node.edge_liked_by.count,
//         comments: edge.node.edge_media_to_comment.count,
//         date: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
//         shortcode: edge.node.shortcode,
//         url: `https://www.instagram.com/p/${edge.node.shortcode}/`,
//         type: edge.node.is_video ? "video" : "image",
//       }));

//     console.log("\n🖼️ Latest 12 Posts:");
//     console.log(posts);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// })();




// import puppeteer from "puppeteer";
import { chromium } from "playwright";
import fetch from "node-fetch";
import fs from "fs";

const TARGET_USER = "nannis_cakes";
const USERNAME = "abdallarroom13";
const PASSWORD = "Az01027101373@#";
const COOKIES_FILE = "cookies.json";

// 🎭 User Agent موحّد
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

// 💤 دالة الانتظار
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 🍪 تحميل الكوكيز من الملف
function loadCookiesFromFile() {
  if (fs.existsSync(COOKIES_FILE)) {
    console.log("🍪 Loading saved cookies...");
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
    return cookies;
  }
  return null;
}

// 💾 حفظ الكوكيز في ملف
function saveCookies(cookies) {
  fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log(`💾 Cookies saved to ${COOKIES_FILE}`);
}

// 🔐 تسجيل الدخول
async function loginAndGetCookies() {
  console.log("\n🔐 Starting login process...");

 const browser = await chromium.launch({
  headless: false, // ⬅️ غيرها لـ false
  args: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
  ],
});

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1366, height: 768 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });

  // إضافة headers
  await context.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
  });

  const page = await context.newPage();

  // إخفاء automation
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    window.chrome = { runtime: {} };
  });

  console.log("🌍 Opening Instagram...");
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  await sleep(2000);

  // رفض الكوكيز لو ظهر
  try {
    const cookieButton = page.locator('button:has-text("Allow all cookies"), button:has-text("Allow essential")').first();
    if (await cookieButton.isVisible({ timeout: 3000 })) {
      await cookieButton.click();
      console.log("🍪 Handled cookies popup");
      await sleep(1000);
    }
  } catch (_) {}

  console.log("⏳ Waiting for login form...");
  await page.waitForSelector('input[name="username"]', { timeout: 20000 });
  await sleep(1500);

  console.log("⌨️  Typing username...");
  await page.type('input[name="username"]', USERNAME, { delay: 120 });
  await sleep(800);

  console.log("⌨️  Typing password...");
  await page.type('input[name="password"]', PASSWORD, { delay: 120 });
  await sleep(1200);

  console.log("🔐 Submitting login...");
  await page.click('button[type="submit"]');

  // انتظار التنقل
  console.log("⏳ Waiting for login response...");
  await sleep(8000);

  const currentUrl = page.url();
  console.log("📍 Current URL:", currentUrl);

  // التعامل مع challenge
  if (currentUrl.includes("/challenge/")) {
    console.log("\n⚠️  Instagram requires verification!");
    console.log("🔴 IMPORTANT: You need to verify your account manually:");
    console.log("   1. Open Instagram in your browser");
    console.log("   2. Login with your credentials");
    console.log("   3. Complete the verification (SMS/Email)");
    console.log("   4. Once verified, run this script again\n");
    
    await browser.close();
    throw new Error("Instagram requires manual verification. Please complete it and try again.");
  }

  if (currentUrl.includes("/accounts/login/")) {
    console.log("\n❌ Login failed! Credentials might be incorrect.");
    await browser.close();
    throw new Error("Login failed - still on login page");
  }

  // التعامل مع "Save Login Info"
  try {
    const notNowButton = page.locator('button:has-text("Not now"), button:has-text("Not Now")').first();
    if (await notNowButton.isVisible({ timeout: 5000 })) {
      await notNowButton.click();
      console.log("✅ Skipped 'Save Login Info'");
      await sleep(2000);
    }
  } catch (_) {}

  // التعامل مع "Turn on Notifications"
  try {
    const notNowButton = page.locator('button:has-text("Not now"), button:has-text("Not Now")').first();
    if (await notNowButton.isVisible({ timeout: 3000 })) {
      await notNowButton.click();
      console.log("✅ Skipped 'Notifications'");
      await sleep(2000);
    }
  } catch (_) {}

  console.log("✅ Login successful!");
  await sleep(3000);

  // الحصول على الكوكيز
  const cookies = await context.cookies();
  
  if (cookies.length === 0) {
    await browser.close();
    throw new Error("No cookies received!");
  }

  // حفظ الكوكيز
  saveCookies(cookies);

  await browser.close();
  return cookies;
}

// 🔄 تحويل الكوكيز لـ string
function cookiesToString(cookies) {
  return cookies.map(c => `${c.name}=${c.value}`).join("; ");
}

// 📊 جلب بيانات البروفايل
async function getInstagramProfile(username, cookies) {
  const cookieString = cookiesToString(cookies);
  const csrfToken = cookies.find(c => c.name === "csrftoken")?.value || "";

  const headers = {
    "User-Agent": USER_AGENT,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    "Referer": `https://www.instagram.com/${username}/`,
    "Cookie": cookieString,
  };

  console.log(`\n📊 Fetching profile for @${username}...`);
  
  const res = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    { headers }
  );

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Profile fetch failed:", errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();
  return json.data.user;
}

// 🖼️ جلب المنشورات
async function getUserPosts(userId, cookies, count = 12) {
  const cookieString = cookiesToString(cookies);
  const csrfToken = cookies.find(c => c.name === "csrftoken")?.value || "";

  // استخدام GraphQL API (أكثر استقراراً)
  const queryHash = "69cba40317214236af40e7efa697781d";
  const variables = { id: userId, first: count };
  const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}`;

  const headers = {
    "User-Agent": USER_AGENT,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.instagram.com/",
    "Cookie": cookieString,
  };

  console.log(`🖼️  Fetching ${count} latest posts...`);
  await sleep(2000); // انتظار قبل الطلب

  const res = await fetch(url, { headers });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Posts fetch failed:", errorText);
    throw new Error(`HTTP ${res.status}: ${errorText}`);
  }

  const json = await res.json();

  if (!json.data?.user?.edge_owner_to_timeline_media?.edges) {
    console.log("⚠️  No posts found or private account");
    return [];
  }

  return json.data.user.edge_owner_to_timeline_media.edges.map((e) => ({
    id: e.node.id,
    caption: e.node.edge_media_to_caption.edges[0]?.node.text || "",
    image: e.node.display_url,
    likes: e.node.edge_liked_by.count,
    comments: e.node.edge_media_to_comment.count,
    url: `https://www.instagram.com/p/${e.node.shortcode}/`,
    type: e.node.is_video ? "video" : "image",
    timestamp: e.node.taken_at_timestamp,
  }));
}

// 🎯 البرنامج الرئيسي
(async () => {
  console.log("═══════════════════════════════════════════");
  console.log("   📸 Instagram Profile & Posts Scraper   ");
  console.log("═══════════════════════════════════════════");

  try {
    // 1️⃣ محاولة تحميل الكوكيز
    let cookies = loadCookiesFromFile();

    // 2️⃣ إذا لم تكن موجودة، تسجيل الدخول
    if (!cookies) {
      console.log("\n⚠️  No saved cookies found. Starting fresh login...");
      cookies = await loginAndGetCookies();
    } else {
      console.log("✅ Using saved cookies from previous session");
      
      // التحقق من صلاحية الكوكيز
      const sessionCookie = cookies.find(c => c.name === "sessionid");
      if (!sessionCookie) {
        console.log("⚠️  Invalid cookies, need fresh login");
        fs.unlinkSync(COOKIES_FILE);
        cookies = await loginAndGetCookies();
      }
    }

    // 3️⃣ جلب البروفايل
    const user = await getInstagramProfile(TARGET_USER, cookies);

    console.log("\n✅ Profile Data:");
    console.log("   👤 Username:", user.username);
    console.log("   📝 Full Name:", user.full_name);
    console.log("   👥 Followers:", user.edge_followed_by.count.toLocaleString());
    console.log("   ➕ Following:", user.edge_follow.count.toLocaleString());
    console.log("   📷 Posts:", user.edge_owner_to_timeline_media.count);
    console.log("   🔒 Private:", user.is_private ? "Yes" : "No");
    if (user.biography) {
      console.log("   💬 Bio:", user.biography.substring(0, 80) + "...");
    }

    // 4️⃣ جلب المنشورات
    const posts = await getUserPosts(user.id, cookies, 12);

    console.log(`\n✅ Fetched ${posts.length} posts`);
    
    if (posts.length > 0) {
      console.log("\nLatest posts preview:");
      posts.slice(0, 3).forEach((post, idx) => {
        console.log(`\n   ${idx + 1}. ${post.type === "video" ? "🎥" : "📷"} ${post.url}`);
        console.log(`      ❤️  ${post.likes.toLocaleString()} likes | 💬 ${post.comments.toLocaleString()} comments`);
        if (post.caption) {
          console.log(`      📝 ${post.caption.substring(0, 60)}...`);
        }
      });
    }

    // 5️⃣ حفظ البيانات
    const outputFile = `${TARGET_USER}_data.json`;
    const fullData = {
      profile: {
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
      },
      posts: posts,
      scraped_at: new Date().toISOString(),
      total_posts: posts.length,
    };

    fs.writeFileSync(outputFile, JSON.stringify(fullData, null, 2));

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ Data saved to ${outputFile}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  } catch (err) {
    console.error("\n❌ Error:", err.message);
    
    if (err.message.includes("verification") || err.message.includes("challenge")) {
      console.error("\n💡 Next steps:");
      console.error("   1. Login to Instagram manually in a browser");
      console.error("   2. Complete any verification Instagram asks for");
      console.error("   3. Wait 10-15 minutes");
      console.error("   4. Run this script again");
    } else if (err.message.includes("401") || err.message.includes("useragent")) {
      console.error("\n💡 Cookies might be expired. Deleting them...");
      if (fs.existsSync(COOKIES_FILE)) {
        fs.unlinkSync(COOKIES_FILE);
        console.error("   Run the script again for fresh login");
      }
    }
    
    console.error("");
    process.exit(1);
  }
})();



// import fetch from "node-fetch";
// import fs from "fs";

// const COOKIES = `csrftoken=sChXfKnHrwwX2elurvSTt7ckZZ2sGMm7; ds_user_id=77697263321; sessionid=77697263321%3ABRzgEmgO19gspQ%3A28%3AAYgSKCw-5bC6PLEvE21EcD6G57g49TvZVzkMnwCVrQ;`;
// const TARGET_USER = "nanis__cake";

// async function getUserId(username, headers) {
//   const res = await fetch(
//     `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
//     { headers }
//   );
//   const json = await res.json();
//   return json.data.user.id;
// }

// async function getAllPosts(userId, headers) {
//   let maxId = null;
//   const allPosts = [];

//   while (true) {
//     const url = new URL(`https://www.instagram.com/api/v1/feed/user/${userId}/`);
//     url.searchParams.set("count", "12");
//     if (maxId) url.searchParams.set("max_id", maxId);

//     const res = await fetch(url.toString(), { headers });
//     if (!res.ok) {
//       throw new Error(`HTTP ${res.status}`);
//     }

//     const json = await res.json();

//     if (!json.items?.length) break;

//     for (const post of json.items) {
//       const caption = post.caption?.text || "";
//       const image = post.image_versions2?.candidates?.[0]?.url || "";
//       const isVideo = post.media_type === 2;
//       const video = isVideo ? post.video_versions?.[0]?.url || "" : null;
//       const url = `https://www.instagram.com/p/${post.code}/`;

//       allPosts.push({
//         caption,
//         image,
//         video,
//         likes: post.like_count,
//         comments: post.comment_count,
//         date: new Date(post.taken_at * 1000).toISOString(),
//         url,
//       });
//     }

//     console.log(`📥 Loaded ${allPosts.length} posts so far...`);

//     if (!json.more_available) break;
//     maxId = json.next_max_id;

//     // تأخير بسيط لتجنب البلوك
//     await new Promise((r) => setTimeout(r, 600));
//   }

//   return allPosts;
// }

// (async () => {
//   try {
//     const headers = {
//       "User-Agent":
//         "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0",
//       "Accept": "*/*",
//       "X-IG-App-ID": "936619743392459",
//       "Cookie": COOKIES,
//     };

//     const userId = await getUserId(TARGET_USER, headers);
//     console.log(`📊 Found user: ${TARGET_USER} | ID: ${userId}`);

//     const posts = await getAllPosts(userId, headers);

//     console.log(`\n✅ Done. Total posts fetched: ${posts.length}`);
//     fs.writeFileSync("posts.json", JSON.stringify(posts, null, 2));
//     console.log("💾 Saved to posts.json");
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//   }
// })();
