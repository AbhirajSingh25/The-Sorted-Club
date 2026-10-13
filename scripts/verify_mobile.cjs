const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\918c50dd-8064-4ee4-9e6a-c09a107e3966';

const VIEWPORTS = {
  mobile390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true },
  mobile320: { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true },
  mobile360: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true },
  mobile430: { width: 430, height: 932, deviceScaleFactor: 2, isMobile: true },
  desktop1440: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false }
};

async function run() {
  console.log('Launching Chrome from:', CHROME_PATH);
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test 1: Mobile 390x844 Homepage
  console.log('Testing Mobile 390x844...');
  await page.setViewport(VIEWPORTS.mobile390);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await page.waitForSelector('.landing-nav');
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '01_mobile_390_hero.png') });

  // Scroll to Services (Section 01)
  const servicesEl = await page.$('#services');
  if (servicesEl) {
    await servicesEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '02_mobile_390_services_2x2.png') });
  }

  // Scroll to VANVAS (Section 02)
  const vanvasEl = await page.$('#vanvas');
  if (vanvasEl) {
    await vanvasEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '03_mobile_390_vanvas_preview.png') });

    // Test interaction: Click on "AI Trip Planner" chip
    const plannerTab = await page.$('button.screen-nav-tab:nth-child(2)');
    if (plannerTab) {
      await plannerTab.click();
      await new Promise(r => setTimeout(r, 400));
    }

    // Scroll slightly down to capture the 2x2 capabilities grid & chips
    const capsGrid = await page.$('.vanvas-mobile-caps-grid');
    if (capsGrid) {
      await capsGrid.scrollIntoView();
      await new Promise(r => setTimeout(r, 500));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '03b_mobile_390_vanvas_caps_2x2.png') });
    }
  }

  // Scroll to Estimator
  const estimatorEl = await page.$('#estimator');
  if (estimatorEl) {
    await estimatorEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '04_mobile_390_estimator.png') });

    // Select second discipline and second tier
    const secondPillarBtn = await page.$('.estimator-pillar-btn:nth-child(2)');
    if (secondPillarBtn) {
      await secondPillarBtn.click();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(ARTIFACT_DIR, '04b_mobile_390_estimator_selected.png') });
    }
  }

  // Scroll to Founder (Section 07)
  const founderEl = await page.$('#founder');
  if (founderEl) {
    await founderEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '05_mobile_390_founder_side_by_side.png') });
  }

  // Test 2: Mobile 320x640 (Ultra-compact)
  console.log('Testing Mobile 320x640...');
  await page.setViewport(VIEWPORTS.mobile320);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));

  const services320 = await page.$('#services');
  if (services320) {
    await services320.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '06_mobile_320_services_2x2.png') });
  }

  const founder320 = await page.$('#founder');
  if (founder320) {
    await founder320.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '07_mobile_320_founder_side_by_side.png') });
  }

  // Test 3: /pricing at 390x844
  console.log('Testing /pricing...');
  await page.setViewport(VIEWPORTS.mobile390);
  await page.goto('http://localhost:5173/pricing', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '08_mobile_390_pricing_hero.png') });

  const pricingGrid = await page.$('.pricing-packages-grid');
  if (pricingGrid) {
    await pricingGrid.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '09_mobile_390_pricing_cards.png') });
  }

  // Test 4: /services at 390x844
  console.log('Testing /services...');
  await page.goto('http://localhost:5173/services', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '10_mobile_390_services_overview.png') });

  // Test 5: /services/build at 390x844
  console.log('Testing /services/build...');
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  const buildPkgGrid = await page.$('.service-pillar-packages-grid');
  if (buildPkgGrid) {
    await buildPkgGrid.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '11_mobile_390_services_build.png') });

  // Test 6: /templates at 390x844
  console.log('Testing /templates...');
  await page.goto('http://localhost:5173/templates', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  const tmplGrid = await page.$('.templates-grid');
  if (tmplGrid) {
    await tmplGrid.scrollIntoView();
    await new Promise(r => setTimeout(r, 500));
  }
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '12_mobile_390_templates_2col.png') });

  // Test 6b: /templates/saffron-and-sage (Detail) at 390x844
  console.log('Testing /templates/saffron-and-sage...');
  await page.goto('http://localhost:5173/templates/saffron-and-sage', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '12b_mobile_390_template_detail.png') });

  // Test 6c: Inquiry Modal at 390x844
  console.log('Testing Inquiry Modal...');
  const buildBtn = await page.$('.detail-header-actions .primary');
  if (buildBtn) {
    await buildBtn.click();
    await new Promise(r => setTimeout(r, 600));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '12c_mobile_390_inquiry_modal.png') });
  }

  // Test 7: Desktop Preservation at 1440x900
  console.log('Testing Desktop 1440x900...');
  await page.setViewport(VIEWPORTS.desktop1440);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, '13_desktop_1440_homepage.png') });

  await browser.close();
  console.log('Visual verification screenshots captured successfully!');
}

run().catch(err => {
  console.error('Error during verification:', err);
  process.exit(1);
});
