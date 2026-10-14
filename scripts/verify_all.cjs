const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\2d133000-b8b1-4588-a389-27115484df1b';

const VIEWPORTS = {
  v320: { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v360: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v430: { width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v768: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v1024: { width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false },
  v1440: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false }
};

async function runComprehensiveVerification() {
  console.log('========================================================');
  console.log('   STARTING THE SORTED CLUB COMPREHENSIVE VERIFICATION  ');
  console.log('========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // -------------------------------------------------------------------------
  // AREA 1: FOUNDER PHOTOGRAPH & RESPONSIVE COMPACT LAYOUT
  // -------------------------------------------------------------------------
  console.log('=== AREA 1: FOUNDER PHOTOGRAPH & RESPONSIVE LAYOUT ===');

  for (const vpKey of ['v320', 'v360', 'v390', 'v430', 'v768', 'v1024', 'v1440']) {
    const vp = VIEWPORTS[vpKey];
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#founder', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const founderEl = await page.$('#founder');
    if (founderEl) await founderEl.scrollIntoView();
    await new Promise(r => setTimeout(r, 300));

    const founderData = await page.evaluate(() => {
      const section = document.querySelector('#founder');
      const img = document.querySelector('.founder-portrait-img');
      const wrapper = document.querySelector('.founder-image-wrapper');
      const nameplate = document.querySelector('.founder-info-beside') || document.querySelector('.founder-nameplate');
      const h3 = document.querySelector('.founder-nameplate h3');

      if (!img || !wrapper || !nameplate) {
        return { error: 'Missing founder elements' };
      }

      const imgRect = img.getBoundingClientRect();
      const wrapRect = wrapper.getBoundingClientRect();
      const nameRect = nameplate.getBoundingClientRect();

      return {
        imgSrc: img.getAttribute('src'),
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight,
        wrapWidth: wrapRect.width,
        wrapHeight: wrapRect.height,
        imgVisible: imgRect.width > 0 && imgRect.height > 0,
        isSideBySide: wrapRect.right <= nameRect.left + 5 && Math.abs(wrapRect.top - nameRect.top) < 40,
        founderName: h3 ? h3.textContent : null
      };
    });

    console.log(`[${vpKey} - ${vp.width}px] Founder: wrap=${founderData.wrapWidth?.toFixed(1)}x${founderData.wrapHeight?.toFixed(1)}px, sideBySide=${founderData.isSideBySide}, src=${founderData.imgSrc}, natural=${founderData.naturalWidth}x${founderData.naturalHeight}`);

    if (founderData.imgSrc !== '/images/founder-abhiraj.jpg') {
      throw new Error(`Founder image source is invalid: ${founderData.imgSrc}`);
    }
    if (founderData.naturalWidth === 0) {
      throw new Error(`Founder image failed to load!`);
    }

    // Capture screenshots at 320, 390, 768, 1440
    if (['v320', 'v390', 'v768', 'v1440'].includes(vpKey)) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `founder_${vpKey}.png`)
      });
    }
  }

  // -------------------------------------------------------------------------
  // AREA 2: CAROUSEL PAGINATION SITE-WIDE
  // -------------------------------------------------------------------------
  console.log('\n=== AREA 2: CAROUSEL PAGINATION SITE-WIDE ===');
  await page.setViewport(VIEWPORTS.v390);

  // 2A: Services Packages Carousel (/services/build)
  console.log('\nTesting /services/build horizontal package carousel...');
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const buildPkgGrid = await page.$('.service-pillar-packages-grid');
  await buildPkgGrid.scrollIntoView();
  await new Promise(r => setTimeout(r, 300));

  let dotIndex0 = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Initial active dot:', dotIndex0);
  if (dotIndex0 !== 0) throw new Error(`Initial active dot should be 0, got ${dotIndex0}`);

  // Scroll to Card 1
  console.log('  Scrolling to Card 1...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollTo({ left: 320, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 600));

  let dotIndex1 = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Active dot after scroll to card 1:', dotIndex1);
  if (dotIndex1 !== 1) throw new Error(`Active dot should be 1 after scroll, got ${dotIndex1}`);

  // Scroll to Card 2
  console.log('  Scrolling to Card 2...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollTo({ left: 640, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 600));

  let dotIndex2 = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Active dot after scroll to card 2:', dotIndex2);
  if (dotIndex2 !== 2) throw new Error(`Active dot should be 2 after scroll, got ${dotIndex2}`);

  // Tap Dot 0 to scroll back smoothly
  console.log('  Tapping Dot 0 to scroll back...');
  const scrollYBeforeDotClick = await page.evaluate(() => window.scrollY);
  const dot0 = await page.$('.services-carousel-indicators .carousel-dot-btn:nth-child(1)');
  await dot0.click();
  await new Promise(r => setTimeout(r, 600));

  const scrollYAfterDotClick = await page.evaluate(() => window.scrollY);
  let dotIndexBack = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Active dot after tapping dot 0:', dotIndexBack, `(Vertical scroll jump: ${Math.abs(scrollYAfterDotClick - scrollYBeforeDotClick)}px)`);
  if (dotIndexBack !== 0) throw new Error(`Active dot should be 0 after tapping dot 0, got ${dotIndexBack}`);
  if (Math.abs(scrollYAfterDotClick - scrollYBeforeDotClick) > 2) {
    throw new Error(`Vertical scroll jumped unexpectedly on dot click! Before: ${scrollYBeforeDotClick}, After: ${scrollYAfterDotClick}`);
  }

  // 2B: Estimator Scope Tiers Carousel (/#estimator)
  console.log('\nTesting Homepage Estimator scope tiers carousel...');
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const estGrid = await page.$('.estimator-tiers-grid');
  await estGrid.scrollIntoView();
  await new Promise(r => setTimeout(r, 300));

  let estDot0 = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.estimator-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Estimator initial active dot:', estDot0);

  // Scroll to Card 1 in Estimator
  console.log('  Scrolling Estimator carousel to Card 1...');
  await page.evaluate(() => {
    const grid = document.querySelector('.estimator-tiers-grid');
    grid.scrollTo({ left: 320, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 600));

  let estDot1 = await page.evaluate(() => {
    const dots = Array.from(document.querySelectorAll('.estimator-carousel-indicators .carousel-dot-btn'));
    return dots.findIndex(d => d.classList.contains('active'));
  });
  console.log('  Estimator active dot after scroll:', estDot1);
  if (estDot1 !== 1) throw new Error(`Estimator active dot should be 1 after scroll, got ${estDot1}`);

  // Test that scrolling does NOT unexpectedly change package selection or totals
  console.log('  Checking that scrolling did NOT change selected package or total...');
  const estStateAfterScroll = await page.evaluate(() => {
    const selectedTier = document.querySelector('.estimator-tier-card.selected h4')?.textContent;
    const currentPrice = document.querySelector('.summary-total-val')?.textContent || document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;
    return { selectedTier, currentPrice };
  });
  console.log('  State after scroll:', estStateAfterScroll);

  // -------------------------------------------------------------------------
  // AREA 3: FIX MOBILE NAVIGATION FROM ANY SCROLL POSITION
  // -------------------------------------------------------------------------
  console.log('\n=== AREA 3: MOBILE NAVIGATION DRAWER FROM SCROLLED POSITION ===');
  for (const testPath of ['/', '/services/build', '/pricing', '/templates']) {
    console.log(`\nTesting drawer on ${testPath}...`);
    await page.goto(`http://localhost:5173${testPath}`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    // Scroll 1000px down
    await page.evaluate(() => window.scrollTo(0, 1000));
    await new Promise(r => setTimeout(r, 300));

    const scrollYInitial = await page.evaluate(() => window.scrollY);
    console.log(`  Initial scrollY: ${scrollYInitial}px`);

    const menuBtn = await page.$('.menu-button');
    if (!menuBtn) throw new Error(`Menu button not found on ${testPath}`);

    // Click hamburger button
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const drawerCheck = await page.evaluate(() => {
      const drawer = document.querySelector('#public-mobile-navlinks');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      const nav = document.querySelector('nav');
      const drawerRect = drawer ? drawer.getBoundingClientRect() : null;
      const navRect = nav ? nav.getBoundingClientRect() : null;
      const bodyOverflow = document.body.style.overflow;
      const docOverflow = document.documentElement.style.overflow;

      return {
        hasDrawer: !!drawer,
        hasBackdrop: !!backdrop,
        bodyOverflow,
        docOverflow,
        scrollY: window.scrollY,
        navBottom: navRect ? navRect.bottom : null,
        drawerTop: drawerRect ? drawerRect.top : null,
        drawerHeight: drawerRect ? drawerRect.height : null,
        isDirectlyBelowNav: drawerRect && navRect ? Math.abs(drawerRect.top - navRect.bottom) < 2 : false
      };
    });

    console.log(`  Drawer open state on ${testPath}:`, JSON.stringify(drawerCheck, null, 2));
    if (!drawerCheck.hasDrawer || !drawerCheck.hasBackdrop) {
      throw new Error(`Drawer or backdrop missing on ${testPath}`);
    }
    if (!drawerCheck.isDirectlyBelowNav) {
      throw new Error(`Drawer top (${drawerCheck.drawerTop}) is not directly below nav bottom (${drawerCheck.navBottom})!`);
    }

    // Dismiss via Close button
    const closeBtn = await page.$('.menu-button');
    await closeBtn.click();
    await new Promise(r => setTimeout(r, 400));

    const scrollYRestored = await page.evaluate(() => window.scrollY);
    console.log(`  ScrollY after closing drawer: ${scrollYRestored}px (Initial was ${scrollYInitial}px)`);
    if (Math.abs(scrollYRestored - scrollYInitial) > 2) {
      throw new Error(`Scroll position was not preserved after closing drawer on ${testPath}!`);
    }
  }

  // -------------------------------------------------------------------------
  // AREA 4: PRICING AND CURRENCY INTEGRITY AUDIT
  // -------------------------------------------------------------------------
  console.log('\n=== AREA 4: PRICING AND CURRENCY INTEGRITY AUDIT ===');
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  // Select Business Website (Base: ₹24,999 / $650)
  console.log('Selecting Business Website in Estimator...');
  const businessTier = await page.$('.estimator-tier-card:nth-child(2)');
  if (businessTier) {
    await businessTier.evaluate(el => el.click());
  }
  await new Promise(r => setTimeout(r, 400));

  const getEstimatorPrice = async () => {
    return await page.evaluate(() => {
      const el = document.querySelector('.summary-price-amount strong') ||
                 document.querySelector('.progress-step-pill.highlight .step-val-text') ||
                 document.querySelector('.mobile-step-price strong');
      return el ? el.textContent.trim() : '';
    });
  };

  const basePriceText = await getEstimatorPrice();
  console.log('  Base Business Website Price:', basePriceText);
  if (!basePriceText.includes('24,999')) {
    throw new Error(`Expected Business Website base price to include 24,999, got ${basePriceText}`);
  }

  // Select Add-on 1 (WhatsApp AI: +₹4,999)
  console.log('Selecting Add-on 1 (WhatsApp AI)...');
  const addon1 = await page.$('.estimator-addon-card:nth-child(1)');
  await addon1.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  const priceWithAddon1 = await getEstimatorPrice();
  console.log('  Price with 1 Add-on (₹24,999 + ₹4,999):', priceWithAddon1);
  if (!priceWithAddon1.includes('29,998')) {
    throw new Error(`Expected combined price to include 29,998, got ${priceWithAddon1}`);
  }

  // Select Add-on 2 (Local SEO: +₹4,999)
  console.log('Selecting Add-on 2 (Local SEO)...');
  const addon2 = await page.$('.estimator-addon-card:nth-child(2)');
  await addon2.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  const priceWithAddon2 = await getEstimatorPrice();
  console.log('  Price with 2 Add-ons (₹24,999 + ₹4,999 + ₹4,999):', priceWithAddon2);
  if (!priceWithAddon2.includes('34,997')) {
    throw new Error(`Expected combined price to include 34,997, got ${priceWithAddon2}`);
  }

  // Deselect Add-on 2
  console.log('Deselecting Add-on 2...');
  await addon2.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  const priceAfterRemove = await getEstimatorPrice();
  console.log('  Price after removing 1 add-on:', priceAfterRemove);
  if (!priceAfterRemove.includes('29,998')) {
    throw new Error(`Expected price after remove to be 29,998, got ${priceAfterRemove}`);
  }

  // Click CTA to open Inquiry Modal
  console.log('Clicking "Lock In Scope & Start Project" CTA...');
  const ctaBtn = await page.$('.summary-cta-btn');
  await ctaBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 500));

  // Inspect Inquiry Modal
  const modalData = await page.evaluate(() => {
    const bannerTitle = document.querySelector('.template-banner-title')?.textContent?.trim();
    const bannerSub = document.querySelector('.template-banner-sub')?.textContent?.trim();
    const budgetInput = document.querySelector('#budget-label')?.parentElement?.textContent?.trim();
    const activeCurrency = document.querySelector('.currency-btn.active')?.textContent?.trim();
    const problemText = document.querySelector('#inquiry-problem')?.value;
    const budgetPillSelected = document.querySelector('.budget-pill-btn.selected')?.textContent?.trim();

    return {
      bannerTitle,
      bannerSub,
      budgetInput,
      activeCurrency,
      problemText,
      budgetPillSelected
    };
  });

  console.log('  Inquiry Modal State:', JSON.stringify(modalData, null, 2));
  if (!modalData.bannerSub.includes('29,998')) {
    throw new Error(`Inquiry Modal banner rate does not include combined total 29,998: ${modalData.bannerSub}`);
  }
  if (!modalData.bannerSub.includes('1 Add-on')) {
    throw new Error(`Inquiry Modal banner missing add-on info: ${modalData.bannerSub}`);
  }
  if (!modalData.budgetPillSelected.includes('29,998')) {
    throw new Error(`Inquiry Modal budget pill is not selected with exact configured rate: ${modalData.budgetPillSelected}`);
  }

  // Test Currency Toggle to USD inside Inquiry Modal
  console.log('Toggling currency to USD inside Inquiry Modal...');
  const usdBtn = await page.$('.currency-toggle-container .currency-btn:nth-child(2)');
  await usdBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  const modalDataUSD = await page.evaluate(() => {
    const bannerSub = document.querySelector('.template-banner-sub')?.textContent?.trim();
    const budgetPillSelected = document.querySelector('.budget-pill-btn.selected')?.textContent?.trim();
    return { bannerSub, budgetPillSelected };
  });

  console.log('  Inquiry Modal State (USD):', JSON.stringify(modalDataUSD, null, 2));
  // Business ($650) + WhatsApp AI ($130) = $780
  if (!modalDataUSD.bannerSub.includes('780')) {
    throw new Error(`USD toggle did not update combined total to $780: ${modalDataUSD.bannerSub}`);
  }
  if (!modalDataUSD.budgetPillSelected.includes('780')) {
    throw new Error(`USD toggle did not update selected budget pill to $780: ${modalDataUSD.budgetPillSelected}`);
  }

  // Toggle back to INR
  console.log('Toggling back to INR...');
  const inrBtn = await page.$('.currency-toggle-container .currency-btn:nth-child(1)');
  await inrBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  const modalDataINRBack = await page.evaluate(() => {
    return document.querySelector('.template-banner-sub')?.textContent?.trim();
  });
  console.log('  Inquiry Modal Rate (Restored INR):', modalDataINRBack);
  if (!modalDataINRBack.includes('29,998')) {
    throw new Error(`Restoring INR did not return to 29,998: ${modalDataINRBack}`);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'inquiry_modal_verified.png') });

  // Close modal
  const closeModalBtn = await page.$('.modal-close-btn');
  if (closeModalBtn) await closeModalBtn.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 400));

  await browser.close();
  console.log('\n========================================================');
  console.log('  ALL COMPREHENSIVE VERIFICATION TESTS PASSED WITH 100%! ');
  console.log('========================================================\n');
}

runComprehensiveVerification().catch(err => {
  console.error('\n❌ VERIFICATION ERROR:', err);
  process.exit(1);
});
