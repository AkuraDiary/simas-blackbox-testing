const puppeteer = require('puppeteer-core');
const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_URL = 'https://dev.elsimas.my.id';

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.goto(`${BASE_URL}/internal/login`, { waitUntil: 'networkidle2' });
  await page.type('input[id*="username"], input[name*="username"], input[type="text"]', 'admin');
  await page.type('input[id*="password"], input[name*="password"], input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await sleep(3500);

  await page.goto(`${BASE_URL}/internal/surats`, { waitUntil: 'networkidle2' });
  await sleep(2000);
  const rows = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('table tbody tr.fi-ta-row')).map(r => ({
      text: r.innerText.replace(/\s+/g, ' ').trim(),
      link: r.querySelector('a')?.href
    }));
  });
  console.log('Surat Keluar rows (admin):', rows.length);
  rows.slice(0, 5).forEach((r, i) => console.log(`[${i}] ${r.text} -> ${r.link}`));

  await browser.close();
})();
