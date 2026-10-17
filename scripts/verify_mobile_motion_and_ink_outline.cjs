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

const SERVICE_ROUTES = [
  { path: '/services/build', title: 'BUILD' },
  { path: '/services/grow', title: 'GROW' },
  { path: '/services/automate', title: 'AUTOMATE' },
  { path: '/services/hire', title: 'HIRE' }
];

async function runAudit() {
  console.log('========================================================================');
  console.log('   THE SORTED CLUB — ROADBLOCK ARROW REMOVAL & INK MOTION VERIFICATION  ');
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
    // 1. AUDIT ROADBLOCK CARDS ACROSS ALL 4 SERVICES (BUILD, GROW, AUTOMATE, HIRE)
    // -------------------------------------------------------------------------
    console.log('>>> 1. AUDITING ROADBLOCK CARDS (ARROW REMOVAL & NATURAL FLOW)');
    for (const service of SERVICE_ROUTES) {
      console.log(`\n  Checking ${service.title} (${service.path})...`);
      await page.setViewport(VIEWPORTS.v390);
      await page.goto(`http://localhost:5173${service.path}`, { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 400));

      // Scroll to roadblocks section
      await page.evaluate(() => {
        const sec = document.querySelector('.service-roadblocks-section');
        if (sec) sec.scrollIntoView({ behavior: 'instant', block: 'center' });
      });
      await new Promise(r => setTimeout(r, 400));

      const roadblockAudit = await page.evaluate(() => {
        const connectors = document.querySelectorAll('.roadblock-connector, .roadblock-arrow');
        const cards = Array.from(document.querySelectorAll('.roadblock-compact-card, .roadblock-resolution-card'));
        
        let foundArrowsInText = 0;
        const cardDetails = cards.map(c => {
          const problemEl = c.querySelector('.roadblock-problem-text');
          const solutionEl = c.querySelector('.roadblock-solution-text');
          const dotProblem = c.querySelector('.roadblock-dot.problem');
          const dotSolution = c.querySelector('.roadblock-dot.solution');
          const body = c.querySelector('.roadblock-compact-body');
          const textContent = body ? body.textContent : '';

          if (textContent.includes('→')) foundArrowsInText++;

          return {
            hasProblem: !!problemEl && problemEl.textContent.trim().length > 0,
            hasSolution: !!solutionEl && solutionEl.textContent.trim().length > 0,
            hasProblemDot: !!dotProblem && dotProblem.textContent.trim() === '✕',
            hasSolutionDot: !!dotSolution && dotSolution.textContent.trim() === '✓'
          };
        });

        return {
          connectorCount: connectors.length,
          foundArrowsInText,
          cardCount: cards.length,
          cardDetails
        };
      });

      console.log(`    Cards found: ${roadblockAudit.cardCount}`);
      console.log(`    Connectors/Arrows found: ${roadblockAudit.connectorCount} (must be 0)`);
      console.log(`    Arrows in text: ${roadblockAudit.foundArrowsInText} (must be 0)`);

      if (roadblockAudit.connectorCount > 0 || roadblockAudit.foundArrowsInText > 0) {
        console.error(`    ❌ FAIL: Roadblock connector or arrow found on ${service.title}`);
        passed = false;
      } else {
        console.log(`    ✓ PASS: Roadblock connector completely removed on ${service.title}`);
      }

      for (let i = 0; i < roadblockAudit.cardDetails.length; i++) {
        const cd = roadblockAudit.cardDetails[i];
        if (!cd.hasProblem || !cd.hasSolution || !cd.hasProblemDot || !cd.hasSolutionDot) {
          console.error(`    ❌ FAIL: Card ${i} missing problem/solution or check/cross dot`);
          passed = false;
        }
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `audit_roadblocks_${service.title.toLowerCase()}_390.png`)
      });
    }

    // -------------------------------------------------------------------------
    // 2. AUDIT PACKAGE OUTLINE: SINGLE DEEP-INK STROKE & ZERO GREEN HALO
    // -------------------------------------------------------------------------
    console.log('\n>>> 2. AUDITING PACKAGE OUTLINE (SINGLE DEEP-INK STROKE)');
    await page.setViewport(VIEWPORTS.v390);
    await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 500));

    // Scroll to packages carousel
    await page.evaluate(() => {
      const grid = document.querySelector('.service-pillar-packages-grid');
      if (grid) grid.scrollIntoView({ behavior: 'instant', block: 'center' });
    });
    await new Promise(r => setTimeout(r, 600));

    const outlineAudit = await page.evaluate(() => {
      const outline = document.querySelector('.signature-perimeter-active-wrap.is-focused');
      if (!outline) return { error: 'No active outline found' };

      const svg = outline.querySelector('svg');
      const pathEl = outline.querySelector('svg path');
      const cs = window.getComputedStyle(outline);

      const pathStroke = pathEl ? pathEl.getAttribute('stroke') : null;
      const pathFill = pathEl ? pathEl.getAttribute('fill') : null;
      const pathD = pathEl ? pathEl.getAttribute('d') : null;
      const strokeWidth = pathEl ? pathEl.getAttribute('stroke-width') : null;

      // Check for green glow or outer shadow in computed style
      const boxShadow = cs.boxShadow;
      const border = cs.border;
      const outlineStyle = cs.outline;

      const hasAcidOrGreen =
        boxShadow.includes('216, 255, 85') ||
        boxShadow.includes('d8ff55') ||
        border.includes('216, 255, 85') ||
        border.includes('d8ff55');

      return {
        hasOutline: !!outline,
        hasSvg: !!svg,
        hasPath: !!pathEl,
        pathStroke,
        pathFill,
        pathD,
        strokeWidth,
        boxShadow,
        hasAcidOrGreen
      };
    });

    console.log('  Outline Audit Result:', JSON.stringify(outlineAudit, null, 2));

    if (!outlineAudit.hasOutline || !outlineAudit.hasSvg || !outlineAudit.hasPath) {
      console.error('  ❌ FAIL: Package active outline or SVG path missing');
      passed = false;
    } else {
      console.log('  ✓ PASS: SVG perimeter outline is present');
    }

    if (outlineAudit.pathStroke !== '#10100f') {
      console.error(`  ❌ FAIL: Expected stroke to be #10100f, got ${outlineAudit.pathStroke}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: Stroke is single deep-ink #10100f');
    }

    if (outlineAudit.hasAcidOrGreen) {
      console.error('  ❌ FAIL: Green glow or acid shadow detected in package outline');
      passed = false;
    } else {
      console.log('  ✓ PASS: Zero green glow or halo on package outline');
    }

    // Capture initial outline
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit_package_ink_outline_card0.png')
    });

    // -------------------------------------------------------------------------
    // 3. AUDIT CAROUSEL FOCUS VS PACKAGE SELECTION INDEPENDENCE
    // -------------------------------------------------------------------------
    console.log('\n>>> 3. AUDITING CAROUSEL SWIPE & SELECTION INDEPENDENCE');
    const selectionCheckBefore = await page.evaluate(() => {
      const chosenCard = document.querySelector('.package-card.chosen');
      const popularBadge = document.querySelector('.package-popular-badge');
      return {
        chosenText: chosenCard ? chosenCard.querySelector('h3')?.textContent.trim() : null,
        popularCardName: popularBadge ? popularBadge.closest('.package-card')?.querySelector('h3')?.textContent.trim() : null
      };
    });

    console.log(`  Initial chosen package: ${selectionCheckBefore.chosenText}`);
    console.log(`  Popular package: ${selectionCheckBefore.popularCardName}`);

    // Swipe to Card 1
    console.log('  Swiping/scrolling carousel to Card 1...');
    await page.evaluate(() => {
      const grid = document.querySelector('.service-pillar-packages-grid');
      grid.scrollLeft = 320;
      grid.dispatchEvent(new Event('scroll'));
    });
    await new Promise(r => setTimeout(r, 600));

    const swipeAudit = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.package-card'));
      const card0HasOutline = !!cards[0].querySelector('.signature-perimeter-active-wrap.is-focused');
      const card1HasOutline = !!cards[1].querySelector('.signature-perimeter-active-wrap.is-focused');
      const activeDot = Array.from(document.querySelectorAll('.services-carousel-indicators .carousel-dot-btn')).findIndex(d => d.classList.contains('active'));
      const chosenCard = document.querySelector('.package-card.chosen');
      const popularBadges = document.querySelectorAll('.package-popular-badge');

      return {
        card0HasOutline,
        card1HasOutline,
        activeDot,
        chosenText: chosenCard ? chosenCard.querySelector('h3')?.textContent.trim() : null,
        popularBadgeCount: popularBadges.length
      };
    });

    console.log('  After swipe audit:', JSON.stringify(swipeAudit, null, 2));

    if (swipeAudit.card0HasOutline || !swipeAudit.card1HasOutline) {
      console.error('  ❌ FAIL: Active outline did not cleanly transfer from card 0 to card 1');
      passed = false;
    } else {
      console.log('  ✓ PASS: Active ink outline cleanly transitioned to card 1');
    }

    if (swipeAudit.activeDot !== 1) {
      console.error(`  ❌ FAIL: Expected active dot to be 1, got ${swipeAudit.activeDot}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: Carousel pagination synchronized with active dot 1');
    }

    if (swipeAudit.chosenText !== selectionCheckBefore.chosenText) {
      console.error(`  ❌ FAIL: Swiping changed selected package! Before: ${selectionCheckBefore.chosenText}, After: ${swipeAudit.chosenText}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: Swiping did NOT change chosen package selection');
    }

    if (swipeAudit.popularBadgeCount !== 1) {
      console.error(`  ❌ FAIL: Expected exactly 1 MOST POPULAR badge, found ${swipeAudit.popularBadgeCount}`);
      passed = false;
    } else {
      console.log('  ✓ PASS: MOST POPULAR badge remains only on the designated popular package');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit_package_ink_outline_card1_swiped.png')
    });

    // -------------------------------------------------------------------------
    // 4. AUDIT BIDIRECTIONAL SCROLL MOTION ON MOBILE (DOWN AND UP)
    // -------------------------------------------------------------------------
    console.log('\n>>> 4. AUDITING BIDIRECTIONAL MOBILE SCROLL MOTION');
    await page.setViewport(VIEWPORTS.v390);
    await page.goto('http://localhost:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 600));

    // Scroll down slowly through homepage
    console.log('  Scrolling down through homepage sections...');
    const scrollDownSteps = [300, 800, 1500, 2400, 3200];
    for (const pos of scrollDownSteps) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), pos);
      await new Promise(r => setTimeout(r, 350));
    }

    const downScrollState = await page.evaluate(() => {
      const editorialLines = document.querySelectorAll('.editorial-heading-line');
      return {
        editorialLineCount: editorialLines.length,
        scrollY: window.scrollY
      };
    });
    console.log(`    Scrolled down to Y=${downScrollState.scrollY}, Editorial heading lines: ${downScrollState.editorialLineCount}`);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit_homepage_mobile_scrolled_down.png')
    });

    // Now scroll back UP to verify bidirectional motion without freeze
    console.log('  Scrolling back UP through homepage sections...');
    const scrollUpSteps = [2000, 1000, 400, 0];
    for (const pos of scrollUpSteps) {
      await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), pos);
      await new Promise(r => setTimeout(r, 350));
    }

    const upScrollState = await page.evaluate(() => {
      const hero = document.querySelector('.hero');
      const services = document.querySelector('.services');
      return {
        heroVisible: !!hero,
        servicesVisible: !!services,
        scrollY: window.scrollY
      };
    });
    console.log(`    Scrolled back UP to Y=${upScrollState.scrollY}, Sections responsive: ${upScrollState.heroVisible && upScrollState.servicesVisible}`);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'audit_homepage_mobile_scrolled_up.png')
    });

    // -------------------------------------------------------------------------
    // 5. AUDIT RESPONSIVE VIEWPORTS (320, 360, 390, 430, 768, 1024, 1440)
    // -------------------------------------------------------------------------
    console.log('\n>>> 5. AUDITING ALL REQUIRED RESPONSIVE VIEWPORTS');
    for (const [vpName, vp] of Object.entries(VIEWPORTS)) {
      console.log(`  Testing ${vpName} (${vp.width}x${vp.height})...`);
      await page.setViewport(vp);
      await page.goto('http://localhost:5173/services/build', { waitUntil: 'networkidle0' });
      await new Promise(r => setTimeout(r, 400));

      const responsiveCheck = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        const hasHorizontalOverflow = docWidth > winWidth + 1;
        const activeOutline = document.querySelector('.signature-perimeter-active-wrap.is-focused svg');
        const roadblockConnectors = document.querySelectorAll('.roadblock-connector, .roadblock-arrow');

        return {
          winWidth,
          docWidth,
          hasHorizontalOverflow,
          hasActiveOutline: !!activeOutline,
          roadblockConnectorsCount: roadblockConnectors.length
        };
      });

      console.log(`    Viewport ${vp.width}px: overflow=${responsiveCheck.hasHorizontalOverflow}, outline=${responsiveCheck.hasActiveOutline}, connectors=${responsiveCheck.roadblockConnectorsCount}`);

      if (responsiveCheck.hasHorizontalOverflow) {
        console.error(`    ❌ FAIL: Horizontal overflow detected at ${vpName}`);
        passed = false;
      }
      if (responsiveCheck.roadblockConnectorsCount > 0) {
        console.error(`    ❌ FAIL: Roadblock connector detected at ${vpName}`);
        passed = false;
      }

      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `audit_build_${vpName}.png`)
      });
    }

  } catch (err) {
    console.error('Unexpected audit error:', err);
    passed = false;
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================');
  if (passed) {
    console.log('   🎉 ALL AUDITS PASSED WITH ZERO ERRORS');
  } else {
    console.log('   ❌ SOME AUDIT CHECKS FAILED');
  }
  console.log('========================================================================\n');

  if (!passed) process.exit(1);
}

runAudit();
