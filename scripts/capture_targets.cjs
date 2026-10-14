const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\e02f7a88-7d50-42e2-8b7a-a20facf44da4';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, isMobile: true });

  // 1. Founder photo side-by-side
  await page.goto('http://localhost:5173/#founder', { waitUntil: 'domcontentloaded' });
  const founderEl = await page.$('.founder-header-flex');
  if (founderEl) {
    await founderEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'founder_side_by_side_390.png') });
  }

  // 2. Estimator 4 Addons Grid
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'domcontentloaded' });
  const addonsEl = await page.$('.estimator-addons-grid');
  if (addonsEl) {
    await addonsEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'addons_grid_390.png') });
  }

  // 3. Repeat at 320px
  await page.setViewport({ width: 320, height: 800, isMobile: true });
  await page.goto('http://localhost:5173/#founder', { waitUntil: 'domcontentloaded' });
  const founder320 = await page.$('.founder-header-flex');
  if (founder320) {
    await founder320.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'founder_side_by_side_320.png') });
  }

  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'domcontentloaded' });
  const addons320 = await page.$('.estimator-addons-grid');
  if (addons320) {
    await addons320.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'addons_grid_320.png') });
  }

  await browser.close();
  console.log('Done capturing targeted screenshots!');
})();
