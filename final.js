const puppeteer = require('puppeteer');

class InstagramScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: "new",
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

  async getProfileData(username) {
    try {
      console.log(`👤 جاري جلب بيانات البروفايل @${username}...`);
      
      const profileUrl = `https://www.instagram.com/${username}/`;
      await this.page.goto(profileUrl, {
        waitUntil: 'networkidle2',
        timeout: 30000
      });

      await this.delay(3000);

      const profileData = await this.page.evaluate(() => {
        // جلب اسم البروفايل
        const fullName = document.querySelector('section span._ap3a._aaco._aacw._aad0._aad7')?.textContent || 
                         document.querySelector('span.x1lliihq')?.textContent || '';

        // جلب البايو
        const bioSelectors = [
          'div._aa_c span',
          'div.-vDIg span',
          'h1._aacl._aacs._aact._aacx._aada'
        ];
        let bio = '';
        for (const selector of bioSelectors) {
          const element = document.querySelector(selector);
          if (element && element.textContent.trim().length > 10) {
            bio = element.textContent.trim();
            break;
          }
        }

        // جلب صورة البروفايل
        const profilePicSelectors = [
          'img[data-testid="user-avatar"]',
          'img[alt*="profile picture"]',
          'span._acat img',
          'header img'
        ];
        let profilePic = '';
        for (const selector of profilePicSelectors) {
          const img = document.querySelector(selector);
          if (img && img.src && img.src.includes('instagram')) {
            profilePic = img.src;
            break;
          }
        }

        // جلب الإحصائيات (متابعين، منشورات، متابَعين)
        const statsText = document.body.innerText;
        const postsMatch = statsText.match(/(\d+(?:,\d+)*)\s+posts?/i);
        const followersMatch = statsText.match(/(\d+(?:,\d+)*[KMB]?)\s+followers?/i);
        const followingMatch = statsText.match(/(\d+(?:,\d+)*)\s+following/i);

        const posts = postsMatch ? postsMatch[1] : '0';
        const followers = followersMatch ? followersMatch[1] : '0';
        const following = followingMatch ? followingMatch[1] : '0';

        // جلب الرابط الخارجي
        const externalLink = document.querySelector('a[href^="http"]:not([href*="instagram"])')?.href || '';

        // جلب الكاتيجوري
        const category = document.querySelector('div._aacl._aaco._aacw._aad6._aade')?.textContent || '';

        return {
          username: window.location.pathname.replace(/\//g, ''),
          fullName,
          bio,
          profilePicture: profilePic,
          posts,
          followers,
          following,
          externalLink,
          category,
          profileUrl: window.location.href
        };
      });

      console.log('✅ تم جلب بيانات البروفايل');
      return profileData;

    } catch (error) {
      console.error('❌ خطأ في جلب بيانات البروفايل:', error.message);
      return null;
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

      // استمر في السكرول لحد ما نجيب العدد المطلوب
      while (posts.length < maxPosts && noNewPostsCount < 3) {
        const postLinks = await this.page.evaluate(() => {
          const links = [];
          const seenUrls = new Set();
          
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

        for (const post of postLinks) {
          if (!posts.find(p => p.url === post.url)) {
            posts.push(post);
          }
          if (posts.length >= maxPosts) break;
        }

        console.log(`📊 تم جلب ${posts.length} بوست حتى الآن...`);

        if (posts.length === lastPostCount) {
          noNewPostsCount++;
        } else {
          noNewPostsCount = 0;
          lastPostCount = posts.length;
        }

        if (posts.length < maxPosts) {
          await this.page.evaluate(() => {
            window.scrollBy(0, window.innerHeight);
          });
          await this.delay(2000);
          
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
          await this.delay(2500);
        } catch (error) {
          console.error(`❌ فشل جلب تفاصيل البوست: ${error.message}`);
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
          'h1._ap3a._aaco._aacu._aacx._aad7._aade',
          'div._a9zs h1',
          'span[dir="auto"][style*="line-height"]'
        ];
        
        let caption = '';
        for (const selector of captionSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            const text = element.textContent.trim();
            if (text && text.length > 3 && !text.match(/^\d+$/)) {
              caption = text;
              break;
            }
          }
          if (caption) break;
        }

        // جلب عدد اللايكات - محاولات متعددة
        let likes = 0;
        
        // محاولة 1: البحث في الأزرار
        const likeButtons = document.querySelectorAll('section button');
        for (const btn of likeButtons) {
          const text = btn.textContent;
          const match = text.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s*(?:likes?|إعجاب)?/i);
          if (match && !text.includes('@')) {
            likes = match[1];
            break;
          }
        }

        // محاولة 2: البحث في spans
        if (!likes || likes === 0) {
          const spans = document.querySelectorAll('section span, article span');
          for (const span of spans) {
            const text = span.textContent.trim();
            if (text.match(/^\d+(?:,\d+)*(?:\.\d+)?[KMB]?$/) && !text.includes('@')) {
              likes = text;
              break;
            }
          }
        }

        // محاولة 3: البحث في النص الكامل
        if (!likes || likes === 0) {
          const bodyText = document.body.innerText;
          const likesMatch = bodyText.match(/(\d+(?:,\d+)*(?:\.\d+)?[KMB]?)\s+likes?/i);
          if (likesMatch) {
            likes = likesMatch[1];
          }
        }

        // جلب عدد الكومنتات
        let comments = 0;
        const commentSelectors = [
          'span._ae5q span',
          'span[dir="auto"]'
        ];
        for (const selector of commentSelectors) {
          const elements = document.querySelectorAll(selector);
          for (const el of elements) {
            const text = el.textContent;
            const match = text.match(/View all (\d+) comments?/i);
            if (match) {
              comments = parseInt(match[1]);
              break;
            }
          }
          if (comments) break;
        }

        // جلب كل الصور
        const images = [];
        const imageElements = document.querySelectorAll('article img, div[role="button"] img');
        imageElements.forEach(img => {
          if (img.src && 
              img.src.includes('instagram') && 
              img.naturalWidth > 150 && 
              img.naturalHeight > 150 &&
              !img.src.includes('profile') &&
              !img.src.includes('avatar') &&
              !images.includes(img.src)) {
            images.push(img.src);
          }
        });

        // جلب كل الفيديوهات
        const videos = [];
        const videoElements = document.querySelectorAll('article video, video[playsinline]');
        videoElements.forEach(video => {
          if (video.src && !videos.includes(video.src)) {
            videos.push(video.src);
          }
          // جرب source tags
          const sources = video.querySelectorAll('source');
          sources.forEach(source => {
            if (source.src && !videos.includes(source.src)) {
              videos.push(source.src);
            }
          });
        });

        // جلب التاريخ
        const timeElement = document.querySelector('time');
        const timestamp = timeElement?.getAttribute('datetime') || '';

        // تحديد نوع المحتوى
        let contentType = 'image';
        if (videos.length > 0) {
          contentType = 'video';
        } else if (images.length > 1) {
          contentType = 'carousel';
        }

        return {
          caption,
          image: images.length > 0 ? images[0] : null,
          images: images,
          video: videos.length > 0 ? videos[0] : null,
          videos: videos,
          likes: likes || 0,
          comments: comments || 0,
          date: timestamp,
          url: window.location.href,
          contentType,
          mediaCount: images.length + videos.length
        };
      });

      // لو مفيش صور أو فيديوهات، جرب مرة تانية
      if (postData.images.length === 0 && postData.videos.length === 0) {
        console.log('⚠️ مفيش ميديا، بجرب طريقة تانية...');
        await this.delay(2000);
        
        const retryMedia = await this.page.evaluate(() => {
          const imgs = [];
          const vids = [];
          
          // جرب كل الصور
          const allImages = document.querySelectorAll('img');
          allImages.forEach(img => {
            if (img.src && 
                img.src.includes('instagram') && 
                img.naturalWidth > 150 && 
                !img.src.includes('profile') &&
                !imgs.includes(img.src)) {
              imgs.push(img.src);
            }
          });
          
          // جرب كل الفيديوهات
          const allVideos = document.querySelectorAll('video');
          allVideos.forEach(video => {
            if (video.src && !vids.includes(video.src)) {
              vids.push(video.src);
            }
          });
          
          return { images: imgs, videos: vids };
        });
        
        postData.images = retryMedia.images;
        postData.videos = retryMedia.videos;
        postData.image = retryMedia.images[0] || null;
        postData.video = retryMedia.videos[0] || null;
        postData.mediaCount = retryMedia.images.length + retryMedia.videos.length;
      }

      console.log(`✅ ${postData.contentType} - ${postData.mediaCount} ميديا - ${postData.likes} لايك`);
      return postData;

    } catch (error) {
      console.error('❌ خطأ في جلب تفاصيل البوست:', error.message);
      return {
        url: postUrl,
        error: error.message
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

    const LOGIN_USERNAME = 'abdallarroom12';
    const LOGIN_PASSWORD = 'Az01027101373@#';
    
    const loginSuccess = await scraper.login(LOGIN_USERNAME, LOGIN_PASSWORD);
    
    if (!loginSuccess) {
      console.log('❌ فشل تسجيل الدخول. تأكد من بيانات الدخول.');
      return;
    }

    const TARGET_USERNAME = 'nannis_cakes';
    
    // جلب بيانات البروفايل
    const profileData = await scraper.getProfileData(TARGET_USERNAME);
    console.log('\n👤 بيانات البروفايل:');
    console.log(JSON.stringify(profileData, null, 2));

    // جلب البوستات
    const MAX_POSTS = 12;
    const posts = await scraper.scrapeUserPosts(TARGET_USERNAME, MAX_POSTS);
    
    console.log('\n📋 النتائج:');
    console.log(`✅ تم جلب ${posts.length} بوست`);
    
    // عرض ملخص
    posts.forEach((post, index) => {
      console.log(`\n📌 بوست ${index + 1}:`);
      console.log(`   النوع: ${post.contentType}`);
      console.log(`   الصور: ${post.images?.length || 0}`);
      console.log(`   الفيديوهات: ${post.videos?.length || 0}`);
      console.log(`   اللايكات: ${post.likes}`);
      console.log(`   الكومنتات: ${post.comments}`);
    });

    // حفظ النتائج
    const fs = require('fs');
    const result = {
      profile: profileData,
      posts: posts,
      scrapedAt: new Date().toISOString()
    };
    
    fs.writeFileSync('instagram_data.json', JSON.stringify(result, null, 2), 'utf8');
    console.log('\n💾 تم حفظ النتائج في instagram_data.json');

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await scraper.close();
  }
}

main();

