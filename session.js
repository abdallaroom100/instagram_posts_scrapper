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

async function loginAndGetCookies() {
  console.log("🔐 Logging in...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
    ],
  });

  // ✳️ إنشاء context فيه الـ userAgent و viewport
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  console.log("🌍 Opening Instagram login...");
  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });

  // أحيانًا بيظهر cookie banner لازم يتقفل
  try {
    await page.click('text=Allow all cookies', { timeout: 5000 });
    console.log("🍪 Accepted cookies popup");
  } catch (_) {}

  console.log("⌨️ Typing credentials...");
  await page.fill('input[name="username"]', YOUR_USERNAME);
  await page.fill('input[name="password"]', YOUR_PASSWORD);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForLoadState("domcontentloaded", { timeout: 60000 }),
  ]);

  // ننتظر الخروج من صفحة login
  await page.waitForFunction(
    () => !window.location.href.includes("/login"),
    { timeout: 90000 }
  );

  console.log("✅ Logged in successfully!");
  console.log("📍 Current URL:", page.url());

  await new Promise((r) => setTimeout(r, 3000));

  // 🔐 الحصول على الكوكيز
  const cookies = (await context.cookies())
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  await browser.close();
  return cookies;
}


async function getInstagramProfile(username, cookies) {
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Cookie": cookies,
  };
  const res = await fetch(
    `https://www.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
    { headers }
  );
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();
  return json.data.user;
}

async function getUserPosts(userId, cookies, count = 12) {
  const queryHash = "69cba40317214236af40e7efa697781d";
  const variables = { id: userId, first: count };
  const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Cookie": cookies,
  };
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(await res.text());
  const json = await res.json();

  return json.data.user.edge_owner_to_timeline_media.edges.map(e => ({
    id: e.node.id,
    caption: e.node.edge_media_to_caption.edges[0]?.node.text || "",
    image: e.node.display_url,
    likes: e.node.edge_liked_by.count,
    comments: e.node.edge_media_to_comment.count,
    url: `https://www.instagram.com/p/${e.node.shortcode}/`,
    type: e.node.is_video ? "video" : "image",
  }));
}

(async () => {
  try {
    const cookies = await loginAndGetCookies();
    console.log("🍪 Got cookies!");

    console.log("📊 Fetching profile...");
    const user = await getInstagramProfile(TARGET_USER, cookies);
    console.log("✅ Profile:", user.username);

    console.log("🖼️ Fetching posts...");
    const posts = await getUserPosts(user.id, cookies);
    console.log(`✅ Got ${posts.length} posts`);

    fs.writeFileSync(
      `${TARGET_USER}_data.json`,
      JSON.stringify({ profile: user, posts }, null, 2)
    );

    console.log("💾 Done!");
  } catch (e) {
    console.error("❌ Error:", e.message);
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
