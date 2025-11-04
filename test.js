import { IgApiClient } from "instagram-private-api";
import fs from "fs";

const config = {
  targetUsername: "nannis_cakes",
  loginUsername: "abdallarroom13",
  loginPassword: "Az01027101373@#",
  postsLimit: 12,
};

async function scrapeWithAPI() {
  console.log("🚀 Instagram Scraper (API Method)\n");

  const ig = new IgApiClient();
  ig.state.generateDevice(config.loginUsername);

  try {
    console.log("🔐 تسجيل الدخول...");
    const auth = await ig.account.login(config.loginUsername, config.loginPassword);
    console.log(`✅ تم تسجيل الدخول: @${auth.username}`);

    console.log(`\n🔍 البحث عن: @${config.targetUsername}`);
    const user = await ig.user.searchExact(config.targetUsername);
    console.log(`✅ تم العثور على الحساب!`);

    console.log("\n📊 جلب معلومات الملف الشخصي...");
    const userInfo = await ig.user.info(user.pk);

    console.log(`   👤 ${userInfo.full_name}`);
    console.log(`   👥 ${userInfo.follower_count} متابع`);
    console.log(`   📝 ${userInfo.biography?.slice(0, 50) || "لا يوجد"}...`);

    console.log("\n🖼️ جلب المنشورات...");
    const feed = ig.feed.user(user.pk);
    
    // جلب المنشورات بشكل صحيح
    const allPosts = [];
    let fetchedCount = 0;

    try {
      // نجيب المنشورات على دفعات
      while (fetchedCount < config.postsLimit) {
        const items = await feed.items();
        
        if (!items || items.length === 0) {
          console.log("⚠️ لا توجد منشورات أخرى");
          break;
        }

        console.log(`   📦 تم جلب ${items.length} منشور...`);
        allPosts.push(...items);
        fetchedCount += items.length;

        // إذا وصلنا للعدد المطلوب أو مفيش منشورات أكتر
        if (fetchedCount >= config.postsLimit || !feed.isMoreAvailable()) {
          break;
        }
      }
    } catch (feedError) {
      console.error("⚠️ خطأ في جلب المنشورات:", feedError.message);
      
      // محاولة بديلة: استخدام timeline
      console.log("🔄 محاولة طريقة بديلة...");
      try {
        const userFeed = ig.feed.user(user.pk);
        const firstBatch = await userFeed.items();
        allPosts.push(...firstBatch);
        console.log(`   📦 تم جلب ${firstBatch.length} منشور`);
      } catch (altError) {
        console.error("❌ فشلت الطريقة البديلة:", altError.message);
      }
    }

    // قص المنشورات للعدد المطلوب
    const posts = allPosts.slice(0, config.postsLimit);

    console.log(`✅ إجمالي المنشورات: ${posts.length}`);

    if (posts.length === 0) {
      console.log("\n⚠️ تحذير: لا توجد منشورات!");
      console.log("   الأسباب المحتملة:");
      console.log("   - الحساب خاص ولست متابعاً له");
      console.log("   - الحساب لا يحتوي على منشورات");
      console.log("   - تم حظر الوصول للمنشورات");
    }

    const output = {
      profile: {
        username: userInfo.username,
        full_name: userInfo.full_name,
        followers: userInfo.follower_count,
        following: userInfo.following_count,
        bio: userInfo.biography,
        profile_pic: userInfo.profile_pic_url,
        is_verified: userInfo.is_verified,
        is_private: userInfo.is_private,
        media_count: userInfo.media_count,
      },
      posts: posts.map((post) => {
        const imageUrl =
          post.image_versions2?.candidates?.[0]?.url ||
          post.carousel_media?.[0]?.image_versions2?.candidates?.[0]?.url ||
          "";

        return {
          id: post.id,
          code: post.code,
          caption: post.caption?.text || "",
          image: imageUrl,
          like_count: post.like_count || 0,
          comment_count: post.comment_count || 0,
          timestamp: post.taken_at,
          post_url: `https://www.instagram.com/p/${post.code}/`,
          is_video: post.media_type === 2,
          video_url: post.video_versions?.[0]?.url || null,
        };
      }),
      scraped_at: new Date().toISOString(),
    };

    fs.writeFileSync("output.json", JSON.stringify(output, null, 2));
    console.log("\n✅ تم الحفظ في: output.json");
    console.log(`📊 إجمالي المنشورات: ${output.posts.length}`);

    console.log("\n📈 ملخص البيانات:");
    console.log(`   الحساب: @${output.profile.username}`);
    console.log(`   المتابعون: ${output.profile.followers.toLocaleString()}`);
    console.log(`   المنشورات المتاحة: ${output.profile.media_count}`);
    console.log(`   المنشورات المجلوبة: ${output.posts.length}`);
    
    if (output.posts.length > 0) {
      console.log(`   الإعجابات الكلية: ${output.posts.reduce((sum, p) => sum + p.like_count, 0).toLocaleString()}`);
    }

  } catch (error) {
    console.error("\n❌ خطأ:", error.message);

    if (error.message.includes("challenge_required")) {
      console.log("\n⚠️ يتطلب Instagram تحقق إضافي:");
      console.log("   1. سجل دخول من المتصفح على نفس السيرفر");
      console.log("   2. أكمل التحقق المطلوب");
      console.log("   3. حاول مرة أخرى");
    } else if (error.message.includes("checkpoint_required")) {
      console.log("\n⚠️ حسابك يحتاج تحقق:");
      console.log("   افتح Instagram من المتصفح وأكمل التحقق");
    } else if (error.message.includes("feedback_required")) {
      console.log("\n⚠️ حسابك محظور مؤقتاً:");
      console.log("   انتظر بضع ساعات وحاول مرة أخرى");
    } else if (error.message.includes("login")) {
      console.log("\n⚠️ خطأ في بيانات تسجيل الدخول");
    } else if (error.message.includes("private")) {
      console.log("\n⚠️ الحساب خاص - يجب أن تكون متابعاً له");
    }

    throw error;
  }
}

scrapeWithAPI()
  .then(() => {
    console.log("\n✅ اكتمل بنجاح! 🎉");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ فشل السكريبت");
    process.exit(1);
  });