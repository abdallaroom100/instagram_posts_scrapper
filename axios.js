const puppeteer = require('puppeteer');
const fs = require('fs');

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
      ],
      defaultViewport: { width: 1920, height: 1080 }
    });
    
    this.page = await this.browser.newPage();

    // منع تحميل الصور والستايلات
    await this.page.setRequestInterception(true);
    this.page.on('request', req => {
      const type = req.resourceType();
      if (['stylesheet', 'font', 'image', 'media'].includes(type)) {
        req.abort();
      } else req.continue();
    });

    await this.page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    );
  }

  async login(username, password) {
    console.log('🔐 تسجيل الدخول...');
    await this.page.goto('https://www.instagram.com/accounts/login/', { waitUntil: 'networkidle2' });
    await this.page.waitForSelector('input[name="username"]');
    await this.page.type('input[name="username"]', username, { delay: 50 });
    await this.page.type('input[name="password"]', password, { delay: 50 });
    await Promise.all([
      this.page.click('button[type="submit"]'),
      this.page.waitForNavigation({ waitUntil: 'networkidle2' })
    ]);
    console.log('✅ تم تسجيل الدخول');
  }

  async scrapeUserPosts(username, maxPosts = 12) {
    console.log(`📸 جلب بوستات ${username}`);
    await this.page.goto(`https://www.instagram.com/${username}/`, { waitUntil: 'networkidle2' });
    await this.page.waitForSelector('article a[href*="/p/"], a[href*="/reel/"]', { timeout: 10000 });

    const postLinks = await this.page.evaluate(max => {
      const links = Array.from(document.querySelectorAll('a[href*="/p/"], a[href*="/reel/"]'))
        .slice(0, max)
        .map(a => ({
          url: a.href,
          thumbnail: a.querySelector('img')?.src || null
        }));
      return links;
    }, maxPosts);

    console.log(`🔗 تم إيجاد ${postLinks.length} بوست`);

    // Parallel fetching
    const batchSize = 5;
    const detailedPosts = [];

    for (let i = 0; i < postLinks.length; i += batchSize) {
      const batch = postLinks.slice(i, i + batchSize);
      const results = await Promise.all(
        batch.map(p => this.fetchPostDetails(p.url))
      );
      detailedPosts.push(...results);
    }

    console.log(`✅ تم استخراج ${detailedPosts.length} بوست`);
    return detailedPosts;
  }

 async fetchPostDetails(url) {
  const page = await this.browser.newPage();

  // نسمح بتحميل الصور/فيديوهات هنا لكن نحجب الخطوط والستايلات لتحسين السرعة
  await page.setRequestInterception(true);
  page.on('request', req => {
    const type = req.resourceType();
    if (['stylesheet', 'font', 'manifest', 'other'].includes(type)) req.abort();
    else req.continue();
  });

  // تحسين الـ user agent
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // انتظر ظهور المقال/الـ article أو time
    await new Promise(res => setTimeout(res, 700)); // خفة بدل انتظار ثابت طويل
    await Promise.race([
      page.waitForSelector('article', { timeout: 4000 }).catch(() => null),
      page.waitForSelector('time', { timeout: 4000 }).catch(() => null)
    ]);

    // استخرج البيانات باستخدام عدة طرق (fallbacks)
    const data = await page.evaluate(() => {
      // util: محاولة parsers متعددة
      function tryJSONLD() {
        try {
          const el = document.querySelector('script[type="application/ld+json"]');
          if (!el) return null;
          const j = JSON.parse(el.textContent);
          // بعض JSON-LD يعطي الصورة والوصف
          return {
            caption: j.caption || j.description || '',
            mediaUrl: (j.image && (j.image.url || j.image)) || '',
            date: j.uploadDate || j.datePublished || '',
            likes: j.interactionStatistic ? (j.interactionStatistic.userInteractionCount || '') : ''
          };
        } catch (e) { return null; }
      }

      function tryMeta() {
        try {
          const metaDesc = document.querySelector('meta[property="og:description"], meta[name="description"]');
          const metaImage = document.querySelector('meta[property="og:image"]');
          const desc = metaDesc ? metaDesc.getAttribute('content') : '';
          // og:description عادة فيها الـ caption plus likes/views text -> نسيبها كـ caption fallback
          return {
            caption: desc,
            mediaUrl: metaImage ? metaImage.getAttribute('content') : '',
            date: '',
            likes: ''
          };
        } catch (e) { return null; }
      }

      function trySharedData() {
        try {
          // بعض الإصدارات تضع json داخل نص script حيث يبدأ بـ window._sharedData أو similar
          const scripts = Array.from(document.scripts).map(s => s.textContent || '').filter(Boolean);
          for (const txt of scripts) {
            // بحث بسيط عن JSON بعد window._sharedData =
            const marker = 'window._sharedData';
            if (txt.includes(marker)) {
              const jsonText = txt.substring(txt.indexOf('{'), txt.lastIndexOf('}') + 1);
              const parsed = JSON.parse(jsonText);
              // محاولة العثور على media من parsed (قد تختلف البنية حسب النسخة)
              // البحث في parsed.entry_data.PostPage أو similar
              const post = parsed?.entry_data?.PostPage?.[0]?.graphql?.shortcode_media ||
                           parsed?.entry_data?.PostPage?.[0]?.media || null;
              if (post) {
                return {
                  caption: (post.edge_media_to_caption?.edges[0]?.node?.text) || '',
                  mediaUrl: post.display_url || (post.display_resources && post.display_resources[0]?.src) || '',
                  date: post.taken_at_timestamp ? new Date(post.taken_at_timestamp * 1000).toISOString() : '',
                  likes: post.edge_media_preview_like?.count || post.edge_media_to_parent_comment?.count || ''
                };
              }
            }
          }
          return null;
        } catch (e) { return null; }
      }

      function tryDOM() {
        try {
          // caption: غالبًا تحت article time/section span أو داخل div[role="button"] أو p tags
          const timeEl = document.querySelector('time');
          const date = timeEl ? timeEl.getAttribute('datetime') || '' : '';
          
          // caption: ابحث عن first long text under article
          let caption = '';
          const article = document.querySelector('article');
          if (article) {
            // حاول عدة selectors للـ caption
            const possible = article.querySelectorAll('div > div > ul li > div > div > div > span, div > div > div > span, header h2, header h1, article p');
            for (const el of possible) {
              const t = (el.textContent || '').trim();
              if (t && t.length > caption.length) caption = t;
            }

            // media: img or video inside article
            const img = article.querySelector('img[srcset], img[src]');
            const video = article.querySelector('video[src]');
            const mediaUrl = (video && video.src) || (img && (img.currentSrc || img.src)) || '';

            // likes: ابحث عن عناصر تحتوي على "likes" أو رقم كبير قبل "likes" أو عنصر aria-label
            let likes = '';
            const likeEl = Array.from(article.querySelectorAll('section span'))
              .map(s => s.textContent?.trim() || '')
              .find(txt => /like[s]?|likes|views/i.test(txt) || /^\d{1,3}(,\d{3})*/.test(txt));
            likes = likeEl || '';

            return { caption, mediaUrl, date, likes };
          }
          return null;
        } catch (e) { return null; }
      }

      // ترتيب المحاولات
      return tryJSONLD() || trySharedData() || tryMeta() || tryDOM() || { caption: '', mediaUrl: '', likes: '', date: '' };
    });

    await page.close();
    return {
      ...data,
      url
    };
  } catch (error) {
    await page.close();
    return { url, error: error.message, caption: '', mediaUrl: '', likes: '', date: '' };
  }
}


  async close() {
    await this.browser.close();
  }
}

(async () => {
  const scraper = new InstagramScraper();
  await scraper.initialize();
  const USER = 'abdallarroom12';
  const PASS = 'Az01027101373@#';

  const TARGET = 'nanis__cake';

  await scraper.login(USER, PASS);
  const posts = await scraper.scrapeUserPosts(TARGET, 12);
  
  fs.writeFileSync('fast_instagram.json', JSON.stringify(posts, null, 2));
  console.log('💾 تم الحفظ في fast_instagram.json');

  await scraper.close();
})();
