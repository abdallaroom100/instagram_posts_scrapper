import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import { execSync } from "child_process";

const config = {
  username: "nannis_cakes",
  loginUsername: "abdallarroom13",
  loginPassword: "Az01027101373@#",
  postsLimit: 12,
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function findChrome() {
  const paths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ];

  for (const path of paths) {
    if (fs.existsSync(path)) {
      console.log(`✅ Chrome: ${path}`);
      return path;
    }
  }

  try {
    const result = execSync("which google-chrome-stable || which google-chrome", {
      encoding: "utf-8",
    }).trim();
    if (result) return result;
  } catch (e) {}

  return null;
}

async function loginAndGetCookies() {
  console.log("🔐 تسجيل الدخول...");

  const chromePath = findChrome();
  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromePath,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--single-process",
      "--no-zygote",
      "--window-size=1920,1080",
    ],
  });

  const page = await browser.newPage();

  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3] });
    window.chrome = { runtime: {} };
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  try {
    console.log("📱 فتح Instagram...");
    
    await page.goto("https://www.instagram.com/", {
      waitUntil: "networkidle0",
      timeout: 60000,
    });

    console.log("⏳ انتظار التحميل الكامل...");
    await sleep(8000);

    // البحث عن زر تسجيل الدخول
    try {
      console.log("🔍 البحث عن زر تسجيل الدخول...");
      await page.waitForSelector('a[href="/accounts/login/"]', { timeout: 5000 });
      await page.click('a[href="/accounts/login/"]');
      await sleep(5000);
    } catch (e) {
      console.log("⚠️ الانتقال مباشرة لصفحة تسجيل الدخول...");
      await page.goto("https://www.instagram.com/accounts/login/", {
        waitUntil: "networkidle0",
        timeout: 60000,
      });
      await sleep(8000);
    }

    console.log("⌨️ البحث عن الحقول...");

    // انتظر حتى يظهر أي input
    await page.waitForSelector("input", { timeout: 15000 });
    await sleep(3000);

    // احصل على جميع الـ inputs
    const inputs = await page.$$("input");
    console.log(`📊 عدد الحقول: ${inputs.length}`);

    if (inputs.length < 2) {
      throw new Error("❌ لم يتم العثور على حقول كافية");
    }

    console.log("✍️ إدخال البيانات...");

    // الحقل الأول = username
    await inputs[0].click({ clickCount: 3 });
    await sleep(500);
    await inputs[0].type(config.loginUsername, { delay: 150 });
    await sleep(1500);

    // الحقل الثاني = password
    await inputs[1].click({ clickCount: 3 });
    await sleep(500);
    await inputs[1].type(config.loginPassword, { delay: 150 });
    await sleep(2000);

    console.log("🚀 الضغط على تسجيل الدخول...");

    // البحث عن زر Submit
    try {
      const submitBtn = await page.$('button[type="submit"]');
      if (submitBtn) {
        await submitBtn.click();
      } else {
        await page.keyboard.press("Enter");
      }
    } catch (e) {
      await page.keyboard.press("Enter");
    }

    console.log("⏳ انتظار اكتمال تسجيل الدخول...");
    await sleep(10000);

    // التحقق من نجاح تسجيل الدخول
    const currentUrl = page.url();
    console.log(`📍 الصفحة الحالية: ${currentUrl}`);

    if (currentUrl.includes("/accounts/login/")) {
      // البحث عن رسالة خطأ
      const errorMsg = await page.$eval("#slfErrorAlert", (el) => el.textContent).catch(() => "");
      if (errorMsg) {
        throw new Error(`❌ خطأ في تسجيل الدخول: ${errorMsg}`);
      }
      console.log("⚠️ لا يزال في صفحة تسجيل الدخول - الانتظار أكثر...");
      await sleep(5000);
    }

    // التعامل مع "Save Login Info"
    try {
      console.log("🔍 البحث عن نافذة حفظ البيانات...");
      const notNowBtn = await page.waitForSelector(
        'button:has-text("Not Now"), button:has-text("not now"), div[role="button"]',
        { timeout: 5000 }
      );
      if (notNowBtn) {
        console.log("✋ رفض حفظ البيانات");
        await notNowBtn.click();
        await sleep(2000);
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة حفظ البيانات");
    }

    // التعامل مع الإشعارات
    try {
      console.log("🔍 البحث عن نافذة الإشعارات...");
      const notNowBtn2 = await page.waitForSelector(
        'button:has-text("Not Now"), div[role="button"]',
        { timeout: 5000 }
      );
      if (notNowBtn2) {
        console.log("✋ رفض الإشعارات");
        await notNowBtn2.click();
        await sleep(2000);
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة إشعارات");
    }

    // الحصول على Cookies
    console.log("🍪 جلب Cookies...");
    const cookies = await page.cookies();

    // حفظ screenshot
    await page.screenshot({ path: "success-login.png" });
    console.log("📸 تم حفظ screenshot: success-login.png");

    await browser.close();

    if (cookies.length === 0) {
      throw new Error("❌ فشل الحصول على Cookies");
    }

    // التحقق من sessionid
    const sessionId = cookies.find((c) => c.name === "sessionid");
    if (!sessionId) {
      throw new Error("❌ لم يتم تسجيل الدخول - لا يوجد sessionid");
    }

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ تم حفظ Cookies!");
    console.log(`   📊 عدد Cookies: ${cookies.length}`);
    return cookies;
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول:", error.message);

    try {
      await page.screenshot({ path: "error-login.png", fullPage: true });
      console.log("📸 تم حفظ screenshot: error-login.png");

      const html = await page.content();
      fs.writeFileSync("error-page.html", html);
      console.log("📄 تم حفظ HTML: error-page.html");
    } catch (e) {}

    await browser.close();
    throw error;
  }
}

async function fetchInstagramAPI(endpoint, cookies) {
  const cookieString = cookies.map((c) => `${c.name}=${c.value}`).join("; ");
  const csrfToken = cookies.find((c) => c.name === "csrftoken")?.value || "";

  if (!csrfToken) {
    throw new Error("❌ CSRF Token غير موجود");
  }

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Accept: "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://www.instagram.com/",
    "X-CSRFToken": csrfToken,
    "X-IG-App-ID": "936619743392459",
    "X-Requested-With": "XMLHttpRequest",
    Cookie: cookieString,
  };

  const url = `https://www.instagram.com${endpoint}`;
  console.log(`📡 طلب: ${endpoint}`);

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`❌ فشل: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("الرد:", text.slice(0, 300));
    throw new Error(`فشل الطلب: ${res.status}`);
  }

  return await res.json();
}

async function scrapeInstagram() {
  let cookies;

  if (fs.existsSync("cookies.json")) {
    console.log("📂 تحميل Cookies المحفوظة...");
    try {
      const cookiesData = fs.readFileSync("cookies.json", "utf-8");
      cookies = JSON.parse(cookiesData);

      const cookieAge = Date.now() - fs.statSync("cookies.json").mtimeMs;
      if (cookieAge > 24 * 60 * 60 * 1000) {
        console.log("⚠️ Cookies قديمة - تسجيل دخول جديد");
        cookies = await loginAndGetCookies();
      } else {
        console.log("✅ Cookies صالحة");
      }
    } catch (e) {
      console.log("⚠️ فشل تحميل Cookies");
      cookies = await loginAndGetCookies();
    }
  } else {
    cookies = await loginAndGetCookies();
  }

  try {
    console.log(`\n📊 جلب بيانات: ${config.username}...`);

    const profileData = await fetchInstagramAPI(
      `/api/v1/users/web_profile_info/?username=${config.username}`,
      cookies
    );

    if (!profileData.data || !profileData.data.user) {
      throw new Error("❌ فشل جلب البيانات");
    }

    const user = profileData.data.user;
    console.log("✅ تم جلب الملف الشخصي!");
    console.log(`   👤 ${user.full_name} (@${user.username})`);
    console.log(`   👥 ${user.edge_followed_by.count} متابع`);

    console.log("\n🖼️ جلب المنشورات...");
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
        profile_pic: user.profile_pic_url_hd,
        is_verified: user.is_verified,
        is_private: user.is_private,
      },
      posts:
        postsData.items?.map((post) => ({
          id: post.id,
          caption: post.caption?.text || "",
          image: post.image_versions2?.candidates[0]?.url || "",
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          timestamp: post.taken_at,
          post_url: `https://www.instagram.com/p/${post.code}/`,
        })) || [],
      scraped_at: new Date().toISOString(),
    };

    fs.writeFileSync("output.json", JSON.stringify(output, null, 2));
    console.log("\n✅ تم الحفظ: output.json");
    console.log(`📊 المنشورات: ${output.posts.length}`);
  } catch (err) {
    console.error("\n❌ خطأ:", err.message);

    if (err.message.includes("401") || err.message.includes("403")) {
      console.log("🔄 محاولة جديدة...");
      if (fs.existsSync("cookies.json")) {
        fs.unlinkSync("cookies.json");
      }
      return scrapeInstagram();
    }

    throw err;
  }
}

console.log("🚀 Instagram Scraper\n");
scrapeInstagram()
  .then(() => {
    console.log("\n✅ اكتمل بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل:", error.message);
    process.exit(1);
  });