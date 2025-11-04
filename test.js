import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import { execSync } from "child_process";

const config = {
  username: "nannis_cakes",
  loginUsername: "abdallarroom13",
  loginPassword: "Az01027101373@#",
  postsLimit: 12,
  useProxy: false, // غير إلى true إذا كان لديك proxy
  proxyUrl: "", // مثال: "http://proxy-server:port"
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
  console.log("⚠️ ملاحظة: إذا حصل خطأ 429، انتظر 30 دقيقة أو استخدم VPN/Proxy");

  const chromePath = findChrome();
  const launchArgs = [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-blink-features=AutomationControlled",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--window-size=1920,1080",
    // إضافة headers لتبدو أكثر واقعية
    "--disable-features=IsolateOrigins,site-per-process",
    "--disable-web-security",
  ];

  if (config.useProxy && config.proxyUrl) {
    launchArgs.push(`--proxy-server=${config.proxyUrl}`);
    console.log(`🌐 استخدام Proxy: ${config.proxyUrl}`);
  }

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: chromePath,
    args: launchArgs,
  });

  const page = await browser.newPage();

  // حذف آثار التشغيل الآلي
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    Object.defineProperty(navigator, "plugins", { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, "languages", { get: () => ["en-US", "en", "ar"] });
    window.chrome = { runtime: {} };
    
    // إخفاء automation
    delete navigator.__proto__.webdriver;
  });

  // User agent واقعي
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  // إضافة extra headers
  await page.setExtraHTTPHeaders({
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Connection": "keep-alive",
    "Upgrade-Insecure-Requests": "1",
  });

  try {
    console.log("📱 فتح Instagram (محاولة بطيئة لتجنب الحظر)...");
    
    // فتح الصفحة الرئيسية أولاً
    await page.goto("https://www.instagram.com/", {
      waitUntil: "networkidle2",
      timeout: 90000,
    });

    console.log("⏳ انتظار طويل (15 ثانية) لتجنب الكشف...");
    await sleep(15000);

    // التحقق من وجود خطأ 429
    const pageContent = await page.content();
    if (pageContent.includes("429") || pageContent.includes("Too Many Requests")) {
      throw new Error("❌ Instagram حظر الـ IP مؤقتاً (429). انتظر 30-60 دقيقة أو استخدم VPN");
    }

    // البحث عن رابط تسجيل الدخول
    try {
      console.log("🔍 البحث عن رابط تسجيل الدخول...");
      const loginLink = await page.waitForSelector('a[href="/accounts/login/"]', { 
        timeout: 10000 
      });
      
      if (loginLink) {
        console.log("✅ تم العثور على الرابط - النقر عليه");
        await loginLink.click();
        await sleep(8000);
      }
    } catch (e) {
      console.log("⚠️ الانتقال مباشرة لصفحة تسجيل الدخول...");
      await page.goto("https://www.instagram.com/accounts/login/", {
        waitUntil: "networkidle2",
        timeout: 90000,
      });
      await sleep(10000);
    }

    // التحقق مرة أخرى من 429
    const loginPageContent = await page.content();
    if (loginPageContent.includes("429") || loginPageContent.includes("Too Many Requests")) {
      throw new Error("❌ خطأ 429 في صفحة تسجيل الدخول. استخدم VPN أو انتظر");
    }

    console.log("⌨️ البحث عن حقول الإدخال...");

    // انتظار ظهور الحقول
    await page.waitForSelector("input", { timeout: 20000 });
    await sleep(3000);

    // الحصول على الحقول
    const inputs = await page.$$("input");
    console.log(`📊 عدد الحقول: ${inputs.length}`);

    if (inputs.length < 2) {
      throw new Error("❌ لم يتم العثور على حقول كافية");
    }

    console.log("✍️ إدخال اسم المستخدم (ببطء)...");
    await inputs[0].click({ clickCount: 3 });
    await sleep(800);
    
    // كتابة حرف حرف لتقليد الإنسان
    for (const char of config.loginUsername) {
      await inputs[0].type(char, { delay: 100 + Math.random() * 100 });
      await sleep(50);
    }
    
    await sleep(2000);

    console.log("✍️ إدخال كلمة المرور (ببطء)...");
    await inputs[1].click({ clickCount: 3 });
    await sleep(800);
    
    for (const char of config.loginPassword) {
      await inputs[1].type(char, { delay: 100 + Math.random() * 100 });
      await sleep(50);
    }
    
    await sleep(3000);

    console.log("🚀 محاولة تسجيل الدخول...");

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

    console.log("⏳ انتظار اكتمال تسجيل الدخول (20 ثانية)...");
    await sleep(20000);

    // التحقق من النجاح
    const finalUrl = page.url();
    console.log(`📍 الصفحة النهائية: ${finalUrl}`);

    const finalContent = await page.content();
    
    // التحقق من الأخطاء المحتملة
    if (finalContent.includes("429")) {
      throw new Error("❌ خطأ 429 بعد تسجيل الدخول. IP محظور مؤقتاً");
    }
    
    if (finalContent.includes("checkpoint_required")) {
      throw new Error("❌ Instagram يطلب تحقق إضافي. سجل دخول من المتصفح أولاً");
    }

    if (finalUrl.includes("/accounts/login/")) {
      const errorMsg = await page.$eval("#slfErrorAlert", (el) => el.textContent).catch(() => "");
      if (errorMsg) {
        throw new Error(`❌ خطأ: ${errorMsg}`);
      }
      throw new Error("❌ فشل تسجيل الدخول - تحقق من البيانات");
    }

    // رفض النوافذ المنبثقة
    await sleep(3000);
    
    try {
      const notNowButtons = await page.$$('button, div[role="button"]');
      for (const btn of notNowButtons) {
        const text = await btn.evaluate(el => el.textContent);
        if (text && text.includes("Not Now")) {
          console.log("✋ رفض نافذة منبثقة");
          await btn.click();
          await sleep(2000);
          break;
        }
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نوافذ منبثقة");
    }

    // الحصول على Cookies
    console.log("🍪 جلب Cookies...");
    const cookies = await page.cookies();

    await page.screenshot({ path: "success-login.png" });
    console.log("📸 Screenshot: success-login.png");

    await browser.close();

    if (cookies.length === 0) {
      throw new Error("❌ فشل الحصول على Cookies");
    }

    const sessionId = cookies.find((c) => c.name === "sessionid");
    if (!sessionId) {
      throw new Error("❌ لا يوجد sessionid - فشل تسجيل الدخول");
    }

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ تم حفظ Cookies!");
    console.log(`   📊 عدد Cookies: ${cookies.length}`);
    
    return cookies;

  } catch (error) {
    console.error("❌ خطأ:", error.message);

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

  // إضافة delay بين الطلبات
  await sleep(2000);

  const res = await fetch(url, { headers });

  if (!res.ok) {
    console.error(`❌ فشل: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("الرد:", text.slice(0, 300));
    
    if (res.status === 429) {
      throw new Error("❌ خطأ 429 - IP محظور. استخدم VPN أو انتظر ساعة");
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

console.log("🚀 Instagram Scraper\n");
console.log("⚠️ تحذير: إذا ظهر خطأ 429، جرب:");
console.log("   1. انتظر 30-60 دقيقة");
console.log("   2. استخدم VPN");
console.log("   3. استخدم الطريقة البديلة: npm install instagram-private-api\n");

scrapeInstagram()
  .then(() => {
    console.log("\n✅ اكتمل بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل:", error.message);
    process.exit(1);
  });