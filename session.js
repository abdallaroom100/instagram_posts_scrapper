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


const USERNAME = "abdallarroom13";
const PASSWORD = "Az01027101373@#";

// import puppeteer from "puppeteer";
import { chromium } from "playwright";
import fs from "fs";

const COOKIES_PATH = "./cookies.json";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

async function loginAndSaveCookies() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({ userAgent: USER_AGENT });
  const page = await context.newPage();

  console.log("🌍 Opening Instagram login...");
  await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "networkidle" });

  await page.waitForSelector('input[name="username"]');
  console.log("⌨️ Typing credentials...");
  await page.fill('input[name="username"]', USERNAME);
  await page.fill('input[name="password"]', PASSWORD);
  await page.click('button[type="submit"]');

  await page.waitForTimeout(8000);

  const cookies = await context.cookies();
  fs.writeFileSync(COOKIES_PATH, JSON.stringify(cookies, null, 2));
  console.log("🍪 Cookies saved!");

  await browser.close();
}

async function fetchProfileAndPosts(username) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    storageState: COOKIES_PATH,
  });
  const page = await context.newPage();

  console.log(`📊 Fetching profile for ${username}...`);
  await page.goto(`https://www.instagram.com/${username}/`, { waitUntil: "networkidle" });

  // جلب بيانات JSON الحقيقية من داخل الصفحة
  const data = await page.evaluate(() => {
    const script = Array.from(document.scripts).find(s => s.textContent.includes("window._sharedData"));
    if (!script) return null;
    const jsonText = script.textContent.match(/window\._sharedData\s*=\s*(\{.*\});/)[1];
    return JSON.parse(jsonText);
  });

  if (!data) {
    console.error("❌ Could not extract profile data!");
    await browser.close();
    return;
  }

  console.log("✅ Got profile data!");
  const user = data.entry_data.ProfilePage[0].graphql.user;
  console.log("📌 Username:", user.username);
  console.log("👥 Followers:", user.edge_followed_by.count);
  console.log("📷 Posts:", user.edge_owner_to_timeline_media.count);

  console.log("🖼️ Fetching posts...");
  const posts = user.edge_owner_to_timeline_media.edges.map(p => ({
    id: p.node.id,
    image: p.node.display_url,
    likes: p.node.edge_liked_by.count,
    caption: p.node.edge_media_to_caption.edges[0]?.node.text || "",
  }));

  console.log("✅ Got", posts.length, "posts!");
  console.log(posts.slice(0, 3)); // أول 3 بوستات مثال

  await browser.close();
}

(async () => {
  if (!fs.existsSync(COOKIES_PATH)) {
    await loginAndSaveCookies();
  }
  await fetchProfileAndPosts("instagram"); // استبدل باليوزر اللي عايزه
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
