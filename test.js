import { chromium } from "playwright";
import fs from "fs";
import fetch from "node-fetch";

const config = {
  username: "nannis_cakes",
  loginUsername: "abdallarroom13",
  loginPassword: "Az01027101373@#",
  postsLimit: 12,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function loginAndGetCookies() {
  console.log("🔐 تسجيل الدخول باستخدام Playwright...");

  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    viewport: { width: 1920, height: 1080 },
    locale: "en-US",
    timezoneId: "America/New_York",
  });

  const page = await context.newPage();

  try {
    console.log("📱 فتح Instagram...");
    await page.goto("https://www.instagram.com/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    await sleep(5000);

    // التحقق من خطأ 429
    const content = await page.content();
    if (content.includes("429") || content.includes("Too Many Requests")) {
      throw new Error("❌ خطأ 429 - IP محظور مؤقتاً. انتظر 30 دقيقة أو استخدم VPN");
    }

    console.log("🔍 البحث عن رابط تسجيل الدخول...");

    // محاولة النقر على رابط تسجيل الدخول
    try {
      await page.click('a[href="/accounts/login/"]', { timeout: 5000 });
      await sleep(5000);
    } catch (e) {
      console.log("⚠️ الانتقال مباشرة لصفحة تسجيل الدخول...");
      await page.goto("https://www.instagram.com/accounts/login/", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      await sleep(8000);
    }

    console.log("⌨️ البحث عن حقول الإدخال...");

    // الانتظار حتى ظهور حقل اسم المستخدم
    await page.waitForSelector('input[name="username"]', {
      state: "visible",
      timeout: 20000,
    });

    await sleep(2000);

    console.log("✍️ إدخال اسم المستخدم...");
    await page.fill('input[name="username"]', config.loginUsername);
    await sleep(1500);

    console.log("✍️ إدخال كلمة المرور...");
    await page.fill('input[name="password"]', config.loginPassword);
    await sleep(2000);

    console.log("🚀 الضغط على تسجيل الدخول...");

    // النقر على زر تسجيل الدخول
    await page.click('button[type="submit"]');

    console.log("⏳ انتظار اكتمال تسجيل الدخول...");
    await sleep(10000);

    // التحقق من نجاح تسجيل الدخول
    const currentUrl = page.url();
    console.log(`📍 الصفحة الحالية: ${currentUrl}`);

    if (currentUrl.includes("/accounts/login/")) {
      // البحث عن رسالة خطأ
      const errorElement = await page.$("#slfErrorAlert").catch(() => null);
      if (errorElement) {
        const errorText = await errorElement.textContent();
        throw new Error(`❌ خطأ في تسجيل الدخول: ${errorText}`);
      }
      throw new Error("❌ لا يزال في صفحة تسجيل الدخول - تحقق من البيانات");
    }

    // رفض "Save Login Info"
    try {
      console.log("🔍 البحث عن نافذة حفظ البيانات...");
      const notNowButton = await page.getByRole("button", { name: /not now/i });
      if (notNowButton) {
        await notNowButton.click({ timeout: 5000 });
        console.log("✋ رفض حفظ البيانات");
        await sleep(2000);
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة حفظ البيانات");
    }

    // رفض الإشعارات
    try {
      console.log("🔍 البحث عن نافذة الإشعارات...");
      const notNowButton2 = await page.getByRole("button", { name: /not now/i });
      if (notNowButton2) {
        await notNowButton2.click({ timeout: 5000 });
        console.log("✋ رفض الإشعارات");
        await sleep(2000);
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة إشعارات");
    }

    // الحصول على Cookies
    console.log("🍪 جلب Cookies...");
    const cookies = await context.cookies();

    // حفظ screenshot
    await page.screenshot({ path: "success-login.png", fullPage: true });
    console.log("📸 Screenshot: success-login.png");

    await browser.close();

    if (cookies.length === 0) {
      throw new Error("❌ فشل الحصول على Cookies");
    }

    // التحقق من sessionid
    const sessionId = cookies.find((c) => c.name === "sessionid");
    if (!sessionId) {
      throw new Error("❌ لا يوجد sessionid - فشل تسجيل الدخول");
    }

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ تم حفظ Cookies!");
    console.log(`   📊 عدد Cookies: ${cookies.length}`);

    return cookies;
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول:", error.message);

    try {
      await page.screenshot({ path: "error-login.png", fullPage: true });
      const html = await page.content();
      fs.writeFileSync("error-page.html", html);
      console.log("📸 تم حفظ: error-login.png و error-page.html");
    } catch (e) {}

    await browser.close();
    throw error;
  }
}

async function fetchInstagramAPI(endpoint, cookies) {
  // تحويل cookies من صيغة Playwright إلى string
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

  await sleep(2000);

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`❌ فشل: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("الرد:", text.slice(0, 300));

    if (res.status === 429) {
      throw new Error("❌ خطأ 429 - IP محظور. انتظر ساعة أو استخدم VPN");
    }

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

console.log("🚀 Instagram Scraper (Playwright)\n");

scrapeInstagram()
  .then(() => {
    console.log("\n✅ اكتمل بنجاح! 🎉");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل:", error.message);
    process.exit(1);
  });