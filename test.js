import puppeteer from "puppeteer";
import fetch from "node-fetch";
import fs from "fs";

/**
 * Launches a Puppeteer browser, navigates to a webpage, and then closes the browser.
 *
 * Launch Options:
 * - headless: Run the browser in headless mode (no GUI).
 * - args:
 *   - "--no-sandbox": Required if running as the root user.
 *   - "--disable-setuid-sandbox": Optional, try if you encounter sandbox errors.
 */
const INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/";
const TARGET_USER = "nannis_cakes";
const YOUR_USERNAME = "abdallarroom13";
const YOUR_PASSWORD = "Az01027101373@#";

const COOKIES_FILE = "cookies.json";
const runPuppeteer = async () => {
  try {
    // Launch a Puppeteer browser instance with custom arguments
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
      ],
    });

    // Open a new page in the browser
    const page = await browser.newPage();


// ✅ استخدم domcontentloaded بدل networkidle2
await page.goto(INSTAGRAM_LOGIN_URL, {
  waitUntil: "domcontentloaded",
  timeout: 60000,
});

// ✅ انتظر ظهور الـ input عشان تتأكد إن الصفحة اتحملت
await page.waitForSelector('input[name="username"]', { timeout: 30000 });

// ✅ اكتب بيانات الدخول
await page.type('input[name="username"]', YOUR_USERNAME, { delay: 80 });
await page.type('input[name="password"]', YOUR_PASSWORD, { delay: 80 });

// ✅ دوس تسجيل الدخول
await Promise.all([
  page.click('button[type="submit"]'),
  page.waitForNavigation({ waitUntil: "domcontentloaded", timeout: 60000 }),
]);

// ✅ بعد ما يسجل الدخول، خُد الكوكيز
const cookies = await page.cookies();
await browser.close();

const cookieString = cookies.map(c => `${c.name}=${c.value}`).join("; ");
console.log("✅ Cookies obtained:", cookieString.substring(0, 150) + "...");


return cookieString;

    // Close the browser
    console.log("Browser closed successfully.");
  } catch (error) {
    console.error("An error occurred:", error);
  }
};
async function loadCookies() {
  if (fs.existsSync(COOKIES_FILE)) {
    console.log("🍪 Loading cookies from file...");
    const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
    return cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  }
  return null;
}

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


(async () => {
  try {
    let cookies = await loadCookies();
    if (!cookies) {
      cookies = await loginAndGetCookies();
    }

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

    console.log("📊 Profile:", profileData);

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
    console.error(
      "💡 Tip: لو لسة ناقص مكتبات أو حصل block، جرّب تسجيل الدخول يدوي أو headless=false محليًا."
    );
  }
})();
// Execute the function
runPuppeteer();