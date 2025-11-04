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
import fetch from "node-fetch";
import fs from "fs";

const TARGET_USER = "nannis_cakes";
const COOKIES_FILE = "cookies.json";

// 🍪 تحميل الكوكيز من الملف
function loadCookies() {
  if (!fs.existsSync(COOKIES_FILE)) {
    console.log("\n❌ cookies.json not found!");
    console.log("\n📝 Steps to get cookies:");
    console.log("   1. Open Instagram in your browser");
    console.log("   2. Login with your account");
    console.log("   3. Open DevTools (F12)");
    console.log("   4. Go to Application → Cookies → instagram.com");
    console.log("   5. Copy all cookies and save them in cookies.json");
    console.log("\nOr run the cookie extractor on your PC first!\n");
    process.exit(1);
  }
  
  const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, "utf8"));
  
  // تحويل array إلى string
  if (Array.isArray(cookies)) {
    return cookies.map(c => `${c.name}=${c.value}`).join("; ");
  }
  
  // لو مش array، يبقى string جاهز
  return cookies;
}

// 📊 جلب بيانات البروفايل
async function getInstagramProfile(username, cookies) {
  const csrfToken = cookies.split("csrftoken=")[1]?.split(";")[0] || "";
  
  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    "Referer": `https://www.instagram.com/${username}/`,
    "Cookie": cookies,
  };

  console.log(`\n📊 Fetching profile for @${username}...`);
  
  try {
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
    
  } catch (error) {
    console.error("❌ Profile fetch error:", error.message);
    throw error;
  }
}

// 🖼️ جلب المنشورات
async function getUserPosts(userId, cookies, count = 12) {
  const csrfToken = cookies.split("csrftoken=")[1]?.split(";")[0] || "";
  
  // استخدام GraphQL API
  const queryHash = "69cba40317214236af40e7efa697781d";
  const variables = { id: userId, first: count };
  const url = `https://www.instagram.com/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(
    JSON.stringify(variables)
  )}`;

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "X-IG-App-ID": "936619743392459",
    "X-CSRFToken": csrfToken,
    "X-Requested-With": "XMLHttpRequest",
    "Referer": "https://www.instagram.com/",
    "Cookie": cookies,
  };

  console.log(`🖼️  Fetching ${count} latest posts...`);
  
  // انتظار 2 ثانية قبل الطلب
  await new Promise(r => setTimeout(r, 2000));

  try {
    const res = await fetch(url, { headers });

    if (!res.ok) {
      const errorText = await res.text();
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
    
  } catch (error) {
    console.error("❌ Posts fetch error:", error.message);
    throw error;
  }
}

// 🎯 البرنامج الرئيسي
(async () => {
  console.log("═══════════════════════════════════════════");
  console.log("   📸 Instagram Scraper (Fetch Only)");
  console.log("═══════════════════════════════════════════");

  try {
    // 1️⃣ تحميل الكوكيز
    console.log("\n🍪 Loading cookies...");
    const cookies = loadCookies();
    console.log("✅ Cookies loaded successfully");

    // 2️⃣ جلب البروفايل
    const user = await getInstagramProfile(TARGET_USER, cookies);

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
    console.log("   📝 Full Name:", profileData.name);
    console.log("   👥 Followers:", profileData.followers.toLocaleString());
    console.log("   ➕ Following:", profileData.following.toLocaleString());
    console.log("   📷 Posts:", profileData.posts_count);
    console.log("   🔒 Private:", profileData.is_private ? "Yes" : "No");
    console.log("   ✔️  Verified:", profileData.is_verified ? "Yes" : "No");
    
    if (profileData.bio) {
      console.log("   💬 Bio:", profileData.bio.substring(0, 80) + 
        (profileData.bio.length > 80 ? "..." : ""));
    }

    // 3️⃣ جلب المنشورات
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

    // 4️⃣ حفظ البيانات
    const outputFile = `${TARGET_USER}_data.json`;
    const fullData = {
      profile: profileData,
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

    if (err.message.includes("401") || err.message.includes("login")) {
      console.error("\n💡 Cookies expired or invalid!");
      console.error("   Solution: Get fresh cookies from your browser");
    } else if (err.message.includes("429")) {
      console.error("\n💡 Rate limited by Instagram!");
      console.error("   Solution: Wait 10-15 minutes and try again");
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
