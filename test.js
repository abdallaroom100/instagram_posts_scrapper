// import puppeteer from "puppeteer";
// import fs from "fs";
// import fetch from "node-fetch";

// const config = {
//   username: "abdallarroom13",
//   password: "Az01027101373@#",
//   targetUser: "nannis_cakes",
//   host: "https://www.instagram.com",
//   postsLimit: 9,
// };

// const COOKIES_FILE = "cookies.json";

// async function loginAndGetCookies() {
//   console.log("🔐 Logging into Instagram...");

//   const browser = await puppeteer.launch({
//     headless: true,
//     args: [
//       "--no-sandbox",
//       "--disable-setuid-sandbox",
//       "--disable-blink-features=AutomationControlled",
//       "--disable-dev-shm-usage",
//       "--window-size=1366,768",
//     ],
//   });

//   const page = await browser.newPage();

//   // 🧠 خبي خاصية webdriver عشان ما يكتشفوش الـ bot
//   await page.evaluateOnNewDocument(() => {
//     Object.defineProperty(navigator, "webdriver", { get: () => false });
//   });

//   await page.setUserAgent(
//     "Mozilla/5.0 (Windows NT 10.0; Win64; x64) " +
//       "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
//   );

//   console.log("🌍 Opening Instagram login...");
//   await page.goto(`${config.host}/accounts/login/`, {
//     waitUntil: "networkidle2",
//     timeout: 60000,
//   });

//   await page.waitForSelector('input[name="username"]', { timeout: 60000 });

//   console.log("⌨️ Typing credentials...");
//   await page.type('input[name="username"]', config.username, { delay: 20 });
//   await page.type('input[name="password"]', config.password, { delay: 20 });

//   await Promise.all([
//     page.click('button[type="submit"]'),
//     page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 }),
//   ]);

//   const currentUrl = page.url();
//   console.log("📍 Current URL:", currentUrl);

//   // ✅ تأكد إنه مش في صفحة challenge
//   if (currentUrl.includes("/challenge/")) {
//     throw new Error("Instagram triggered a login challenge. Please login manually once.");
//   }

//   const cookies = await page.cookies();
//   await fs.promises.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));

//   console.log("🍪 Cookies saved!");
//   await browser.close();

//   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// }

// async function loadCookies() {
//   if (!fs.existsSync(COOKIES_FILE)) return null;
//   const cookies = JSON.parse(await fs.promises.readFile(COOKIES_FILE, "utf8"));
//   return cookies.map(c => `${c.name}=${c.value}`).join("; ");
// }

// async function fetchInstagramAPI(endpoint, cookies) {
//   const headers = {
//     "User-Agent":
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
//     "Accept": "*/*",
//     "X-IG-App-ID": "936619743392459",
//     "Cookie": cookies,
//   };

//   const res = await fetch(`https://www.instagram.com${endpoint}`, { headers });
//   const text = await res.text();

//   if (!res.ok) {
//     throw new Error(`Failed: ${res.status} - ${text}`);
//   }

//   return JSON.parse(text);
// }

// async function scrapeInstagram() {
//   try {
//     let cookies = await loadCookies();
//     if (!cookies) cookies = await loginAndGetCookies();

//     console.log(`📊 Fetching profile for ${config.targetUser}...`);
//     const { data } = await fetchInstagramAPI(
//       `/api/v1/users/web_profile_info/?username=${config.targetUser}`,
//       cookies
//     );

//     const user = data.user;
//     if (!user) throw new Error("Could not extract profile data!");

//     console.log(`📸 Fetching posts for ${user.username}...`);
//     const { items } = await fetchInstagramAPI(
//       `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
//       cookies
//     );

//     const posts = items.map((post) => ({
//       id: post.id,
//       image: post.image_versions2?.candidates?.[0]?.url || "",
//       caption: post.caption?.text || "",
//       likes: post.like_count || 0,
//       comments: post.comment_count || 0,
//     }));

//     const result = { profile: user, posts };
//     fs.writeFileSync(`${config.targetUser}_data.json`, JSON.stringify(result, null, 2));

//     console.log(`💾 Data saved to ${config.targetUser}_data.json`);
//   } catch (err) {
//     console.error("❌ Error:", err.message);
//     console.error("💡 Tip: If you get blocked, delete cookies.json and re-login.");
//   }
// }

// scrapeInstagram();
// instagram_playwright.js
import { chromium } from "playwright";
import fs from "fs/promises";
import path from "path";

const COOKIES_FILE = path.resolve("./cookies.json");
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

// ====== CONFIG ======
const CONFIG = {
  username: "abdallarroom13",        // حسابك (للدخول)
  password: "Az01027101373@#",      // الباسورد
  targetUser: "nannis_cakes",       // الحساب اللي عايز تجيب له البيانات
  postsLimit: 9,
  headless: true,                   // false لو عايز تشوف المتصفح أثناء التطوير
};
// ===================

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function loginAndSaveCookies() {
  console.log("🔐 Logging into Instagram with Playwright...");

  const browser = await chromium.launch({
    headless: CONFIG.headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--window-size=1366,768",
    ],
  });

  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1280, height: 800 },
  });

  const page = await context.newPage();

  try {
    await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "domcontentloaded", timeout: 60000 });
  } catch (e) {
    console.warn("⚠️ goto login may have timed out but continuing...");
  }

  // small wait for dynamic elements
  await page.waitForTimeout(1500);

  // try close cookie banners if present (multiple possibilities)
  try {
    const cookieSelectors = [
      'text=Allow all',
      'text=Allow all cookies',
      'text=Accept all',
      'text=Accept',
      'text=Allow essential cookies',
      'text=Only essential',
    ];
    for (const sel of cookieSelectors) {
      const loc = page.locator(sel);
      if (await loc.isVisible({ timeout: 1200 }).catch(() => false)) {
        await loc.click().catch(() => null);
        console.log("🍪 Closed cookie banner:", sel);
        break;
      }
    }
  } catch {}

  // wait for username input
  try {
    await page.waitForSelector('input[name="username"]', { timeout: 45000 });
  } catch (err) {
    await browser.close();
    throw new Error("Timeout waiting for username input — possibly challenge or page layout changed.");
  }

  // type credentials
  await page.fill('input[name="username"]', CONFIG.username, { timeout: 10000 });
  await page.fill('input[name="password"]', CONFIG.password, { timeout: 10000 });

  // submit and wait for navigation OR URL change
  try {
    await Promise.all([
      page.click('button[type="submit"]'),
      // sometimes navigation doesn't happen — wait either for URL change or network idle
      page.waitForResponse((r) => r.url().includes("/accounts/") && [200, 302, 400, 429].includes(r.status()), { timeout: 30000 }).catch(() => null),
    ]);
  } catch (e) {
    // ignore — we'll wait for URL change below
  }

  // wait until not on /accounts/login/ (gives time for redirect/challenges)
  try {
    await page.waitForFunction(() => !window.location.pathname.includes("/accounts/login"), { timeout: 60000 });
  } catch {
    // continue to check current URL
  }

  const currentUrl = page.url();
  console.log("📍 Current URL:", currentUrl);

  // if challenge page detected -> inform user and save cookies as-is (if any)
  if (currentUrl.includes("/challenge/")) {
    console.warn("⚠️ Instagram challenge detected. You must complete verification manually (headless:false) at least once.");
    const cookiesPartial = await context.cookies();
    // save whatever cookies we have (may not be fully valid)
    await fs.writeFile(COOKIES_FILE, JSON.stringify(cookiesPartial, null, 2));
    await browser.close();
    throw new Error("Login blocked by challenge. Complete challenge manually once then re-run.");
  }

  // wait a bit to let session stabilize
  await page.waitForTimeout(3000);

  // get cookies array and save file in the full cookie-object format the user wanted
  const cookies = await context.cookies();
  await fs.writeFile(COOKIES_FILE, JSON.stringify(cookies, null, 2));
  console.log(`🍪 Saved ${cookies.length} cookies to ${COOKIES_FILE}`);

  await browser.close();
  return cookies;
}

async function useCookiesAndScrape(cookies) {
  console.log("🚀 Using saved cookies to fetch profile & posts via page context...");

  const browser = await chromium.launch({ headless: CONFIG.headless, args: ["--no-sandbox"] });
  const context = await browser.newContext({ userAgent: USER_AGENT, viewport: { width: 1280, height: 800 } });

  // Add cookies to context
  // Playwright expects cookie objects with at least: name, value, domain, path
  // Our saved cookies should match that shape; ensure domain is correct (no leading scheme)
  const normalized = cookies.map((c) => {
    // ensure domain doesn't include scheme
    const cookie = { ...c };
    if (cookie.domain && cookie.domain.startsWith("http")) {
      try {
        cookie.domain = new URL(cookie.domain).hostname;
      } catch {}
    }
    // Playwright requires 'sameSite' values like 'Lax'|'Strict'|'None' or undefined
    if (cookie.sameSite && cookie.sameSite === "None") cookie.sameSite = "None";
    return cookie;
  });

  await context.addCookies(normalized);

  const page = await context.newPage();

  // navigate to target profile (cookies will be used automatically)
  const profileUrl = `https://www.instagram.com/${CONFIG.targetUser}/`;
  await page.goto(profileUrl, { waitUntil: "networkidle", timeout: 60000 });

  // wait a little
  await page.waitForTimeout(1500);

  // inside page, use fetch (browser context) to call the web endpoints — cookies + headers will be correct
  const result = await page.evaluate(
    async (targetUser, postsLimit) => {
      // helper to call endpoints with same-origin fetch
      async function callApi(endpoint) {
        const res = await fetch(endpoint, {
          credentials: "same-origin",
          headers: {
            "X-Requested-With": "XMLHttpRequest",
          },
        });
        const text = await res.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          return { __raw: text, __status: res.status };
        }
      }

      // 1) profile info
      const profileRes = await callApi(`/api/v1/users/web_profile_info/?username=${encodeURIComponent(targetUser)}`);
      // 2) posts via GraphQL web endpoint (query_hash for timeline media)
      // query_hash used commonly for timeline_media
      const queryHash = "69cba40317214236af40e7efa697781d";
      const variables = { id: profileRes?.data?.user?.id, first: postsLimit };
      const postsRes = await callApi(`/graphql/query/?query_hash=${queryHash}&variables=${encodeURIComponent(JSON.stringify(variables))}`);

      return { profileRes, postsRes };
    },
    CONFIG.targetUser,
    CONFIG.postsLimit
  );

  await browser.close();
  return result;
}

async function main() {
  try {
    let cookies;
    if (await fileExists(COOKIES_FILE)) {
      console.log("🍪 cookies.json exists — loading...");
      const raw = await fs.readFile(COOKIES_FILE, "utf8");
      cookies = JSON.parse(raw);
    } else {
      cookies = await loginAndSaveCookies();
    }

    // Try scraping with the cookies
    const scraped = await useCookiesAndScrape(cookies);

    // handle profile response
    if (!scraped.profileRes || scraped.profileRes.__status) {
      console.error("❌ Profile fetch failed or returned non-JSON. Response:", scraped.profileRes?.__raw || scraped.profileRes);
      // If the response suggests require_login or 401/400, remove cookies and suggest full re-login
      if (scraped.profileRes?.__raw?.includes?.("Please wait") || (scraped.profileRes?.__status && [401, 403, 400].includes(scraped.profileRes.__status))) {
        console.log("🧹 Deleting cookies.json and attempting fresh login next run.");
        await fs.unlink(COOKIES_FILE).catch(() => {});
      }
      return;
    }

    const user = scraped.profileRes.data.user;
    const profileData = {
      username: user.username,
      full_name: user.full_name,
      bio: user.biography,
      profile_pic: user.profile_pic_url || user.profile_pic_url_hd,
      followers: user.edge_followed_by?.count || 0,
      following: user.edge_follow?.count || 0,
      posts_count: user.edge_owner_to_timeline_media?.count || 0,
      is_private: user.is_private || false,
      user_id: user.id,
    };

    // handle posts response
    if (!scraped.postsRes || scraped.postsRes.__status) {
      console.error("❌ Posts fetch failed or returned non-JSON. Response:", scraped.postsRes?.__raw || scraped.postsRes);
      // still save profile
      await fs.writeFile(`${CONFIG.targetUser}_data.json`, JSON.stringify({ profile: profileData, posts: [] }, null, 2));
      console.log(`💾 Saved profile only to ${CONFIG.targetUser}_data.json`);
      return;
    }

    // extract posts from GraphQL response (edges)
    const edges = scraped.postsRes.data?.user?.edge_owner_to_timeline_media?.edges || [];
    const posts = edges.map((edge) => {
      const p = edge.node;
      return {
        id: p.id,
        shortcode: p.shortcode,
        caption: p.edge_media_to_caption?.edges?.[0]?.node?.text || "",
        display_url: p.display_url,
        is_video: p.is_video,
        likes: p.edge_liked_by?.count || 0,
        comments: p.edge_media_to_comment?.count || 0,
        url: `https://www.instagram.com/p/${p.shortcode}/`,
      };
    });

    const output = { profile: profileData, posts };
    await fs.writeFile(`${CONFIG.targetUser}_data.json`, JSON.stringify(output, null, 2));
    console.log(`✅ Data saved to ${CONFIG.targetUser}_data.json (profile + ${posts.length} posts)`);
  } catch (err) {
    console.error("❌ Fatal error:", err.message || err);
  }
}

main();
