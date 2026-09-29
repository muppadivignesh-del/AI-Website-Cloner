import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';

export interface AnalysisResult {
  url: string;
  screenshot: string; // base64
  html: string;
  title: string;
  colors: string[];
  fonts: string[];
  sections: SectionInfo[];
  navItems: string[];
  metadata: PageMetadata;
}

export interface SectionInfo {
  type: string;
  text: string;
  tag: string;
  hasImage: boolean;
  hasButton: boolean;
  className: string;
}

export interface PageMetadata {
  description: string;
  ogImage: string;
  themeColor: string;
  viewport: string;
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--window-size=1440,900',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
    await page.setUserAgent(
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Navigate with timeout handling
    await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30000,
    }).catch(() => page.goto(url, { waitUntil: 'load', timeout: 20000 }));

    // Wait a bit for dynamic content
    await new Promise(r => setTimeout(r, 2000));

    // Take screenshot
    const screenshotBuffer = await page.screenshot({
      fullPage: false,
      type: 'jpeg',
      quality: 85,
    });
    const screenshot = Buffer.from(screenshotBuffer).toString('base64');

    // Extract page title
    const title = await page.title();

    // Get full HTML (simplified)
    const html = await page.content();

    // Extract CSS custom properties and computed colors
    const colorData = await page.evaluate(() => {
      const colors: string[] = [];
      const elements = document.querySelectorAll('*');
      const colorSet = new Set<string>();

      // Get colors from computed styles
      const sampleElements = Array.from(elements).slice(0, 100);
      sampleElements.forEach(el => {
        const style = window.getComputedStyle(el);
        const bgColor = style.backgroundColor;
        const color = style.color;
        if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
          colorSet.add(bgColor);
        }
        if (color && color !== 'rgba(0, 0, 0, 0)') {
          colorSet.add(color);
        }
      });

      return Array.from(colorSet).slice(0, 20);
    });

    // Extract fonts
    const fonts = await page.evaluate(() => {
      const fontSet = new Set<string>();
      const elements = document.querySelectorAll('*');
      Array.from(elements).slice(0, 50).forEach(el => {
        const style = window.getComputedStyle(el);
        const fontFamily = style.fontFamily;
        if (fontFamily) {
          fontFamily.split(',').forEach(f => {
            const clean = f.trim().replace(/['"]/g, '');
            if (clean && !['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy'].includes(clean)) {
              fontSet.add(clean);
            }
          });
        }
      });
      return Array.from(fontSet).slice(0, 5);
    });

    // Extract page metadata
    const metadata = await page.evaluate(() => {
      const getMeta = (name: string) => {
        const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
        return el ? el.getAttribute('content') || '' : '';
      };
      return {
        description: getMeta('description') || getMeta('og:description'),
        ogImage: getMeta('og:image'),
        themeColor: getMeta('theme-color'),
        viewport: getMeta('viewport'),
      };
    });

    // Extract sections
    const sections = await page.evaluate(() => {
      const sectionElements = document.querySelectorAll(
        'section, header, footer, nav, main, article, aside, [class*="hero"], [class*="banner"], [class*="feature"], [class*="pricing"], [class*="testimonial"], [class*="cta"], [class*="faq"]'
      );

      return Array.from(sectionElements).slice(0, 20).map(el => {
        const tag = el.tagName.toLowerCase();
        const className = el.className.toString().slice(0, 100);
        const text = (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 300);
        const hasImage = el.querySelector('img') !== null;
        const hasButton = el.querySelector('button, a[class*="btn"], [class*="button"]') !== null;

        let type = 'section';
        if (tag === 'header' || className.includes('header')) type = 'header';
        else if (tag === 'nav' || className.includes('nav')) type = 'nav';
        else if (tag === 'footer' || className.includes('footer')) type = 'footer';
        else if (className.includes('hero') || className.includes('banner')) type = 'hero';
        else if (className.includes('feature')) type = 'features';
        else if (className.includes('pricing')) type = 'pricing';
        else if (className.includes('testimonial') || className.includes('review')) type = 'testimonials';
        else if (className.includes('cta')) type = 'cta';
        else if (className.includes('faq')) type = 'faq';

        return { type, text, tag, hasImage, hasButton, className };
      });
    });

    // Extract navigation items
    const navItems = await page.evaluate(() => {
      const navLinks = document.querySelectorAll('nav a, header a, [class*="nav"] a');
      return Array.from(navLinks)
        .map(a => (a as HTMLAnchorElement).textContent?.trim() || '')
        .filter(text => text.length > 0 && text.length < 50)
        .slice(0, 10);
    });

    return {
      url,
      screenshot,
      html: cleanHtml(html),
      title,
      colors: colorData,
      fonts,
      sections,
      navItems,
      metadata,
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

function cleanHtml(html: string): string {
  // Remove script tags and their content
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  // Remove style tags
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  // Trim whitespace
  html = html.replace(/\s+/g, ' ').trim();
  // Limit size
  return html.slice(0, 50000);
}

export function parseHtmlSections(html: string) {
  const $ = cheerio.load(html);
  const sections: Record<string, string> = {};

  // Extract different sections
  sections.nav = $('nav, header').html() || '';
  sections.hero = $('.hero, [class*="hero"], [class*="banner"]').first().html() || '';
  sections.main = $('main').html() || $('body').html() || '';
  sections.footer = $('footer').html() || '';

  return sections;
}
