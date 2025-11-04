import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import { execSync } from "child_process";
import { resolve } from "path";

// ⚙️ الإعدادات
const config = {
  username: "nannis_cakes",
  loginUsername: "abdallarroom13",
  loginPassword: "Az01027101373@#",
  postsLimit: 12,
};

// 🔍 البحث عن مسار Chrome
function findChrome() {
  const paths = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/snap/bin/chromium",
  ];

  for (const path of paths) {
    if (fs.existsSync(path)) {
      console.log(`✅ تم العثور على Chrome: ${path}`);
      return path;
    }
  }

  // محاولة البحث باستخدام which
  try {
    const result = execSync("which google-chrome-stable || which google-chrome || which chromium", {
      encoding: "utf-8",
    }).trim();
    if (result) {
      console.log(`✅ تم العثور على Chrome: ${result}`);
      return result;
    }
  } catch (e) {}

  console.log("❌ لم يتم العثور على Chrome - سيتم استخدام الإعدادات الافتراضية");
  return null;
}

// 🔐 تسجيل الدخول والحصول على Cookies
async function loginAndGetCookies() {
  console.log("🔐 جاري تسجيل الدخول...");

  const chromePath = findChrome();
  const launchOptions = {
    headless: "new",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      "--disable-gpu",
      "--window-size=1920,1080",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    ],
  };

  if (chromePath) {
    launchOptions.executablePath = chromePath;
  }

  const browser = await puppeteer.launch(launchOptions);
  const page = await browser.newPage();

  // 🎭 إخفاء علامات Bot
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en"] });
    window.chrome = { runtime: {} };
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log("📱 فتح صفحة تسجيل الدخول...");
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "domcontentloaded",
      timeout: 60000,
    });

    // انتظار التحميل
    await new Promise(resolve=>setTimeout(resolve,5000))
  await new Promise(resolve=>setTimeout(resolve,5000))

    console.log("⌨️ البحث عن حقل اسم المستخدم...");

    // محاولة عدة طرق للعثور على الحقل
    let usernameInput;
    try {
      // الطريقة 1: بالاسم
      usernameInput = await page.waitForSelector('input[name="username"]', {
        visible: true,
        timeout: 10000,
      });
    } catch (e1) {
      console.log("⚠️ محاولة selector بديل...");
      try {
        // الطريقة 2: بالـ aria-label
        usernameInput = await page.waitForSelector(
          'input[aria-label*="username"], input[aria-label*="Phone"]',
          { visible: true, timeout: 10000 }
        );
      } catch (e2) {
        // الطريقة 3: أي input type=text
        console.log("⚠️ محاولة selector عام...");
        await new Promise(resolve=>setTimeout(resolve,3000))
        usernameInput = await page.$('input[type="text"]');
      }
    }

    if (!usernameInput) {
      throw new Error("❌ لم يتم العثور على حقل اسم المستخدم");
    }

    console.log("✅ تم العثور على الحقول");

    // مسح أي قيم موجودة
    await page.evaluate(() => {
      const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
      inputs.forEach((input) => (input.value = ""));
    });

 await new Promise(resolve=>setTimeout(resolve,1000))

    // إدخال البيانات ببطء
    console.log("✍️ إدخال اسم المستخدم...");
    await page.focus('input[name="username"]');
    await page.keyboard.type(config.loginUsername, { delay: 120 });
 await new Promise(resolve=>setTimeout(resolve,1500))

    console.log("✍️ إدخال كلمة المرور...");
    await page.focus('input[name="password"]');
    await page.keyboard.type(config.loginPassword, { delay: 120 });
 await new Promise(resolve=>setTimeout(resolve,2000))

    console.log("🚀 الضغط على تسجيل الدخول...");
    
    // محاولة الضغط على الزر بطرق مختلفة
    try {
      await page.click('button[type="submit"]');
    } catch (e) {
      await page.keyboard.press("Enter");
    }

    // انتظار التوجيه
    console.log("⏳ انتظار اكتمال تسجيل الدخول...");
 await new Promise(resolve=>setTimeout(resolve,8000))

    // التحقق من نجاح تسجيل الدخول
    const currentUrl = page.url();
    console.log(`📍 الصفحة الحالية: ${currentUrl}`);

    if (currentUrl.includes("/accounts/login/")) {
      // قد يكون هناك خطأ في البيانات
      const errorMsg = await page
        .$eval("#slfErrorAlert", (el) => el.textContent)
        .catch(() => "");
      if (errorMsg) {
        throw new Error(`❌ خطأ في تسجيل الدخول: ${errorMsg}`);
      }
      console.log("⚠️ لا يزال في صفحة تسجيل الدخول - الانتظار أكثر...");
  await new Promise(resolve=>setTimeout(resolve,5000))
    }

    // التعامل مع "Save Login Info"
    try {
      console.log("🔍 البحث عن نافذة حفظ البيانات...");
      const notNowBtn = await page.waitForSelector(
        'button:has-text("Not Now"), button:has-text("not now"), div[role="button"]:has-text("Not Now")',
        { timeout: 5000 }
      );
      if (notNowBtn) {
        console.log("✋ رفض حفظ البيانات");
        await notNowBtn.click();
      await new Promise(resolve=>setTimeout(resolve,2000))
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة حفظ البيانات");
    }

    // التعامل مع الإشعارات
    try {
      console.log("🔍 البحث عن نافذة الإشعارات...");
      const notNowBtn2 = await page.waitForSelector(
        'button:has-text("Not Now"), div[role="button"]:has-text("Not Now")',
        { timeout: 5000 }
      );
      if (notNowBtn2) {
        console.log("✋ رفض الإشعارات");
        await notNowBtn2.click();
      await new Promise(resolve=>setTimeout(resolve,2000))
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة إشعارات");
    }

    // الحصول على Cookies
    console.log("🍪 جلب Cookies...");
    const cookies = await page.cookies();

    // حفظ screenshot للتأكيد
    await page.screenshot({ path: "success-login.png" });
    console.log("📸 تم حفظ screenshot: success-login.png");

    await browser.close();

    if (cookies.length === 0) {
      throw new Error("❌ فشل الحصول على Cookies");
    }

    // التحقق من وجود sessionid
    const sessionId = cookies.find((c) => c.name === "sessionid");
    if (!sessionId) {
      throw new Error("❌ لم يتم تسجيل الدخول بنجاح - لا يوجد sessionid");
    }

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ تم حفظ Cookies بنجاح!");
    console.log(`   📊 عدد Cookies: ${cookies.length}`);
    return cookies;
  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول:", error.message);

    try {
      await page.screenshot({ path: "error-login.png", fullPage: true });
      console.log("📸 تم حفظ screenshot: error-login.png");

      // حفظ HTML للتشخيص
      const html = await page.content();
      fs.writeFileSync("error-page.html", html);
      console.log("📄 تم حفظ HTML: error-page.html");
    } catch (e) {}

    await browser.close();
    throw error;
  }
}

// 📡 جلب البيانات من Instagram API
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

// 🕷️ استخراج البيانات
async function scrapeInstagram() {
  let cookies;

  // تحميل أو إنشاء cookies
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

// 🚀 تشغيل
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