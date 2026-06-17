import puppeteer from 'puppeteer';
import fs from 'fs';
import os from 'os';

function findChromeExecutable(): string | null {
  const platform = os.platform();
  const candidates: string[] = [];
  if (platform === 'win32') {
    candidates.push(
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'
    );
  } else if (platform === 'darwin') {
    candidates.push('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
  } else {
    candidates.push('/usr/bin/google-chrome', '/usr/bin/chromium-browser', '/usr/bin/chrome');
  }
  for (const p of candidates) {
    try {
      if (fs.existsSync(p)) return p;
    } catch {}
  }
  return null;
}

export async function renderPageAndExtractImage(url: string): Promise<string | null> {
  let browser: any = null;
  try {
    const execPath = findChromeExecutable();
    const launchOpts: any = { headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] };
    if (execPath) launchOpts.executablePath = execPath;
    browser = await puppeteer.launch(launchOpts);
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 20000 });

    // Try common selectors and meta tags
    const ogImage = await page.$eval('meta[property="og:image"]', (el: any) => el?.getAttribute('content')).catch(() => null);
    if (ogImage) {
      await browser.close().catch(()=>null);
      return ogImage;
    }

    // Look for product image selectors used by Shopee mobile/desktop
    const selectors = [
      'picture img',
      'img.product-image',
      'img.Fu5w0G',
      'div.product-brief img',
      'img',
    ];

    for (const sel of selectors) {
      const src = await page.$$eval(sel, (nodes: any[]) => {
        return nodes.map((n: any) => n.src || n.getAttribute('src') || n.getAttribute('data-src')).filter(Boolean);
      }).catch(() => []);
      if (src && src.length) {
        const abs = src.find((s: string) => s.startsWith('http')) || src[0];
        if (abs) {
          await browser.close().catch(()=>null);
          return abs;
        }
      }
    }

    const preloaded = await page.evaluate(() => {
      // @ts-ignore
      return (window as any).__PRELOADED_STATE__ || null;
    }).catch(() => null);
    if (preloaded) {
      try {
        const json = JSON.stringify(preloaded).match(/https?:\/\/[^\"'\s<>]+\.(?:jpg|jpeg|png|webp)/i);
        if (json && json[0]) {
          await browser.close().catch(()=>null);
          return json[0];
        }
      } catch (e) {}
    }

    await browser.close().catch(()=>null);
    return null;
  } catch (e) {
    if (browser) await browser.close().catch(()=>null);
    return null;
  }
}
