const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\03e11646-aba9-494b-a285-362f67aa18d3';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const VIEWPORTS = {
  v320: { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v360: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v430: { width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v768: { width: 768, height: 1024, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v1024: { width: 1024, height: 768, deviceScaleFactor: 1, isMobile: false },
  v1440: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false }
};

const SERVICE_PATHS = [
  { path: '/services/build', title: 'BUILD' },
  { path: '/services/grow', title: 'GROW' },
  { path: '/services/automate', title: 'AUTOMATE' },
  { path: '/services/hire', title: 'HIRE' }
];

async function runVerification() {
  console.log('================================================================');
  console.log('   THE SORTED CLUB — PREMIUM REDESIGN & SIGNATURE MOTION AUDIT  ');
  console.log('================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(15000);

  // Catch console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('  [Browser Error]:', msg.text());
    }
  });

  // ---------------------------------------------------------------------------
  // 1. AUDIT ALL FOUR SERVICE PAGES
  // ---------------------------------------------------------------------------
  console.log('\n>>> CHECK 1: ALL FOUR SERVICE PAGES (BUILD, GROW, AUTOMATE, HIRE)');
  for (const s of SERVICE_PATHS) {
    console.log(`\nAuditing ${s.title} (${s.path})...`);
    await page.setViewport(VIEWPORTS.v390);
    await page.goto(`http://localhost:5173${s.path}`, { waitUntil: 'networkidle0' });
    await page.waitForSelector('.service-audience-section', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 400));

    const audit = await page.evaluate((serviceTitle) => {
      // 1. Audience profiles
      const audienceSection = document.querySelector('.service-audience-section');
      const audienceCards = Array.from(document.querySelectorAll('.audience-profile-card'));
      const profileTitles = audienceCards.map(c => c.querySelector('.audience-title')?.textContent.trim());

      // 2. Roadblocks
      const roadblocksSection = document.querySelector('.service-roadblocks-section');
      const roadblockCards = Array.from(document.querySelectorAll('.roadblock-resolution-card'));
      const roadblockDiagnostics = roadblockCards.map(c => ({
        tag: c.querySelector('.roadblock-tag')?.textContent.trim(),
        problem: c.querySelector('.roadblock-problem-text')?.textContent.trim(),
        resolution: c.querySelector('.roadblock-resolution-text')?.textContent.trim()
      }));

      // 3. Deliverables
      const deliverablesSection = document.querySelector('.service-deliverables-section');
      const deliverableCols = Array.from(document.querySelectorAll('.deliverable-pillar-col'));
      const deliverableHeadlines = deliverableCols.map(c => c.querySelector('.deliverable-pillar-headline')?.textContent.trim());

      // 4. Packages Carousel
      const packagesGrid = document.querySelector('.service-pillar-packages-grid');
      const packageCards = Array.from(document.querySelectorAll('.package-card'));
      const perimeterSvg = document.querySelector('.signature-perimeter-active-wrap svg');
      const dots = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn'));
      const activeDotIdx = dots.findIndex(d => d.classList.contains('active'));

      return {
        hasAudienceSection: !!audienceSection,
        audienceCount: audienceCards.length,
        profileTitles,
        hasRoadblocksSection: !!roadblocksSection,
        roadblockCount: roadblockCards.length,
        roadblockDiagnostics: roadblockDiagnostics.slice(0, 2),
        hasDeliverablesSection: !!deliverablesSection,
        deliverableColCount: deliverableCols.length,
        deliverableHeadlines,
        hasPackagesGrid: !!packagesGrid,
        packageCount: packageCards.length,
        hasPerimeterSvg: !!perimeterSvg,
        activeDotIdx
      };
    }, s.title);

    console.log(`  ✓ Audience Profiles count: ${audit.audienceCount} [${audit.profileTitles.join(', ')}]`);
    console.log(`  ✓ Roadblocks count: ${audit.roadblockCount} (First diagnostic: ${audit.roadblockDiagnostics[0]?.tag})`);
    console.log(`  ✓ Deliverables pillars count: ${audit.deliverableColCount} [${audit.deliverableHeadlines.join(' | ')}]`);
    console.log(`  ✓ Packages count: ${audit.packageCount}, Initial active dot: ${audit.activeDotIdx}`);

    if (audit.audienceCount < 3) throw new Error(`${s.title}: Expected 3 audience profiles, got ${audit.audienceCount}`);
    if (audit.roadblockCount < 4) throw new Error(`${s.title}: Expected 4 roadblocks, got ${audit.roadblockCount}`);
    if (audit.deliverableColCount < 3) throw new Error(`${s.title}: Expected 3 deliverable categories, got ${audit.deliverableColCount}`);

    // Screenshot on mobile viewport
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `service_${s.title.toLowerCase()}_mobile.png`),
      fullPage: false
    });
  }

  // ---------------------------------------------------------------------------
  // 2. SIGNATURE PERIMETER MOTION & CAROUSEL SWIPE SYNCHRONIZATION
  // ---------------------------------------------------------------------------
  console.log('\n>>> CHECK 2: SIGNATURE PERIMETER OUTLINE & SWIPE SYNCHRONIZATION (BUILD)');
  await page.setViewport(VIEWPORTS.v390);
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  // Scroll to packages carousel
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 400));

  // Check initial focused card
  const initialFocusCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.package-card'));
    const focusedCardIndex = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null);
    const activeDot = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
    const focusTag = document.querySelector('.perimeter-focus-tag')?.textContent.trim();
    const activeChosenBadge = document.querySelector('.perimeter-active-badge')?.textContent.trim();
    const hasActiveOutline = !!document.querySelector('.package-active-outline');

    return {
      focusedCardIndex,
      activeDot,
      focusTag,
      activeChosenBadge,
      hasActiveOutline
    };
  });

  console.log('  Initial package carousel focus state:', JSON.stringify(initialFocusCheck));
  if (initialFocusCheck.focusedCardIndex !== 0) {
    throw new Error(`Expected Card 0 to be initial focused card, got ${initialFocusCheck.focusedCardIndex}`);
  }
  if (initialFocusCheck.focusTag) {
    throw new Error(`Forbidden "IN FOCUS" label detected: ${initialFocusCheck.focusTag}`);
  }
  if (initialFocusCheck.activeChosenBadge) {
    throw new Error(`Forbidden "ACTIVE & CHOSEN" label detected: ${initialFocusCheck.activeChosenBadge}`);
  }
  if (!initialFocusCheck.hasActiveOutline) {
    throw new Error('Expected clean active card outline to be present on Card 0');
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'signature_outline_card0_initial.png')
  });

  // Swipe / scroll to Card 1 (Business Website)
  console.log('  Simulating swipe/scroll to Card 1...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollLeft = 320;
    grid.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 500));

  const card1FocusCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.package-card'));
    const focusedCardIndex = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null);
    const activeDot = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
    const card0HasOutline = cards[0].querySelector('.signature-perimeter-active-wrap') !== null;
    const card1HasOutline = cards[1].querySelector('.signature-perimeter-active-wrap') !== null;

    return {
      focusedCardIndex,
      activeDot,
      card0HasOutline,
      card1HasOutline
    };
  });

  console.log('  After scroll to Card 1 focus state:', JSON.stringify(card1FocusCheck));
  if (card1FocusCheck.focusedCardIndex !== 1 || card1FocusCheck.activeDot !== 1) {
    throw new Error(`Expected Card 1 to receive focus and active dot 1, got card ${card1FocusCheck.focusedCardIndex}, dot ${card1FocusCheck.activeDot}`);
  }
  if (card1FocusCheck.card0HasOutline) {
    throw new Error('Card 0 should no longer have outline after scrolling to Card 1');
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'signature_outline_card1_swiped.png')
  });

  // Scroll to absolute end of the carousel (Final Card: Custom Web App, index 5)
  console.log('  Scrolling to absolute end of package carousel (Final Card)...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollLeft = grid.scrollWidth - grid.clientWidth;
    grid.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 500));

  const endFocusCheck = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.package-card'));
    const focusedCardIndex = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null);
    const activeDot = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
    const lastCardIndex = cards.length - 1;

    return {
      focusedCardIndex,
      activeDot,
      lastCardIndex,
      isCorrectAtEnd: focusedCardIndex === lastCardIndex && activeDot === lastCardIndex
    };
  });

  console.log('  End of carousel focus state:', JSON.stringify(endFocusCheck));
  if (!endFocusCheck.isCorrectAtEnd) {
    throw new Error(`Final card at end of carousel should receive focus! Got card ${endFocusCheck.focusedCardIndex}, dot ${endFocusCheck.activeDot}, expected ${endFocusCheck.lastCardIndex}`);
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'signature_outline_final_card_end.png')
  });

  // Swipe BACK to Card 0
  console.log('  Scrolling back to Card 0...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollLeft = 0;
    grid.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 500));

  const backTo0Check = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.package-card'));
    return {
      focusedCardIndex: cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null),
      activeDot: Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'))
    };
  });
  console.log('  Back to Card 0 state:', JSON.stringify(backTo0Check));
  if (backTo0Check.focusedCardIndex !== 0 || backTo0Check.activeDot !== 0) {
    throw new Error(`Swiping back to 0 failed: card ${backTo0Check.focusedCardIndex}, dot ${backTo0Check.activeDot}`);
  }

  // ---------------------------------------------------------------------------
  // 3. PROJECT ESTIMATOR SIGNATURE OUTLINE & COMMERCIAL CALCULATIONS
  // ---------------------------------------------------------------------------
  console.log('\n>>> CHECK 3: PROJECT ESTIMATOR SIGNATURE OUTLINE & PRICING INTEGRITY');
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const estInitial = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
    const focusedCardIndex = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null);
    const activeDot = Array.from(document.querySelectorAll('.estimator-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
    const selectedText = document.querySelector('.summary-total-val')?.textContent || document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;

    return {
      focusedCardIndex,
      activeDot,
      selectedText,
      tierCount: cards.length
    };
  });

  console.log('  Estimator initial state:', JSON.stringify(estInitial));

  // Scroll Estimator carousel to Card 1
  console.log('  Scrolling Estimator carousel to Card 1...');
  await page.evaluate(() => {
    const grid = document.querySelector('.estimator-tiers-grid');
    grid.scrollLeft = 320;
    grid.dispatchEvent(new Event('scroll'));
  });
  await new Promise(r => setTimeout(r, 500));

  const estCard1State = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
    const focusedCardIndex = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap') !== null);
    const activeDot = Array.from(document.querySelectorAll('.estimator-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
    const card0HasOutline = cards[0].querySelector('.signature-perimeter-active-wrap') !== null;
    const card1HasOutline = cards[1].querySelector('.signature-perimeter-active-wrap') !== null;
    const priceAfterScroll = document.querySelector('.summary-total-val')?.textContent || document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;

    return {
      focusedCardIndex,
      activeDot,
      card0HasOutline,
      card1HasOutline,
      priceAfterScroll
    };
  });

  console.log('  Estimator after scroll to Card 1:', JSON.stringify(estCard1State));
  if (estCard1State.focusedCardIndex !== 1 || estCard1State.activeDot !== 1) {
    throw new Error(`Estimator should focus Card 1 after scroll, got card ${estCard1State.focusedCardIndex}, dot ${estCard1State.activeDot}`);
  }
  if (estCard1State.card0HasOutline) {
    throw new Error('Estimator Card 0 should not have outline after scrolling to Card 1');
  }

  // Verify that scrolling alone DID NOT alter estimate total or corrupt selection
  if (estCard1State.priceAfterScroll !== estInitial.selectedText) {
    throw new Error(`Scrolling carousel altered estimate total! Before: ${estInitial.selectedText}, After: ${estCard1State.priceAfterScroll}`);
  }

  // Now explicitly CLICK Card 1 (Business Website) to select it
  console.log('  Clicking Card 1 (Business Website) to select it...');
  const card1 = await page.$('.estimator-tier-card:nth-child(2)');
  await card1.click();
  await new Promise(r => setTimeout(r, 400));

  const afterClickState = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
    const card1Selected = cards[1].classList.contains('selected');
    const radioText = cards[1].querySelector('.tier-select-indicator span')?.textContent;
    const priceText = document.querySelector('.summary-price-amount strong')?.textContent || document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;

    return {
      card1Selected,
      radioText,
      priceText
    };
  });

  console.log('  After clicking Card 1:', JSON.stringify(afterClickState));
  if (!afterClickState.card1Selected) {
    throw new Error('Card 1 must have .selected class after click!');
  }
  if (!afterClickState.priceText.includes('24,999')) {
    throw new Error(`Expected base price to include 24,999, got ${afterClickState.priceText}`);
  }

  // ---------------------------------------------------------------------------
  // 4. DESKTOP 1440px VIEWPORT VERIFICATION
  // ---------------------------------------------------------------------------
  console.log('\n>>> CHECK 4: DESKTOP 1440px VIEWPORT & EDITORIAL LAYOUT');
  await page.setViewport(VIEWPORTS.v1440);
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const desktopCheck = await page.evaluate(() => {
    const audienceGrid = document.querySelector('.service-audience-grid');
    const roadblocksGrid = document.querySelector('.service-roadblocks-grid');
    const deliverablesGrid = document.querySelector('.service-deliverables-editorial');
    const packagesGrid = document.querySelector('.service-pillar-packages-grid');

    const audienceCols = window.getComputedStyle(audienceGrid).gridTemplateColumns.split(' ').length;
    const roadblockCols = window.getComputedStyle(roadblocksGrid).gridTemplateColumns.split(' ').length;
    const deliverableCols = window.getComputedStyle(deliverablesGrid).gridTemplateColumns.split(' ').length;

    return {
      audienceCols,
      roadblockCols,
      deliverableCols,
      packagesDisplay: window.getComputedStyle(packagesGrid).display
    };
  });

  console.log('  Desktop 1440px Grid Columns:', JSON.stringify(desktopCheck));
  if (desktopCheck.audienceCols !== 3) {
    throw new Error(`Expected 3 columns for audience grid on desktop, got ${desktopCheck.audienceCols}`);
  }
  if (desktopCheck.roadblockCols !== 2) {
    throw new Error(`Expected 2 columns for roadblocks grid on desktop, got ${desktopCheck.roadblockCols}`);
  }
  if (desktopCheck.deliverableCols !== 3) {
    throw new Error(`Expected 3 columns for deliverables grid on desktop, got ${desktopCheck.deliverableCols}`);
  }

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'desktop_1440_build_full.png'),
    fullPage: true
  });

  // Capture homepage desktop
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'desktop_1440_homepage_full.png'),
    fullPage: false
  });

  await browser.close();
  console.log('\n================================================================');
  console.log('   ✅ ALL VERIFICATION CHECKS PASSED WITH ZERO ERRORS!          ');
  console.log('================================================================\n');
}

runVerification().catch(err => {
  console.error('\n❌ AUDIT FAILED:', err);
  process.exit(1);
});
