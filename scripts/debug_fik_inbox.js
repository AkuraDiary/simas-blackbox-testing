const puppeteer = require('puppeteer-core');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'https://dev.elsimas.my.id';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: CHROME_PATH,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
    await page.type('input[id*="username"], input[name*="username"], input[type="text"]', 'staff.fik');
    await page.type('input[id*="password"], input[name*="password"], input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await sleep(3500);

    await page.goto(`${BASE_URL}/internal/surat-masuk`, { waitUntil: 'networkidle2' });
    await sleep(2500);
    const tabs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button[role="tab"], .fi-tabs-item')).map(t => t.innerText.trim());
    });
    console.log('Tabs in surat-masuk:', tabs);

    const tableText = await page.evaluate(() => {
      return document.querySelector('table')?.innerText.replace(/\s+/g, ' ').trim() || 'No table found';
    });
    console.log('Table content in default tab:', tableText.substring(0, 300));

    await browser.close();
  } catch (e) {
    console.error('Catch:', e);
  }
})();
