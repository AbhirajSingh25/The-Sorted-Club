const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\e02f7a88-7d50-42e2-8b7a-a20facf44da4';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const VIEWPORTS = {
  v320: { width: 320, height: 800, isMobile: true },
  v360: { width: 360, height: 800, isMobile: true },
  v390: { width: 390, height: 844, isMobile: true },
  v430: { width: 430, height: 932, isMobile: true },
  v768: { width: 768, height: 1024, isMobile: true },
  v1440: { width: 1440, height: 900, isMobile: false }
};

async function runAudit() {
  console.log('===============================================================');
  console.log('  STARTING VERIFICATION AUDIT: FOUNDER, ADDONS & TECH ARSENAL  ');
  console.log('===============================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // --------------------------------------------------------------------------
  // AREA 1: FOUNDER PORTRAIT VERIFICATION
  // --------------------------------------------------------------------------
  console.log('\n--- 1. AUDITING FOUNDER PORTRAIT ACROSS VIEWPORTS ---');
  for (const vpKey of ['v320', 'v360', 'v390', 'v430', 'v1440']) {
    const vp = VIEWPORTS[vpKey];
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#founder', { waitUntil: 'domcontentloaded' });
    const founderEl = await page.$('#founder');
    if (founderEl) await founderEl.scrollIntoView();
    await page.waitForFunction(() => {
      const img = document.querySelector('.founder-portrait-img');
      return img && img.complete && img.naturalWidth > 0;
    }, { timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));

    const founderData = await page.evaluate(() => {
      const img = document.querySelector('.founder-portrait-img');
      const wrapper = document.querySelector('.founder-image-wrapper');
      const nameplate = document.querySelector('.founder-info-beside') || document.querySelector('.founder-nameplate');
      const computed = img ? window.getComputedStyle(img) : null;
      const wrapRect = wrapper ? wrapper.getBoundingClientRect() : null;
      const nameRect = nameplate ? nameplate.getBoundingClientRect() : null;

      return {
        src: img?.getAttribute('src'),
        naturalWidth: img?.naturalWidth,
        naturalHeight: img?.naturalHeight,
        objectFit: computed?.objectFit,
        objectPosition: computed?.objectPosition,
        wrapWidth: wrapRect?.width,
        wrapHeight: wrapRect?.height,
        isSideBySide: wrapRect && nameRect ? wrapRect.right <= nameRect.left + 5 : false,
        noHorizOverflow: document.documentElement.scrollWidth <= window.innerWidth
      };
    });

    console.log(`  [${vpKey} - ${vp.width}px]: src=${founderData.src}, natural=${founderData.naturalWidth}x${founderData.naturalHeight}, fit=${founderData.objectFit}, pos=${founderData.objectPosition}, sideBySide=${founderData.isSideBySide}, noOverflow=${founderData.noHorizOverflow}`);

    if (!founderData.src.includes('/images/founder-abhiraj.jpg')) {
      throw new Error(`Founder image src invalid: ${founderData.src}`);
    }
    if (founderData.naturalWidth === 0) {
      throw new Error(`Founder image failed to load!`);
    }
    if (!founderData.noHorizOverflow) {
      throw new Error(`Horizontal overflow detected at ${vp.width}px!`);
    }

    if (['v320', 'v390', 'v1440'].includes(vpKey)) {
      const el = await page.$('#founder');
      if (el) await el.scrollIntoView();
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `founder_${vpKey}.png`) });
    }
  }

  // --------------------------------------------------------------------------
  // AREA 2: FOURTH ESTIMATOR ADD-ON & COMMERCIAL CALCULATIONS
  // --------------------------------------------------------------------------
  console.log('\n--- 2. AUDITING FOURTH ESTIMATOR ADD-ON & CALCULATIONS ---');
  for (const vpKey of ['v320', 'v360', 'v390', 'v430', 'v1440']) {
    const vp = VIEWPORTS[vpKey];
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#estimator', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    const addonData = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.estimator-addon-card'));
      const cardRects = cards.map(c => {
        const r = c.getBoundingClientRect();
        return {
          title: c.querySelector('.addon-title-row strong')?.textContent?.trim(),
          price: c.querySelector('.addon-price')?.textContent?.trim(),
          desc: c.querySelector('.addon-desc')?.textContent?.trim(),
          top: r.top,
          left: r.left,
          width: r.width,
          height: r.height
        };
      });

      // Check 2x2 grid layout
      const is2x2 = cards.length === 4 &&
                    Math.abs(cardRects[0].top - cardRects[1].top) < 4 &&
                    Math.abs(cardRects[2].top - cardRects[3].top) < 4 &&
                    cardRects[2].top > cardRects[0].top + 20;

      return {
        count: cards.length,
        is2x2,
        cardRects,
        noHorizOverflow: document.documentElement.scrollWidth <= window.innerWidth
      };
    });

    console.log(`  [${vpKey} - ${vp.width}px]: Addons Count=${addonData.count}, 2x2 Grid=${addonData.is2x2}, noOverflow=${addonData.noHorizOverflow}`);
    if (addonData.count !== 4) {
      throw new Error(`Expected 4 add-ons, found ${addonData.count}`);
    }
    if (!addonData.is2x2) {
      throw new Error(`Add-ons do not form a balanced 2x2 grid at ${vp.width}px!`);
    }
    if (!addonData.noHorizOverflow) {
      throw new Error(`Horizontal overflow at estimator add-ons at ${vp.width}px!`);
    }
  }

  // Functional calculation and inquiry modal test on v390
  await page.setViewport(VIEWPORTS.v390);
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  console.log('\n  Testing Addon toggling and commercial calculations (INR)...');
  const basePriceText = await page.evaluate(() => {
    return document.querySelector('.summary-price-amount strong')?.textContent?.trim() ||
           document.querySelector('.bottom-bar-total')?.textContent?.trim();
  });
  console.log(`    Base total (no addons): ${basePriceText}`);

  // Select Fourth Addon: "Analytics & Conversion Tracking"
  console.log('    Clicking 4th addon ("Analytics & Conversion Tracking")...');
  const addon4 = (await page.$$('.estimator-addon-card'))[3];
  await addon4.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 200));

  const priceAfterAddon4 = await page.evaluate(() => {
    return document.querySelector('.summary-price-amount strong')?.textContent?.trim() ||
           document.querySelector('.bottom-bar-total')?.textContent?.trim();
  });
  console.log(`    Total after selecting 4th addon: ${priceAfterAddon4}`);
  if (!priceAfterAddon4.includes('29,998')) {
    throw new Error(`Expected ₹29,998 after adding ₹4,999 to ₹24,999, got ${priceAfterAddon4}`);
  }

  // Deselect Fourth Addon
  await addon4.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 200));
  const priceAfterDeselect = await page.evaluate(() => {
    return document.querySelector('.summary-price-amount strong')?.textContent?.trim() ||
           document.querySelector('.bottom-bar-total')?.textContent?.trim();
  });
  console.log(`    Total after deselecting 4th addon: ${priceAfterDeselect}`);
  if (!priceAfterDeselect.includes('24,999')) {
    throw new Error(`Expected reset to ₹24,999, got ${priceAfterDeselect}`);
  }

  // Select all 4 add-ons
  console.log('    Selecting all 4 addons...');
  const allAddons = await page.$$('.estimator-addon-card');
  for (const a of allAddons) {
    await a.evaluate(el => el.click());
    await new Promise(r => setTimeout(r, 100));
  }
  const priceWithAllAddons = await page.evaluate(() => {
    return document.querySelector('.summary-price-amount strong')?.textContent?.trim() ||
           document.querySelector('.bottom-bar-total')?.textContent?.trim();
  });
  console.log(`    Total with all 4 addons (₹24,999 + 4 * ₹4,999 = ₹44,995): ${priceWithAllAddons}`);
  if (!priceWithAllAddons.includes('44,995')) {
    throw new Error(`Expected ₹44,995, got ${priceWithAllAddons}`);
  }

  // Toggle Currency to USD
  console.log('    Toggling currency to USD...');
  const usdToggle = await page.$('.currency-btn:last-child');
  await usdToggle.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 300));

  const usdTotal = await page.evaluate(() => {
    return document.querySelector('.summary-price-amount strong')?.textContent?.trim() ||
           document.querySelector('.bottom-bar-total')?.textContent?.trim();
  });
  console.log(`    USD Total with 4 addons ($650 + 4 * $130 = $1,170): ${usdTotal}`);
  if (!usdTotal.includes('1,170')) {
    throw new Error(`Expected $1,170, got ${usdTotal}`);
  }

  // Open Inquiry Modal and inspect selected add-ons
  console.log('    Opening Inquiry Modal from Estimator...');
  const ctaBtn = await page.$('.summary-cta-btn');
  if (ctaBtn) await ctaBtn.scrollIntoView();
  await ctaBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 600));

  const modalData = await page.evaluate(() => {
    const modal = document.querySelector('.modal-container');
    const banner = document.querySelector('.selected-template-banner');
    const bannerSub = document.querySelector('.template-banner-sub')?.textContent?.trim();
    const budgetInput = document.querySelector('input[name="budget"]')?.value;
    return {
      isOpen: !!modal,
      bannerText: banner?.textContent?.trim(),
      bannerSub,
      budgetInput
    };
  });
  console.log('    Inquiry Modal State:', JSON.stringify(modalData, null, 2));
  if (!modalData.isOpen) throw new Error('Inquiry modal failed to open!');
  if (!modalData.bannerSub.includes('4 Add-ons') || !modalData.bannerSub.includes('Analytics & Conversion Tracking')) {
    throw new Error(`Inquiry modal banner does not reflect 4 add-ons! Found: ${modalData.bannerSub}`);
  }

  // Close modal
  const closeBtn = await page.$('.modal-close-btn');
  if (closeBtn) await closeBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  // Take screenshot of 4 addons in Estimator
  const estEl = await page.$('.estimator-step-block');
  if (estEl) await estEl.scrollIntoView();
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'estimator_4_addons_mobile.png') });

  // --------------------------------------------------------------------------
  // AREA 3: TECHNICAL ARSENAL TYPOGRAPHY & COMPACT AUDIT
  // --------------------------------------------------------------------------
  console.log('\n--- 3. AUDITING TECHNICAL ARSENAL TYPOGRAPHY ---');
  for (const vpKey of ['v320', 'v360', 'v390', 'v430', 'v1440']) {
    const vp = VIEWPORTS[vpKey];
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#tech', { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));

    const typoData = await page.evaluate((isDesktop) => {
      const tabTitle = document.querySelector('.tab-title-text');
      const catTitle = document.querySelector('.tech-cat-title');
      const techName = document.querySelector('.tech-name');
      const techRole = document.querySelector('.tech-role');
      const section = document.querySelector('.tech-stack-section');

      const tabTitleSize = tabTitle ? parseFloat(window.getComputedStyle(tabTitle).fontSize) : null;
      const catTitleSize = catTitle ? parseFloat(window.getComputedStyle(catTitle).fontSize) : null;
      const techNameSize = techName ? parseFloat(window.getComputedStyle(techName).fontSize) : null;
      const techRoleSize = techRole ? parseFloat(window.getComputedStyle(techRole).fontSize) : null;
      const sectionHeight = section ? section.getBoundingClientRect().height : null;

      return {
        tabTitleSize,
        catTitleSize,
        techNameSize,
        techRoleSize,
        sectionHeight,
        noHorizOverflow: document.documentElement.scrollWidth <= window.innerWidth
      };
    }, vpKey === 'v1440');

    console.log(`  [${vpKey} - ${vp.width}px]: TechName=${typoData.techNameSize}px (target 13-14), TechRole=${typoData.techRoleSize}px (target 11-12), TabTitle=${typoData.tabTitleSize}px (target 13-15), CatTitle=${typoData.catTitleSize}px, Height=${Math.round(typoData.sectionHeight)}px, noOverflow=${typoData.noHorizOverflow}`);

    if (vpKey !== 'v1440') {
      if (typoData.techNameSize < 12.8 || typoData.techNameSize > 14.5) {
        throw new Error(`Tech name font size ${typoData.techNameSize}px is out of target range (13-14px) at ${vp.width}px!`);
      }
      if (typoData.techRoleSize < 11.0 || typoData.techRoleSize > 12.5) {
        throw new Error(`Tech role font size ${typoData.techRoleSize}px is out of target range (11-12px) at ${vp.width}px!`);
      }
      if (typoData.tabTitleSize < 12.8 || typoData.tabTitleSize > 15.5) {
        throw new Error(`Tab title font size ${typoData.tabTitleSize}px is out of target range (13-15px) at ${vp.width}px!`);
      }
      if (typoData.sectionHeight > 950) {
        throw new Error(`Tech section height ${typoData.sectionHeight}px is unnecessarily tall!`);
      }
    }
    if (!typoData.noHorizOverflow) {
      throw new Error(`Horizontal overflow at ${vp.width}px!`);
    }

    if (['v320', 'v390', 'v1440'].includes(vpKey)) {
      const techEl = await page.$('.tech-stack-section');
      if (techEl) await techEl.scrollIntoView();
      await page.screenshot({ path: path.join(ARTIFACT_DIR, `tech_${vpKey}_typography.png`) });
    }
  }

  // Collapsible Guarantees Check
  console.log('\n  Checking Collapsible Architecture Standards toggle...');
  await page.setViewport(VIEWPORTS.v390);
  await page.goto('http://localhost:5173/#tech', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 400));

  const trigger = await page.$('.tech-guarantees-mobile-trigger');
  if (!trigger) throw new Error('Collapsible trigger missing!');

  const initialOpen = await page.evaluate(() => document.querySelector('.tech-guarantee-strip').classList.contains('open'));
  console.log('    Initially open:', initialOpen);
  if (initialOpen) throw new Error('Guarantees should be collapsed by default on mobile!');

  await trigger.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 200));
  const openAfterClick = await page.evaluate(() => document.querySelector('.tech-guarantee-strip').classList.contains('open'));
  console.log('    Open after expand click:', openAfterClick);
  if (!openAfterClick) throw new Error('Guarantees failed to expand!');

  await trigger.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 200));
  const closedAfterClick = await page.evaluate(() => document.querySelector('.tech-guarantee-strip').classList.contains('open'));
  console.log('    Open after collapse click:', closedAfterClick);
  if (closedAfterClick) throw new Error('Guarantees failed to collapse!');

  await browser.close();
  console.log('\n===============================================================');
  console.log('  ALL AUDITS PASSED WITH ZERO ERRORS OR REGRESSIONS!           ');
  console.log('===============================================================');
}

runAudit().catch(err => {
  console.error('\nAUDIT FAILED:', err);
  process.exit(1);
});
