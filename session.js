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

import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";

const config = {
  username: "nannis_cakes", // 👈 الحساب الهدف
  loginUsername: USERNAME,
  loginPassword: PASSWORD,
  postsLimit: 12,
};

async function loginAndGetCookies() {
  console.log("🔐 Logging into Instagram...");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto("https://www.instagram.com/accounts/login/", {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector('input[name="username"]', { visible: true });
  await page.type('input[name="username"]', config.loginUsername, { delay: 50 });
  await page.type('input[name="password"]', config.loginPassword, { delay: 50 });
  await page.keyboard.press("Enter");

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const cookies = await page.cookies();
  await browser.close();

  fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
  console.log("🍪 Cookies saved!");
  return cookies;
}

async function fetchInstagramAPI(endpoint, cookies) {
  const cookieString = cookies.map(c => `${c.name}=${c.value}`).join("; ");

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": "https://www.instagram.com/",
    "X-CSRFToken": cookies.find(c => c.name === "csrftoken")?.value || "",
    "X-IG-App-ID": "936619743392459", // ثابت لتطبيق Instagram Web
    "X-Requested-With": "XMLHttpRequest",
    "Cookie": cookieString,
  };

  const url = `https://www.instagram.com${endpoint}`;
  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`🔻 ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("Response:", text.slice(0, 300));
    throw new Error(`Failed: ${res.status}`);
  }

  return await res.json();
}

async function scrapeInstagram() {
  let cookies;

    cookies = await loginAndGetCookies();
  

  try {
    console.log(`📊 Fetching profile for ${config.username}...`);
    const profileData = await fetchInstagramAPI(
      `/api/v1/users/web_profile_info/?username=${config.username}`,
      cookies
    );

    const user = profileData.data.user;
    console.log("✅ Profile fetched!");

    console.log("🖼️ Fetching posts...");
    const postsData = await fetchInstagramAPI(
      `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
      cookies
    );

    const output = {
      profile: {
        username: user.username,
        full_name: user.full_name,
        followers: user.edge_followed_by.count,
        following: user.edge_follow.count,
        bio: user.biography,
      },
      posts: postsData.items?.map(post => ({
        id: post.id,
        caption: post.caption?.text || "",
        image: post.image_versions2?.candidates[0]?.url || "",
        like_count: post.like_count,
        comment_count: post.comment_count,
      })) || [],
    };

    fs.writeFileSync("output.json", JSON.stringify(output, null, 2));
    console.log("📁 Saved to output.json");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

scrapeInstagram();



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
