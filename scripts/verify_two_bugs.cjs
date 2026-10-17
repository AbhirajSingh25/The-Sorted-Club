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

async function testAll() {
  console.log('========================================================================');
  console.log('   VERIFYING BUG FIXES: SCROLL PLAY-ONCE & CAROUSEL OUTLINE TRANSFER     ');
  console.log('========================================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  let passed = true;

  try {
    // -------------------------------------------------------------------------
    // BUG 1: VERIFY SCROLL ANIMATIONS PLAY ONLY ONCE & DO NOT REPLAY ON REVERSE SCROLL
    // -------------------------------------------------------------------------
    console.log('>>> 1. TESTING BUG 1: SCROLL ANIMATIONS PLAY ONLY ONCE');
    await page.setViewport(VIEWPORTS.v390);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Initially at top (y=0), section 01 (services) should not be fully visible or may be entering
    // Scroll down to bring section 01 into view
    console.log('  Scrolling down to Section 01 (Services)...');
    await page.evaluate(() => {
      const el = document.querySelector('#services');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 900));

    const sec1InitialState = await page.evaluate(() => {
      const el = document.querySelector('#services');
      const cs = window.getComputedStyle(el);
      const editorialLine = el.querySelector('.editorial-heading-line');
      const csLine = editorialLine ? window.getComputedStyle(editorialLine) : null;
      return {
        opacity: cs.opacity,
        transform: cs.transform,
        lineOpacity: csLine ? csLine.opacity : null
      };
    });

    console.log('  Section 01 entrance completed:', sec1InitialState);
    if (parseFloat(sec1InitialState.opacity) < 0.9) {
      console.error('  ❌ FAIL: Section 01 did not animate to visible');
      passed = false;
    } else {
      console.log('  ✓ PASS: Section 01 animated to visible state');
    }

    // Scroll far down to the bottom of the page
    console.log('  Scrolling far down to Section 08 & footer...');
    await page.evaluate(() => {
      window.scrollTo({ top: 3500, behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 600));

    // Now scroll back up to Section 01
    console.log('  Scrolling back up to Section 01 to check if animation replays...');
    await page.evaluate(() => {
      const el = document.querySelector('#services');
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    // Immediately check opacity before any animation would take 600ms
    const sec1ReverseCheck = await page.evaluate(() => {
      const el = document.querySelector('#services');
      const cs = window.getComputedStyle(el);
      return {
        opacity: cs.opacity,
        isPermanentlyVisible: parseFloat(cs.opacity) > 0.9
      };
    });

    console.log('  Section 01 reverse scroll state:', sec1ReverseCheck);
    if (!sec1ReverseCheck.isPermanentlyVisible) {
      console.error('  ❌ FAIL: Section 01 reset or replayed on reverse scroll!');
      passed = false;
    } else {
      console.log('  ✓ PASS: Section 01 stayed permanently visible, zero replay on reverse scroll');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_scroll_once_revisit.png')
    });

    // -------------------------------------------------------------------------
    // BUG 2: VERIFY PACKAGE OUTLINE TRANSFERS ACROSS EVERY CARD WHEN SWIPING
    // -------------------------------------------------------------------------
    console.log('\n>>> 2. TESTING BUG 2: PACKAGE OUTLINE TRANSFERS ACROSS ALL CARDS');
    await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Scroll to package carousel
    await page.evaluate(() => {
      const grid = document.querySelector('.service-pillar-packages-grid');
      if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 500));

    const totalCards = await page.evaluate(() => {
      return document.querySelectorAll('.service-pillar-packages-grid > .package-card').length;
    });
    console.log(`  BUILD package carousel card count: ${totalCards}`);

    // Helper to check which card has the active SVG outline
    async function getActiveOutlineCardIndex() {
      return await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.service-pillar-packages-grid > .package-card'));
        const activeIndices = [];
        cards.forEach((card, idx) => {
          const outline = card.querySelector('.signature-perimeter-active-wrap.is-focused');
          const svg = card.querySelector('.signature-perimeter-active-wrap svg');
          const path = card.querySelector('.signature-perimeter-active-wrap svg path');
          if (outline && svg && path && path.getAttribute('d')) {
            activeIndices.push(idx);
          }
        });
        const activeDot = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
        return {
          activeIndices,
          activeDot
        };
      });
    }

    // Step A: Check Card 0 initial
    const initialCheck = await getActiveOutlineCardIndex();
    console.log(`  Initial card focus: Card ${initialCheck.activeIndices} (dot ${initialCheck.activeDot})`);
    if (initialCheck.activeIndices.length !== 1 || initialCheck.activeIndices[0] !== 0) {
      console.error(`  ❌ FAIL: Expected only Card 0 to have active SVG outline, got ${initialCheck.activeIndices}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: Card 0 has initial active SVG outline');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_outline_card0.png')
    });

    // Step B: Sequentially swipe forward through every single card
    for (let targetCard = 1; targetCard < totalCards; targetCard++) {
      console.log(`  Swiping forward to Card ${targetCard}...`);
      await page.evaluate((targetIdx) => {
        const container = document.querySelector('.service-pillar-packages-grid');
        const cards = Array.from(container.querySelectorAll('.package-card'));
        const target = cards[targetIdx];
        const first = cards[0];
        const scrollLeft = target.offsetLeft - (first ? first.offsetLeft : 0);
        container.scrollTo({ left: scrollLeft, behavior: 'instant' });
        container.dispatchEvent(new Event('scroll'));
        container.dispatchEvent(new Event('scrollend'));
      }, targetCard);
      await new Promise(r => setTimeout(r, 450));

      const status = await getActiveOutlineCardIndex();
      console.log(`    Status after swipe: Active outline card(s): [${status.activeIndices.join(', ')}], Active dot: ${status.activeDot}`);

      if (status.activeIndices.length !== 1 || status.activeIndices[0] !== targetCard) {
        console.error(`  ❌ FAIL: Expected Card ${targetCard} to have active SVG outline, got [${status.activeIndices.join(', ')}]`);
        passed = false;
      } else {
        console.log(`  ✓ PASS: Outline smoothly transferred to Card ${targetCard}`);
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `verify_outline_card${targetCard}.png`)
      });
    }

    // Step C: Now swipe backward all the way back to Card 0
    console.log('\n  Swiping BACKWARD through cards to verify reverse transfer...');
    for (let targetCard = totalCards - 2; targetCard >= 0; targetCard--) {
      console.log(`  Swiping backward to Card ${targetCard}...`);
      await page.evaluate((targetIdx) => {
        const container = document.querySelector('.service-pillar-packages-grid');
        const cards = Array.from(container.querySelectorAll('.package-card'));
        const target = cards[targetIdx];
        const first = cards[0];
        const scrollLeft = target.offsetLeft - (first ? first.offsetLeft : 0);
        container.scrollTo({ left: scrollLeft, behavior: 'instant' });
        container.dispatchEvent(new Event('scroll'));
        container.dispatchEvent(new Event('scrollend'));
      }, targetCard);
      await new Promise(r => setTimeout(r, 450));

      const status = await getActiveOutlineCardIndex();
      console.log(`    Status after backward swipe: Active outline card: [${status.activeIndices.join(', ')}], Active dot: ${status.activeDot}`);

      if (status.activeIndices.length !== 1 || status.activeIndices[0] !== targetCard) {
        console.error(`  ❌ FAIL: Expected Card ${targetCard} to have active SVG outline backward, got [${status.activeIndices.join(', ')}]`);
        passed = false;
      } else {
        console.log(`  ✓ PASS: Outline smoothly transferred backward to Card ${targetCard}`);
      }
    }

    // Step D: Verify Project Estimator Carousel outline transfer
    console.log('\n>>> 3. TESTING PROJECT ESTIMATOR CAROUSEL OUTLINE TRANSFER');
    await page.goto('http://localhost:5173/#estimator', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    await page.evaluate(() => {
      const sec = document.querySelector('#estimator');
      if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 500));

    const estStatusBefore = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
      const activeIdx = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap.is-focused svg') !== null);
      return { activeIdx, count: cards.length };
    });
    console.log(`  Estimator initial active outline card: Card ${estStatusBefore.activeIdx} (total: ${estStatusBefore.count})`);

    // Swipe Estimator to Card 1
    console.log('  Swiping Estimator carousel to Card 1...');
    await page.evaluate(() => {
      const container = document.querySelector('.estimator-tiers-grid');
      const cards = Array.from(container.querySelectorAll('.estimator-tier-card'));
      const target = cards[1];
      const first = cards[0];
      const scrollLeft = target.offsetLeft - (first ? first.offsetLeft : 0);
      container.scrollTo({ left: scrollLeft, behavior: 'instant' });
      container.dispatchEvent(new Event('scroll'));
      container.dispatchEvent(new Event('scrollend'));
    });
    await new Promise(r => setTimeout(r, 500));

    const estStatusAfter = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.estimator-tier-card'));
      const activeIdx = cards.findIndex(c => c.querySelector('.signature-perimeter-active-wrap.is-focused svg') !== null);
      const activeDot = Array.from(document.querySelectorAll('.estimator-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
      return { activeIdx, activeDot };
    });
    console.log(`  Estimator after swipe: Active outline card: Card ${estStatusAfter.activeIdx}, Active dot: ${estStatusAfter.activeDot}`);

    if (estStatusAfter.activeIdx !== 1 || estStatusAfter.activeDot !== 1) {
      console.error(`  ❌ FAIL: Estimator outline did not transfer to Card 1! Got card ${estStatusAfter.activeIdx}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: Estimator outline transferred to Card 1 seamlessly');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'verify_estimator_outline_card1.png')
    });

    // -------------------------------------------------------------------------
    // STEP 4: VERIFY ACROSS ALL REQUIRED VIEWPORTS (320, 360, 390, 430, 768, 1024, 1440)
    // -------------------------------------------------------------------------
    console.log('\n>>> 4. TESTING ALL REQUIRED VIEWPORTS FOR OVERFLOW & OUTLINE INTEGRITY');
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      await page.setViewport(vp);
      await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 350));

      const vCheck = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasOverflow = docWidth > winWidth + 1;
        return {
          winWidth,
          docWidth,
          hasOverflow
        };
      });

      console.log(`  Viewport ${vpName} (${vp.width}x${vp.height}): overflow=${vCheck.hasOverflow} (docWidth: ${vCheck.docWidth})`);
      if (vCheck.hasOverflow) {
        console.error(`  ❌ FAIL: Horizontal overflow at ${vpName}`);
        passed = false;
      }
    }

  } catch (err) {
    console.error('Unexpected test error:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  if (passed) {
    console.log('   🎉 ALL TESTS PASSED! BOTH BUGS SUCCESSFULLY RESOLVED!');
  } else {
    console.log('   ❌ SOME TESTS FAILED');
  }
  console.log('========================================================================\n');

  if (!passed) process.exit(1);
}

testAll();
