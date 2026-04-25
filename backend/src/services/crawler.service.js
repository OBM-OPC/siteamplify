const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class CrawlerService {
  async crawl(url) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      );
      
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      const html = await page.content();
      const $ = cheerio.load(html);
      
      // Extract SEO data
      const data = {
        url,
        domain: new URL(url).hostname,
        pageTitle: $('title').text().trim(),
        metaDescription: $('meta[name="description"]').attr('content') || '',
        h1s: $('h1').map((i, el) => $(el).text().trim()).get(),
        h2s: $('h2').map((i, el) => $(el).text().trim()).get(),
        h3s: $('h3').map((i, el) => $(el).text().trim()).get(),
        images: $('img').map((i, el) => ({
          src: $(el).attr('src') || '',
          alt: $(el).attr('alt') || ''
        })).get(),
        internalLinks: $('a[href]').filter((i, el) => {
          const href = $(el).attr('href') || '';
          return href.startsWith('/') || href.includes(new URL(url).hostname);
        }).length,
        externalLinks: $('a[href]').filter((i, el) => {
          const href = $(el).attr('href') || '';
          return href.startsWith('http') && !href.includes(new URL(url).hostname);
        }).length,
        textContent: $('body').text().trim(),
        wordCount: $('body').text().trim().split(/\s+/).length,
        hasSchema: $('script[type="application/ld+json"]').length > 0,
        schemaTypes: $('script[type="application/ld+json"]').map((i, el) => {
          try {
            const json = JSON.parse($(el).html() || '{}');
            return json['@type'] || json['@graph']?.map(item => item['@type']) || [];
          } catch {
            return [];
          }
        }).get().flat(),
        headings: {
          h1: $('h1').length,
          h2: $('h2').length,
          h3: $('h3').length
        }
      };
      
      return data;
    } catch (error) {
      throw new Error(`Crawling failed: ${error.message}`);
    } finally {
      if (browser) await browser.close();
    }
  }
}

module.exports = new CrawlerService();
