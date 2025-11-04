import puppeteer from "puppeteer";
import fs from "fs";
import fetch from "node-fetch";
import { resolve } from "path";

// ⚙️ الإعدادات
const config = {
  username: "nannis_cakes", // الحساب المستهدف
  loginUsername: "abdallarroom13", // حسابك
  loginPassword: "Az01027101373@#", // كلمة المرور
  postsLimit: 12,
};

// 🔐 تسجيل الدخول والحصول على Cookies
async function loginAndGetCookies() {
  console.log("🔐 جاري تسجيل الدخول...");
  
  const browser = await puppeteer.launch({
    headless: "new", // استخدم الوضع الجديد
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--window-size=1920,1080",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    ],
  });

  const page = await browser.newPage();

  // 🎭 إخفاء علامات التشغيل الآلي
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
    });
  });

  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  await page.setViewport({ width: 1920, height: 1080 });

  try {
    console.log("📱 فتح صفحة تسجيل الدخول...");
    await page.goto("https://www.instagram.com/accounts/login/", {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // ⏰ انتظار تحميل الصفحة
    await new Promise(resolve=>setTimeout(resolve, 3000))


    // 🔍 البحث عن حقل اسم المستخدم بطرق متعددة
    console.log("⌨️ إدخال بيانات تسجيل الدخول...");
    
    const usernameInput = await page.waitForSelector(
      'input[name="username"]',
      { visible: true, timeout: 30000 }
    ).catch(async () => {
      // جرب selector بديل
      return await page.waitForSelector(
        'input[aria-label*="Phone"], input[aria-label*="username"]',
        { visible: true, timeout: 10000 }
      );
    });

    // إدخال البيانات ببطء (تقليد الإنسان)
    await page.type('input[name="username"]', config.loginUsername, { delay: 100 });
    await new Promise(resolve=>setTimeout(resolve, 1000))
    
    await page.type('input[name="password"]', config.loginPassword, { delay: 100 });
        await new Promise(resolve=>setTimeout(resolve, 1500))

    // الضغط على زر تسجيل الدخول
    console.log("🚀 الضغط على تسجيل الدخول...");
    await page.keyboard.press("Enter");

    // انتظار اكتمال تسجيل الدخول
    await page.waitForNavigation({ 
      waitUntil: "networkidle2", 
      timeout: 60000 
    }).catch(() => console.log("⚠️ Navigation timeout - continuing..."));
    await new Promise(resolve=>setTimeout(resolve, 3000))

    // التعامل مع نافذة "Save Login Info"
    try {
      const notNowButton = await page.waitForSelector(
        'button:has-text("Not Now"), button:has-text("not now")',
        { timeout: 5000 }
      );
      if (notNowButton) {
        await notNowButton.click();
    await new Promise(resolve=>setTimeout(resolve, 3000))
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة حفظ البيانات");
    }

    // التعامل مع نافذة الإشعارات
    try {
      const notNowButton2 = await page.waitForSelector(
        'button:has-text("Not Now")',
        { timeout: 5000 }
      );
      if (notNowButton2) {
        await notNowButton2.click();
    await new Promise(resolve=>setTimeout(resolve, 2000))
      }
    } catch (e) {
      console.log("ℹ️ لا توجد نافذة إشعارات");
    }

    // الحصول على Cookies
    const cookies = await page.cookies();
    await browser.close();

    if (cookies.length === 0) {
      throw new Error("❌ فشل الحصول على Cookies");
    }

    fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
    console.log("✅ تم حفظ Cookies بنجاح!");
    return cookies;

  } catch (error) {
    console.error("❌ خطأ في تسجيل الدخول:", error.message);
    
    // حفظ screenshot للتشخيص
    try {
      await page.screenshot({ path: "error-login.png" });
      console.log("📸 تم حفظ screenshot في: error-login.png");
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
    throw new Error("❌ CSRF Token غير موجود - الـ cookies غير صالحة");
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
    console.error(`❌ فشل الطلب: ${res.status} ${res.statusText}`);
    const text = await res.text();
    console.log("الرد:", text.slice(0, 300));
    throw new Error(`فشل الطلب: ${res.status}`);
  }

  return await res.json();
}

// 🕷️ استخراج البيانات من Instagram
async function scrapeInstagram() {
  let cookies;

  // التحقق من وجود cookies محفوظة
  if (fs.existsSync("cookies.json")) {
    console.log("📂 تحميل Cookies المحفوظة...");
    try {
      const cookiesData = fs.readFileSync("cookies.json", "utf-8");
      cookies = JSON.parse(cookiesData);
      
      // التحقق من صلاحية الـ cookies (عمرها أقل من 24 ساعة)
      const cookieAge = Date.now() - fs.statSync("cookies.json").mtimeMs;
      if (cookieAge > 24 * 60 * 60 * 1000) {
        console.log("⚠️ Cookies قديمة - سيتم تسجيل الدخول من جديد");
        cookies = await loginAndGetCookies();
      } else {
        console.log("✅ Cookies صالحة");
      }
    } catch (e) {
      console.log("⚠️ فشل تحميل Cookies - سيتم تسجيل الدخول");
      cookies = await loginAndGetCookies();
    }
  } else {
    cookies = await loginAndGetCookies();
  }

  try {
    console.log(`\n📊 جلب بيانات الحساب: ${config.username}...`);
    
    const profileData = await fetchInstagramAPI(
      `/api/v1/users/web_profile_info/?username=${config.username}`,
      cookies
    );

    if (!profileData.data || !profileData.data.user) {
      throw new Error("❌ فشل جلب بيانات الملف الشخصي");
    }

    const user = profileData.data.user;
    console.log("✅ تم جلب الملف الشخصي بنجاح!");
    console.log(`   👤 ${user.full_name} (@${user.username})`);
    console.log(`   👥 متابعين: ${user.edge_followed_by.count}`);
    console.log(`   📝 السيرة الذاتية: ${user.biography?.slice(0, 50) || "لا يوجد"}...`);

    console.log("\n🖼️ جلب المنشورات...");
    const postsData = await fetchInstagramAPI(
      `/api/v1/feed/user/${user.id}/?count=${config.postsLimit}`,
      cookies
    );

    if (!postsData.items || postsData.items.length === 0) {
      console.log("⚠️ لا توجد منشورات");
    }

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
      posts: postsData.items?.map((post) => ({
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
    console.log("\n✅ تم الحفظ بنجاح في: output.json");
    console.log(`📊 عدد المنشورات: ${output.posts.length}`);

  } catch (err) {
    console.error("\n❌ خطأ في استخراج البيانات:", err.message);
    
    // إذا فشل الطلب بسبب cookies غير صالحة، حاول تسجيل الدخول مرة أخرى
    if (err.message.includes("401") || err.message.includes("403")) {
      console.log("🔄 محاولة تسجيل الدخول مرة أخرى...");
      fs.unlinkSync("cookies.json");
      return scrapeInstagram(); // إعادة المحاولة
    }
    
    throw err;
  }
}

// 🚀 تشغيل السكريبت
console.log("🚀 بدء Instagram Scraper...\n");
scrapeInstagram()
  .then(() => {
    console.log("\n✅ اكتمل بنجاح!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل السكريبت:", error.message);
    process.exit(1);
  });