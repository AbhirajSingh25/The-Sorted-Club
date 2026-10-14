const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\8e37b16b-9d2c-42d6-a40f-73cc65491e0f';

const VIEWPORTS = {
  v320: { width: 320, height: 640, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v360: { width: 360, height: 740, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v390: { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  v430: { width: 430, height: 932, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  desktop1440: { width: 1440, height: 900, deviceScaleFactor: 1, isMobile: false }
};

const ROUTES = [
  { path: '/', name: 'homepage' },
  { path: '/services', name: 'services' },
  { path: '/services/build', name: 'services_build' },
  { path: '/pricing', name: 'pricing' },
  { path: '/templates', name: 'templates' },
  { path: '/templates/saffron-and-sage', name: 'template_detail' },
  { path: '/discovery', name: 'discovery' }
];

async function verify() {
  console.log('--- STARTING THOROUGH MOBILE UX VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // SECTION 1: HEADER & HAMBURGER POSITION AT ALL WIDTHS ACROSS ALL PUBLIC ROUTES
  console.log('\n=== 1. VERIFYING HEADER & HAMBURGER POSITION ACROSS ALL ROUTES ===');
  for (const vpKey of ['v320', 'v360', 'v390', 'v430']) {
    const vp = VIEWPORTS[vpKey];
    await page.setViewport(vp);
    console.log(`\nTesting Viewport: ${vp.width}x${vp.height} (${vpKey})`);

    for (const route of ROUTES) {
      await page.goto(`http://localhost:5173${route.path}`, { waitUntil: 'networkidle0', timeout: 15000 });
      await new Promise(r => setTimeout(r, 400));

      const headerData = await page.evaluate(() => {
        const nav = document.querySelector('nav');
        const brand = document.querySelector('.brand');
        const menuBtn = document.querySelector('.menu-button');
        const docScrollWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        if (!nav || !brand || !menuBtn) {
          return { error: 'Missing nav elements', nav: !!nav, brand: !!brand, menuBtn: !!menuBtn };
        }
        const navRect = nav.getBoundingClientRect();
        const brandRect = brand.getBoundingClientRect();
        const menuRect = menuBtn.getBoundingClientRect();

        // Test if page can be scrolled horizontally
        window.scrollTo(500, 0);
        const scrolledX = window.scrollX;
        window.scrollTo(0, 0);

        return {
          winWidth,
          docScrollWidth,
          hasPageHorizontalOverflow: scrolledX > 0,
          navHeight: navRect.height,
          brandLeft: brandRect.left,
          brandWidth: brandRect.width,
          menuRight: winWidth - menuRect.right,
          menuWidth: menuRect.width,
          menuHeight: menuRect.height,
          menuOnRight: (winWidth - menuRect.right) <= 32 && menuRect.left > brandRect.right,
          brandOnLeft: brandRect.left <= 24
        };
      });

      console.log(`  Route ${route.path.padEnd(28)}: brandLeft=${headerData.brandLeft?.toFixed(1)}px, menuRight=${headerData.menuRight?.toFixed(1)}px, menuTouchTarget=${headerData.menuWidth}x${headerData.menuHeight}px, ok=${headerData.menuOnRight && headerData.brandOnLeft}, pageOverflow=${headerData.hasPageHorizontalOverflow}`);

      if (!headerData.menuOnRight || !headerData.brandOnLeft) {
        throw new Error(`Header misalignment on ${route.path} at ${vp.width}px! Brand left: ${headerData.brandLeft}, menu right: ${headerData.menuRight}`);
      }
      if (headerData.hasPageHorizontalOverflow) {
        throw new Error(`Page horizontal overflow detected on ${route.path} at ${vp.width}px!`);
      }
    }
  }

  // Capture Header Screenshots on 390px for homepage and at least 2 inner pages
  await page.setViewport(VIEWPORTS.v390);
  console.log('\nCapturing header screenshots at 390px...');
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_01_homepage_390.png') });

  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_02_services_build_390.png') });

  await page.goto('http://localhost:5173/pricing', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_03_pricing_390.png') });

  await page.goto('http://localhost:5173/templates/saffron-and-sage', { waitUntil: 'networkidle0' });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_04_template_detail_390.png') });

  // Test Drawer Open & Close Interaction on multiple routes
  console.log('\nTesting mobile drawer toggle and dismissal...');
  for (const testRoute of ['/', '/services/build', '/pricing']) {
    await page.goto(`http://localhost:5173${testRoute}`, { waitUntil: 'networkidle0' });
    const menuBtn = await page.$('.menu-button');
    await menuBtn.click();
    await new Promise(r => setTimeout(r, 400));
    const drawerOpen = await page.evaluate(() => {
      const links = document.querySelector('.navlinks.open');
      const backdrop = document.querySelector('.mobile-nav-backdrop');
      const bodyOverflow = document.body.style.overflow;
      return !!links && !!backdrop && bodyOverflow === 'hidden';
    });
    console.log(`  Drawer open on ${testRoute}:`, drawerOpen);
    if (!drawerOpen) throw new Error(`Drawer did not open properly on ${testRoute}`);

    if (testRoute === '/') {
      await page.screenshot({ path: path.join(ARTIFACT_DIR, 'header_05_drawer_open_390.png') });
    }

    // Dismiss drawer via escape key
    await page.keyboard.press('Escape');
    await new Promise(r => setTimeout(r, 300));
    const drawerClosed = await page.evaluate(() => {
      const links = document.querySelector('.navlinks.open');
      return !links;
    });
    console.log(`  Drawer closed on ${testRoute}:`, drawerClosed);
    if (!drawerClosed) throw new Error(`Drawer did not close via Escape on ${testRoute}`);
  }

  // SECTION 2: CHOOSE YOUR BUILD PACKAGE HORIZONTAL CAROUSEL (/services/build)
  console.log('\n=== 2. VERIFYING "CHOOSE YOUR BUILD PACKAGE" CAROUSEL (/services/build) ===');
  await page.setViewport(VIEWPORTS.v390);
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));

  const buildPkgGrid = await page.$('.service-pillar-packages-grid');
  if (!buildPkgGrid) throw new Error('Missing .service-pillar-packages-grid on /services/build');
  await buildPkgGrid.scrollIntoView();
  await new Promise(r => setTimeout(r, 500));

  // Check carousel properties before scrolling
  const carouselBefore = await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    const cards = Array.from(grid.querySelectorAll('.package-card'));
    const gridRect = grid.getBoundingClientRect();
    const style = window.getComputedStyle(grid);
    const cardRects = cards.map(c => {
      const r = c.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });

    return {
      cardCount: cards.length,
      display: style.display,
      flexDirection: style.flexDirection,
      overflowX: style.overflowX,
      scrollSnapType: style.scrollSnapType,
      gridWidth: gridRect.width,
      scrollLeft: grid.scrollLeft,
      scrollWidth: grid.scrollWidth,
      cardWidth: cardRects[0].width,
      // Card 0 visible, Card 1 partially visible (peeking on right)
      card0Left: cardRects[0].left,
      card0Right: cardRects[0].right,
      card1Left: cardRects[1] ? cardRects[1].left : null,
      card1Right: cardRects[1] ? cardRects[1].right : null,
      hasRightCardPeek: cardRects[1] ? (cardRects[1].left < window.innerWidth && cardRects[1].right > window.innerWidth) : false
    };
  });

  console.log('Services Build Carousel (Before scroll):', JSON.stringify(carouselBefore, null, 2));
  if (carouselBefore.display !== 'flex' || carouselBefore.overflowX !== 'auto') {
    throw new Error('Service pillar packages is not a horizontal carousel!');
  }
  if (!carouselBefore.hasRightCardPeek) {
    console.warn('Notice: Right card peek check:', carouselBefore.card1Left, 'viewport:', 390);
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_01_build_packages_initial.png') });

  // Perform smooth horizontal scroll to next card
  console.log('Scrolling horizontal carousel to next package...');
  await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    grid.scrollTo({ left: 300, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 800));

  const carouselAfter = await page.evaluate(() => {
    const grid = document.querySelector('.service-pillar-packages-grid');
    return {
      scrollLeft: grid.scrollLeft
    };
  });
  console.log('Services Build Carousel (After scroll): scrollLeft =', carouselAfter.scrollLeft);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_02_build_packages_scrolled.png') });

  // Click dot indicator 0 to scroll back
  const dot0 = await page.$('.services-carousel-indicators .carousel-dot-btn:nth-child(1)');
  if (dot0) {
    await dot0.click();
    await new Promise(r => setTimeout(r, 800));
  }

  // SECTION 3: HOMEPAGE PROJECT ESTIMATOR PACKAGE SELECTOR CAROUSEL (/#estimator)
  console.log('\n=== 3. VERIFYING ESTIMATOR SCOPE TIERS CAROUSEL (/#estimator) ===');
  await page.goto('http://localhost:5173/#estimator', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const estimatorSec = await page.$('#estimator');
  if (estimatorSec) {
    await estimatorSec.scrollIntoView();
    await new Promise(r => setTimeout(r, 600));
  }

  const estimatorTiersGrid = await page.$('.estimator-tiers-grid');
  if (!estimatorTiersGrid) throw new Error('Missing .estimator-tiers-grid on homepage');
  await estimatorTiersGrid.scrollIntoView();
  await new Promise(r => setTimeout(r, 500));

  const estimatorCarouselBefore = await page.evaluate(() => {
    const grid = document.querySelector('.estimator-tiers-grid');
    const cards = Array.from(grid.querySelectorAll('.estimator-tier-card'));
    const style = window.getComputedStyle(grid);
    const cardRects = cards.map(c => {
      const r = c.getBoundingClientRect();
      return { left: r.left, right: r.right, width: r.width };
    });
    const selectedText = document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;

    return {
      cardCount: cards.length,
      display: style.display,
      overflowX: style.overflowX,
      scrollSnapType: style.scrollSnapType,
      scrollLeft: grid.scrollLeft,
      card0Width: cardRects[0].width,
      hasRightCardPeek: cardRects[1] ? (cardRects[1].left < window.innerWidth && cardRects[1].right > window.innerWidth) : false,
      initialEstimate: selectedText
    };
  });

  console.log('Estimator Tiers Carousel (Initial):', JSON.stringify(estimatorCarouselBefore, null, 2));
  if (estimatorCarouselBefore.display !== 'flex' || estimatorCarouselBefore.overflowX !== 'auto') {
    throw new Error('Estimator tiers is not a horizontal carousel on mobile!');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_03_estimator_initial.png') });

  // Test Selection and Estimator State Update
  console.log('Testing package selection in Estimator carousel...');
  const card1 = await page.$('.estimator-tier-card:nth-child(2)');
  if (card1) {
    await card1.click();
    await new Promise(r => setTimeout(r, 500));
  }

  const estimatorAfterSelection = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
    const card1Selected = cards[1].classList.contains('selected');
    const card1BtnText = cards[1].querySelector('.tier-select-indicator span')?.textContent;
    const currentEstimate = document.querySelector('.progress-step-pill.highlight .step-val-text')?.textContent;
    return {
      card1Selected,
      card1BtnText,
      currentEstimate
    };
  });

  console.log('Estimator Tiers Carousel (After Selecting Card 2):', JSON.stringify(estimatorAfterSelection, null, 2));
  if (!estimatorAfterSelection.card1Selected) {
    throw new Error('Card 2 was not selected when clicked!');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_04_estimator_selected.png') });

  // Scroll estimator carousel horizontally to card 3
  await page.evaluate(() => {
    const grid = document.querySelector('.estimator-tiers-grid');
    grid.scrollTo({ left: 300, behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_05_estimator_scrolled.png') });

  // SECTION 4: TEST NARROW SCREENS (320px & 360px & 430px)
  console.log('\n=== 4. TESTING NARROW SCREEN (320px) FOR PACKAGE CAROUSEL & ZERO OVERFLOW ===');
  await page.setViewport(VIEWPORTS.v320);
  await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 500));
  const buildGrid320 = await page.$('.service-pillar-packages-grid');
  if (buildGrid320) await buildGrid320.scrollIntoView();
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'carousel_06_build_320px.png') });

  const overflow320 = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      winWidth: window.innerWidth,
      hasOverflow: document.documentElement.scrollWidth > window.innerWidth
    };
  });
  console.log('320px Overflow check:', overflow320);
  if (overflow320.hasOverflow) throw new Error('Horizontal page overflow at 320px on /services/build!');

  // SECTION 5: DESKTOP INTEGRITY (1440px)
  console.log('\n=== 5. VERIFYING DESKTOP INTEGRITY (1440px) ===');
  await page.setViewport(VIEWPORTS.desktop1440);
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const desktopCheck = await page.evaluate(() => {
    const menuBtn = document.querySelector('.menu-button');
    const navlinks = document.querySelector('.navlinks');
    const tiersGrid = document.querySelector('.estimator-tiers-grid');
    const menuBtnStyle = window.getComputedStyle(menuBtn);
    const navlinksStyle = window.getComputedStyle(navlinks);
    const tiersGridStyle = window.getComputedStyle(tiersGrid);

    return {
      menuBtnHidden: menuBtnStyle.display === 'none',
      navlinksVisible: navlinksStyle.display === 'flex',
      tiersGridDisplay: tiersGridStyle.display
    };
  });

  console.log('Desktop 1440px check:', JSON.stringify(desktopCheck, null, 2));
  if (!desktopCheck.menuBtnHidden) throw new Error('Menu button is visible on desktop!');
  if (!desktopCheck.navlinksVisible) throw new Error('Navlinks are not visible on desktop!');
  if (desktopCheck.tiersGridDisplay !== 'grid') throw new Error('Estimator tiers is not a grid on desktop!');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'desktop_01_homepage_1440.png') });

  await browser.close();
  console.log('\n ALL VERIFICATION CHECKS PASSED FLAWLESSLY!');
}

verify().catch((err) => {
  console.error('\n❌ VERIFICATION FAILED:', err);
  process.exit(1);
});
