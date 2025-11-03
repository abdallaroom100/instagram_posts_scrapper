// const puppeteer = require('puppeteer');

// class InstagramScraper {
//   constructor() {
//     this.browser = null;
//     this.page = null;
//   }

//   async initialize() {
//     this.browser = await puppeteer.launch({
//       headless: false, // غير لـ true عشان يشتغل في الخلفية
//       args: [
//         '--no-sandbox',
//         '--disable-setuid-sandbox',
//         '--disable-dev-shm-usage',
//         '--disable-blink-features=AutomationControlled',
//         '--disable-web-security'
//       ],
//       defaultViewport: null
//     });
    
//     this.page = await this.browser.newPage();
    
//     // تعديل الـ user agent عشان يبان كأنه براوزر عادي
//     await this.page.setUserAgent(
//       'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
//     );
    
//     await this.page.setViewport({ width: 1920, height: 1080 });
    
//     // إخفاء إن ده automation
//     await this.page.evaluateOnNewDocument(() => {
//       Object.defineProperty(navigator, 'webdriver', { get: () => false });
//     });
//   }

//   async login(username, password) {
//     try {
//       console.log('🔐 جاري تسجيل الدخول...');
      
//       await this.page.goto('https://www.instagram.com/accounts/login/', {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       await this.delay(2000);

//       // إدخال اليوزرنيم
//       await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
//       await this.page.type('input[name="username"]', username, { delay: 100 });
      
//       // إدخال الباسورد
//       await this.page.type('input[name="password"]', password, { delay: 100 });
      
//       await this.delay(1000);

//       // الضغط على زر تسجيل الدخول
//       await this.page.click('button[type="submit"]');
      
//       console.log('⏳ منتظر تسجيل الدخول...');
//       await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

//       await this.delay(3000);

//       // التعامل مع "Save Your Login Info" popup
//       try {
//         const notNowButton = await this.page.$x("//button[contains(text(), 'Not now') or contains(text(), 'Not Now')]");
//         if (notNowButton.length > 0) {
//           await notNowButton[0].click();
//           await this.delay(2000);
//         }
//       } catch (e) {
//         console.log('ℹ️ مفيش popup لحفظ البيانات');
//       }

//       // التعامل مع "Turn on Notifications" popup
//       try {
//         const notNowButton = await this.page.$x("//button[contains(text(), 'Not Now')]");
//         if (notNowButton.length > 0) {
//           await notNowButton[0].click();
//           await this.delay(2000);
//         }
//       } catch (e) {
//         console.log('ℹ️ مفيش popup للإشعارات');
//       }

//       console.log('✅ تم تسجيل الدخول بنجاح!');
//       return true;
      
//     } catch (error) {
//       console.error('❌ فشل تسجيل الدخول:', error.message);
//       return false;
//     }
//   }

//   async scrapeUserPosts(username, maxPosts = 12) {
//     try {
//       console.log(`📸 جاري جلب بوستات @${username}...`);
      
//       const profileUrl = `https://www.instagram.com/${username}/`;
//       await this.page.goto(profileUrl, {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       await this.delay(3000);

//       // التأكد من وجود البروفايل
//       const isPrivate = await this.page.evaluate(() => {
//         const text = document.body.innerText;
//         return text.includes('This Account is Private') || text.includes('This account is private');
//       });
      
//       if (isPrivate) {
//         console.log('🔒 الحساب خاص (Private)');
//         return [];
//       }

//       const posts = [];
//       let scrollAttempts = 0;
//       const maxScrolls = Math.ceil(maxPosts / 12);

//       while (posts.length < maxPosts && scrollAttempts < maxScrolls) {
//         // محاولة عدة selectors مختلفة
//         const postLinks = await this.page.evaluate(() => {
//           const links = [];
          
//           // جرب selectors مختلفة
//           const selectors = [
//             'article a[href*="/p/"]',
//             'a[href*="/p/"]',
//             'a[href*="/reel/"]',
//             'div._aagw a'
//           ];
          
//           for (const selector of selectors) {
//             const elements = document.querySelectorAll(selector);
//             elements.forEach(link => {
//               if (link.href && (link.href.includes('/p/') || link.href.includes('/reel/'))) {
//                 const img = link.querySelector('img');
//                 links.push({
//                   url: link.href,
//                   thumbnail: img ? img.src : null
//                 });
//               }
//             });
//             if (links.length > 0) break;
//           }
          
//           return links;
//         });

//         // إضافة البوستات الجديدة
//         for (const post of postLinks) {
//           if (!posts.find(p => p.url === post.url)) {
//             posts.push(post);
//           }
//           if (posts.length >= maxPosts) break;
//         }

//         console.log(`📊 تم جلب ${posts.length} بوست حتى الآن...`);

//         // لو مفيش بوستات خالص، اطبع الـ HTML للتشخيص
//         if (posts.length === 0 && scrollAttempts === 0) {
//           console.log('🔍 بحاول أشخص المشكلة...');
//           const bodyText = await this.page.evaluate(() => document.body.innerText);
//           if (bodyText.includes('Sorry, this page') || bodyText.includes("isn't available")) {
//             console.log('❌ الصفحة مش موجودة أو الحساب متحذف');
//             break;
//           }
//         }

//         // سكرول لأسفل لتحميل المزيد
//         if (posts.length < maxPosts) {
//           await this.page.evaluate(() => {
//             window.scrollBy(0, window.innerHeight * 1.5);
//           });
//           await this.delay(3000);
//           scrollAttempts++;
//         }
//       }

//       console.log(`✅ تم جلب ${posts.length} بوست من @${username}`);

//       // جلب تفاصيل كل بوست
//       const detailedPosts = [];
//       for (let i = 0; i < Math.min(posts.length, maxPosts); i++) {
//         try {
//           console.log(`🔍 جاري جلب تفاصيل البوست ${i + 1}/${Math.min(posts.length, maxPosts)}...`);
//           const details = await this.getPostDetails(posts[i].url);
//           detailedPosts.push(details);
//           await this.delay(1500);
//         } catch (error) {
//           console.error(`❌ فشل جلب تفاصيل البوست: ${error.message}`);
//         }
//       }

//       return detailedPosts;

//     } catch (error) {
//       console.error('❌ خطأ في جلب البوستات:', error.message);
//       return [];
//     }
//   }

//   async getPostDetails(postUrl) {
//     try {
//       await this.page.goto(postUrl, {
//         waitUntil: 'networkidle2',
//         timeout: 30000
//       });

//       await this.delay(2000);

//       const postData = await this.page.evaluate(() => {
//         // جلب الوصف (Caption)
//         const captionElement = document.querySelector('h1') || 
//                               document.querySelector('span[style*="line-height"]');
//         const caption = captionElement?.textContent || '';

//         // جلب عدد اللايكات
//         const likesElement = document.querySelector('span[style*="line-height"] span span') ||
//                             document.querySelector('section span span');
//         const likes = likesElement?.textContent || '0';

//         // جلب الصورة/الفيديو
//         const mediaElement = document.querySelector('article img') || 
//                             document.querySelector('article video');
//         const mediaUrl = mediaElement?.src || '';

//         // جلب التاريخ
//         const timeElement = document.querySelector('time');
//         const timestamp = timeElement?.getAttribute('datetime') || '';

//         return {
//           caption,
//           likes,
//           mediaUrl,
//           timestamp,
//           url: window.location.href
//         };
//       });

//       return postData;

//     } catch (error) {
//       console.error('❌ خطأ في جلب تفاصيل البوست:', error.message);
//       return {
//         url: postUrl,
//         error: error.message
//       };
//     }
//   }

//   delay(ms) {
//     return new Promise(resolve => setTimeout(resolve, ms));
//   }

//   async close() {
//     if (this.browser) {
//       await this.browser.close();
//       console.log('🔚 تم إغلاق المتصفح');
//     }
//   }
// }

// // مثال على الاستخدام
// async function main() {
//   const scraper = new InstagramScraper();
  
//   try {
//     await scraper.initialize();


//    // ⚠️ ضع بيانات تسجيل الدخول هنا
//     const LOGIN_USERNAME = 'abdallarroom12';
//     const LOGIN_PASSWORD = 'Az01027101373@#';
    
//     // تسجيل الدخول
//     const loginSuccess = await scraper.login(LOGIN_USERNAME, LOGIN_PASSWORD);
    
//     if (!loginSuccess) {
//       console.log('❌ فشل تسجيل الدخول. تأكد من بيانات الدخول.');
//       return;
//     }

//     // جلب بوستات حساب معين
//     const TARGET_USERNAME = 'nannis_cakes'; // غير الاسم للحساب اللي عايزه
//     const MAX_POSTS = 12; // عدد البوستات اللي عايز تجيبها
//     const posts = await scraper.scrapeUserPosts(TARGET_USERNAME, MAX_POSTS);
    
//     console.log('\n📋 النتائج:');
//     console.log(JSON.stringify(posts, null, 2));

//     // حفظ النتائج في ملف
//     const fs = require('fs');
//     fs.writeFileSync('instagram_posts.json', JSON.stringify(posts, null, 2));
//     console.log('\n💾 تم حفظ النتائج في instagram_posts.json');

//   } catch (error) {
//     console.error('❌ خطأ:', error);
//   } finally {
//     await scraper.close();
//   }
// }

// // تشغيل السكريبت
// main();

const puppeteer = require('puppeteer');

class InstagramScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security'
      ],
      defaultViewport: null
    });
    
    this.page = await this.browser.newPage();
    
    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );
    
    await this.page.setViewport({ width: 1920, height: 1080 });
    
    await this.page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => false });
    });
  }

  async login(username, password) {
    try {
      console.log('🔐 جاري تسجيل الدخول...');
      
      await this.page.goto('https://www.instagram.com/accounts/login/', {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.delay(2000);

      await this.page.waitForSelector('input[name="username"]', { timeout: 10000 });
      await this.page.type('input[name="username"]', username, { delay: 100 });
      await this.page.type('input[name="password"]', password, { delay: 100 });
      
      await this.delay(1000);
      await this.page.click('button[type="submit"]');
      
      console.log('⏳ منتظر تسجيل الدخول...');
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });
      await this.delay(3000);

      // التعامل مع popups
      try {
        const notNowButton = await this.page.$x("//button[contains(text(), 'Not now') or contains(text(), 'Not Now')]");
        if (notNowButton.length > 0) {
          await notNowButton[0].click();
          await this.delay(2000);
        }
      } catch (e) {}

      try {
        const notNowButton = await this.page.$x("//button[contains(text(), 'Not Now')]");
        if (notNowButton.length > 0) {
          await notNowButton[0].click();
          await this.delay(2000);
        }
      } catch (e) {}

      console.log('✅ تم تسجيل الدخول بنجاح!');
      return true;
      
    } catch (error) {
      console.error('❌ فشل تسجيل الدخول:', error.message);
      return false;
    }
  }

  async scrapeUserPosts(username, maxPosts = 12) {
    try {
      console.log(`📸 جاري جلب بوستات @${username}...`);
      
      const profileUrl = `https://www.instagram.com/${username}/`;
      await this.page.goto(profileUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.delay(3000);

      // التأكد من وجود البروفايل
      const isPrivate = await this.page.evaluate(() => {
        const text = document.body.innerText;
        return text.includes('This Account is Private') || text.includes('This account is private');
      });
      
      if (isPrivate) {
        console.log('🔒 الحساب خاص (Private)');
        return [];
      }

      const posts = [];
      let lastPostCount = 0;
      let noNewPostsCount = 0;
      const maxScrollAttempts = 20; // زودنا عدد محاولات السكرول

      // استمر في السكرول لحد ما نجيب العدد المطلوب
      while (posts.length < maxPosts && noNewPostsCount < 3) {
        const postLinks = await this.page.evaluate(() => {
          const links = [];
          const seenUrls = new Set();
          
          // جرب selectors مختلفة
          const selectors = [
            'article a[href*="/p/"]',
            'article a[href*="/reel/"]',
            'a[href*="/p/"]',
            'a[href*="/reel/"]',
            'div._aagw a',
            'div._ac7v a'
          ];
          
          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            elements.forEach(link => {
              if (link.href && (link.href.includes('/p/') || link.href.includes('/reel/'))) {
                if (!seenUrls.has(link.href)) {
                  seenUrls.add(link.href);
                  const img = link.querySelector('img');
                  links.push({
                    url: link.href,
                    thumbnail: img ? img.src : null
                  });
                }
              }
            });
          }
          
          return links;
        });

        // إضافة البوستات الجديدة
        for (const post of postLinks) {
          if (!posts.find(p => p.url === post.url)) {
            posts.push(post);
          }
          if (posts.length >= maxPosts) break;
        }

        console.log(`📊 تم جلب ${posts.length} بوست حتى الآن...`);

        // لو مفيش بوستات جديدة
        if (posts.length === lastPostCount) {
          noNewPostsCount++;
        } else {
          noNewPostsCount = 0;
          lastPostCount = posts.length;
        }

        // سكرول لأسفل لتحميل المزيد
        if (posts.length < maxPosts) {
          await this.page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await this.delay(2000);
          
          // سكرول تاني عشان نتأكد
          await this.page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await this.delay(2000);
        }
      }

      console.log(`✅ تم جلب ${posts.length} لينك بوست من @${username}`);

      // جلب تفاصيل كل بوست
      const detailedPosts = [];
      const postsToFetch = posts.slice(0, maxPosts);
      
      for (let i = 0; i < postsToFetch.length; i++) {
        try {
          console.log(`🔍 جاري جلب تفاصيل البوست ${i + 1}/${postsToFetch.length}...`);
          const details = await this.getPostDetails(postsToFetch[i].url);
          detailedPosts.push(details);
          await this.delay(2000); // زودنا الوقت بين كل بوست
        } catch (error) {
          console.error(`❌ فشل جلب تفاصيل البوست: ${error.message}`);
          // أضف البوست حتى لو فيه خطأ
          detailedPosts.push({
            url: postsToFetch[i].url,
            error: error.message
          });
        }
      }

      return detailedPosts;

    } catch (error) {
      console.error('❌ خطأ في جلب البوستات:', error.message);
      return [];
    }
  }

  async getPostDetails(postUrl) {
    try {
      await this.page.goto(postUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.delay(3000);

      const postData = await this.page.evaluate(() => {
        // جلب الوصف (Caption)
        const captionSelectors = [
          'h1',
          'span[dir="auto"]',
          'div._a9zs span',
          'div._a9zr span'
        ];
        
        let caption = '';
        for (const selector of captionSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            caption = element.textContent.trim();
            break;
          }
        }

        // جلب عدد اللايكات
        const likesSelectors = [
          'section span[class*="x193iq5w"]',
          'section span a span',
          'button span span',
          'section button span'
        ];
        
        let likes = '0';
        for (const selector of likesSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim()) {
            likes = element.textContent.trim();
            break;
          }
        }

        // جلب كل الصور/الفيديوهات (في حالة carousel)
        const mediaUrls = [];
        
        // جرب selectors مختلفة للصور
        const imageSelectors = [
          'article img[src*="instagram"]',
          'div[role="button"] img',
          'div._aagv img',
          'img[style*="object-fit"]'
        ];
        
        for (const selector of imageSelectors) {
          const images = document.querySelectorAll(selector);
          images.forEach(img => {
            if (img.src && img.src.includes('instagram') && !img.src.includes('profile')) {
              // تأكد إن الصورة مش صغيرة جداً (يعني مش أيقونة)
              if (img.naturalWidth > 150 && img.naturalHeight > 150) {
                if (!mediaUrls.includes(img.src)) {
                  mediaUrls.push(img.src);
                }
              }
            }
          });
          if (mediaUrls.length > 0) break;
        }

        // جلب الفيديوهات
        const videos = document.querySelectorAll('article video');
        videos.forEach(video => {
          if (video.src && !mediaUrls.includes(video.src)) {
            mediaUrls.push(video.src);
          }
        });

        // جلب التاريخ
        const timeElement = document.querySelector('time');
        const timestamp = timeElement?.getAttribute('datetime') || '';

        // جلب عدد الكومنتات
        const commentsElement = document.querySelector('span._ae5q span');
        const comments = commentsElement?.textContent || '0';

        return {
          url: window.location.href,
          caption,
          likes,
          comments,
          mediaUrls, // كل الصور/الفيديوهات
          mediaCount: mediaUrls.length,
          timestamp,
          datePosted: timestamp ? new Date(timestamp).toLocaleDateString('ar-EG') : ''
        };
      });

      // لو مفيش صور، جرب مرة تانية بطريقة مختلفة
      if (postData.mediaUrls.length === 0) {
        console.log('⚠️ مفيش صور، بجرب طريقة تانية...');
        await this.delay(2000);
        
        const retryMedia = await this.page.evaluate(() => {
          const urls = [];
          const allImages = document.querySelectorAll('img');
          
          allImages.forEach(img => {
            if (img.src && 
                img.src.includes('instagram') && 
                img.naturalWidth > 150 && 
                img.naturalHeight > 150 &&
                !img.src.includes('profile') &&
                !img.src.includes('avatar')) {
              if (!urls.includes(img.src)) {
                urls.push(img.src);
              }
            }
          });
          
          return urls;
        });
        
        postData.mediaUrls = retryMedia;
        postData.mediaCount = retryMedia.length;
      }

      console.log(`✅ تم جلب ${postData.mediaUrls.length} صورة/فيديو`);
      return postData;

    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل البوست:', error.message);
      return {
        url: postUrl,
        error: error.message,
        mediaUrls: []
      };
    }
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log('🔚 تم إغلاق المتصفح');
    }
  }
}

// مثال على الاستخدام
async function main() {
  const scraper = new InstagramScraper();
  
  try {
    await scraper.initialize();

    // ⚠️ ضع بيانات تسجيل الدخول هنا
    const LOGIN_USERNAME = 'abdallarroom12';
    const LOGIN_PASSWORD = 'Az01027101373@#';
    
    // تسجيل الدخول
    const loginSuccess = await scraper.login(LOGIN_USERNAME, LOGIN_PASSWORD);
    
    if (!loginSuccess) {
      console.log('❌ فشل تسجيل الدخول. تأكد من بيانات الدخول.');
      return;
    }

    // جلب بوستات حساب معين
    const TARGET_USERNAME = 'nannis_cakes';
    const MAX_POSTS = 12;
    const posts = await scraper.scrapeUserPosts(TARGET_USERNAME, MAX_POSTS);
    
    console.log('\n📋 النتائج:');
    console.log(`✅ تم جلب ${posts.length} بوست`);
    
    // عرض ملخص
    posts.forEach((post, index) => {
      console.log(`\n📌 بوست ${index + 1}:`);
      console.log(`   الرابط: ${post.url}`);
      console.log(`   عدد الصور: ${post.mediaCount || 0}`);
      console.log(`   اللايكات: ${post.likes}`);
      console.log(`   التاريخ: ${post.datePosted}`);
    });

    // حفظ النتائج في ملف
    const fs = require('fs');
    fs.writeFileSync('instagram_posts.json', JSON.stringify(posts, null, 2), 'utf8');
    console.log('\n💾 تم حفظ النتائج في instagram_posts.json');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await scraper.close();
  }
}

// تشغيل السكريبت
main();