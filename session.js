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
import fs from "fs";

const USERNAME = "abdallarroom13";
const PASSWORD = "Az01027101373@#";

console.log("═══════════════════════════════════════════");
console.log("   🍪 Instagram Cookie Extractor");
console.log("   Run this on YOUR LOCAL PC, not server!");
console.log("═══════════════════════════════════════════\n");

(async () => {
  let browser;
  
  try {
    console.log("🚀 Opening browser (you'll see it)...");
    
    browser = await chromium.launch({
      headless: false, // ⬅️ سيظهر المتصفح
      args: ['--no-sandbox'],
    });

    const context = await browser.newContext({
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
      viewport: { width: 1366, height: 768 },
    });

    const page = await context.newPage();

    console.log("🌍 Opening Instagram...");
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // Handle cookie popup
    try {
      await page.click('button:has-text("Allow all cookies")', { timeout: 3000 });
    } catch (_) {}

    console.log("⌨️  Filling credentials...");
    await page.waitForSelector('input[name="username"]');
    await page.fill('input[name="username"]', USERNAME);
    await page.fill('input[name="password"]', PASSWORD);

    console.log("🔐 Clicking login...");
    await page.click('button[type="submit"]');

    console.log("\n⏳ PLEASE COMPLETE VERIFICATION IN THE BROWSER");
    console.log("   - Check for SMS/Email verification");
    console.log("   - Complete any security checks");
    console.log("   - Wait until you see your Instagram feed");
    console.log("\n⌨️  Then press ENTER here to save cookies...\n");

    // انتظار حتى تضغط Enter
    await new Promise((resolve) => {
      process.stdin.once("data", resolve);
    });

    console.log("\n✅ Saving cookies...");
    const cookies = await context.cookies();
    
    if (cookies.length === 0) {
      throw new Error("No cookies found! Login might have failed.");
    }

    // حفظ الكوكيز
    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("💾 Cookies saved to cookies.json");

    // عرض معلومات مفيدة
    const sessionCookie = cookies.find(c => c.name === "sessionid");
    if (sessionCookie) {
      console.log("✅ Session cookie found!");
      console.log("\n📤 Now upload this file to your server:");
      console.log("   scp cookies.json root@your-server-ip:~/scrap/");
    } else {
      console.log("⚠️  Warning: No session cookie found!");
    }

    await browser.close();
    console.log("\n✅ Done! Upload cookies.json to your server.\n");

  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (browser) await browser.close();
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
