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




import puppeteer from "puppeteer";
import fetch from "node-fetch";
import fs from "fs";

const INSTAGRAM_LOGIN_URL = "https://www.instagram.com/accounts/login/";
const TARGET_USER = "nannis_cakes";
const YOUR_USERNAME = "abdallarroom13";
const YOUR_PASSWORD = "Az01027101373@#";

const COOKIES_FILE = "cookies.json";

async function loginAndGetCookies() {
  console.log("🔐 Logging in to get cookies...");

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const page = await browser.newPage();

  await page.goto(INSTAGRAM_LOGIN_URL, { waitUntil: "networkidle2" });
  await page.waitForSelector('input[name="username"]');
  await page.type('input[name="username"]', YOUR_USERNAME);
  await page.type('input[name="password"]', YOUR_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });

  const cookies = await page.cookies();
  await browser.close();

  const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");

  // ✅ حفظ الكوكيز
  fs.writeFileSync(COOKIES_FILE, JSON.stringify(cookies, null, 2));

  console.log("✅ Cookies saved successfully.");
  return cookieString;
}

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
