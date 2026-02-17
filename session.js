
import {connect} from "puppeteer-real-browser"
import fs from "fs"

// ⚠️ تحذير: لا تضع كلمات المرور في الكود مباشرة في بيئة العمل الحقيقية
const config = {
    targetUsername: "nannis_cakes", // الحساب الذي تريد سحب بياناته
    myUsername: "YOUR_USERNAME",     // حسابك
    myPassword: "YOUR_PASSWORD",     // كلمة مرورك
};
const BRAVE_PATH = "C:\\Program Files\\BraveSoftware\\Brave-Browser\\Application\\brave.exe";
async function startScraper() {
    console.log("🚀 Starting Real Browser...");

    // 1. الاتصال بمتصفح حقيقي لتخطي الحماية
    const { browser, page } = await connect({
        headless: false,
            args: ["--start-maximized"],
            turnstile: true,
            disableXvfb: false,
            customConfig: {
              chromePath:BRAVE_PATH,
              userDataDir:"/"
            },

        connectOption: {
               
                browserURL:BRAVE_PATH 
                
            }
    });

    try {
        // 2. إدارة ملفات تعريف الارتباط (Cookies)
        if (fs.existsSync("cookies.json")) {
            const cookies = JSON.parse(fs.readFileSync("cookies.json"));
            await page.setCookie(...cookies);
            console.log("🍪 Cookies loaded.");
        }

        // 3. الذهاب لصفحة تسجيل الدخول (فقط للتحقق)
        await page.goto("https://www.instagram.com/", { waitUntil: "networkidle2" });

        // التحقق مما إذا كنا بحاجة لتسجيل الدخول
        const isLoggedIn = await page.$('svg[aria-label="Home"]'); 
        
        if (!isLoggedIn) {
            console.log("🔐 Logging in...");
            await page.goto("https://www.instagram.com/accounts/login/", { waitUntil: "networkidle2" });
            
            await new Promise(r => setTimeout(r, 2000)); // انتظار بشري

            await page.type('input[name="username"]', config.myUsername, { delay: 100 });
            await page.type('input[name="password"]', config.myPassword, { delay: 100 });
            
            await page.keyboard.press("Enter");
            await page.waitForNavigation({ waitUntil: "networkidle2" });
            
            // حفظ الكوكيز الجديدة
            const cookies = await page.cookies();
            fs.writeFileSync("cookies.json", JSON.stringify(cookies, null, 2));
            console.log("🍪 New cookies saved.");
        } else {
            console.log("✅ Already logged in.");
        }

        // 4. الذهاب لصفحة الهدف
        console.log(`🔍 Navigating to ${config.targetUsername}...`);
        await page.goto(`https://www.instagram.com/${config.targetUsername}/`, { waitUntil: "networkidle2" });

        // 5. تنفيذ الـ API Fetch من داخل المتصفح (الحل السحري للـ 429)
        // نقوم بحقن كود جافاسكريبت داخل الصفحة الحالية لاستخدام نفس الجلسة
        const data = await page.evaluate(async (targetUser) => {
            const wait = (ms) => new Promise(res => setTimeout(res, ms));
            
            // محاولة استخراج App ID من الصفحة (أحياناً يكون ضرورياً)
            const appId = "936619743392459"; // معرف تطبيق الويب القياسي

            // دالة مساعدة للطلب من الداخل
            async function internalFetch(url) {
                const response = await fetch(url, {
                    headers: {
                        "X-IG-App-ID": appId,
                        "X-Requested-With": "XMLHttpRequest",
                        "X-ASBD-ID": "129477", // معرف حماية إضافي
                    }
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                return response.json();
            }

            // جلب معلومات البروفايل
            // ملاحظة: نستخدم هذا الرابط لأنه يعمل بشكل جيد من داخل المتصفح
            const profileUrl = `/api/v1/users/web_profile_info/?username=${targetUser}`;
            const profileData = await internalFetch(profileUrl);
            
            const user = profileData.data.user;
            
            // جلب البوستات
            // ننتظر قليلاً لمحاكاة السلوك البشري
            await wait(1000 + Math.random() * 500);
            
            const postsUrl = `/api/v1/feed/user/${user.id}/?count=12`;
            const postsData = await internalFetch(postsUrl);

            return {
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
                    comment_count: post.comment_count
                })) || []
            };

        }, config.targetUsername);

        console.log("✅ Data scraped successfully!");
        
        // حفظ البيانات
        fs.writeFileSync("output.json", JSON.stringify(data, null, 2));
        console.log("📁 Saved to output.json");

    } catch (error) {
        console.error("❌ Error occurred:", error.message);
        // التقاط صورة للشاشة في حالة الخطأ لمعرفة السبب
        await page.screenshot({ path: 'error_screenshot.png' });
        console.log("📸 Screenshot saved as error_screenshot.png");
    } finally {
        await browser.close();
    }
}

startScraper();
