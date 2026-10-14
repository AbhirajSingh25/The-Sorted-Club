const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\user\\.gemini\\antigravity-ide\\brain\\2d133000-b8b1-4588-a389-27115484df1b';

const VIEWPORTS = {
  v320: { width: 320, height: 800, isMobile: true },
  v360: { width: 360, height: 800, isMobile: true },
  v390: { width: 390, height: 844, isMobile: true },
  v430: { width: 430, height: 932, isMobile: true },
  v768: { width: 768, height: 1024, isMobile: true },
  v1024: { width: 1024, height: 800, isMobile: false },
  v1440: { width: 1440, height: 900, isMobile: false }
};

async function verifyTechRedesign() {
  console.log('========================================================');
  console.log('  STARTING TECHNICAL ARSENAL MOBILE REDESIGN AUDIT     ');
  console.log('========================================================\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Test across all mobile viewports
  for (const vpKey of ['v320', 'v360', 'v390', 'v430']) {
    const vp = VIEWPORTS[vpKey];
    console.log(`\n--- Testing Mobile Viewport [${vpKey}: ${vp.width}px] ---`);
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#tech', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const techSection = await page.$('.tech-stack-section');
    if (!techSection) throw new Error('Tech section not found!');
    await techSection.scrollIntoView();
    await new Promise(r => setTimeout(r, 300));

    // 1. Audit Category Grid (Must be 2x2)
    const catGridInfo = await page.evaluate(() => {
      const tabs = document.querySelector('.tech-category-tabs');
      const btns = Array.from(document.querySelectorAll('.tech-tab-btn'));
      const tabsRect = tabs.getBoundingClientRect();
      const btnRects = btns.map(b => {
        const r = b.getBoundingClientRect();
        return {
          text: b.querySelector('.tab-title-text')?.textContent?.trim(),
          badge: b.querySelector('.tech-count-badge')?.textContent?.trim(),
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          isActive: b.classList.contains('active')
        };
      });

      // Check rows: items in col 0 vs col 1
      const isCol1AndCol2 = Math.abs(btnRects[0].top - btnRects[1].top) < 4 &&
                            Math.abs(btnRects[2].top - btnRects[3].top) < 4 &&
                            btnRects[2].top > btnRects[0].top + 40;

      // Equal width check (within 2px)
      const equalWidth = Math.abs(btnRects[0].width - btnRects[1].width) <= 2 &&
                         Math.abs(btnRects[2].width - btnRects[3].width) <= 2;

      return {
        count: btns.length,
        isCol1AndCol2,
        equalWidth,
        btnRects
      };
    });

    console.log(`  Category grid: 4 tiles, 2x2 layout = ${catGridInfo.isCol1AndCol2}, equal widths = ${catGridInfo.equalWidth}`);
    if (!catGridInfo.isCol1AndCol2) throw new Error(`Category tabs at ${vp.width}px do not form a 2x2 grid!`);
    if (!catGridInfo.equalWidth) throw new Error(`Category columns at ${vp.width}px do not have equal widths!`);

    // 2. Audit Technology Cards Grid (Must be 2 columns)
    const techGridInfo = await page.evaluate(() => {
      const grid = document.querySelector('.tech-items-grid');
      const tiles = Array.from(document.querySelectorAll('.tech-item-tile'));
      const tileRects = tiles.map(t => {
        const r = t.getBoundingClientRect();
        return {
          name: t.querySelector('.tech-name')?.textContent?.trim(),
          role: t.querySelector('.tech-role')?.textContent?.trim(),
          left: r.left,
          top: r.top,
          width: r.width,
          height: r.height,
          hasOverflow: t.scrollWidth > t.clientWidth + 1
        };
      });

      // Check if tiles 0 and 1 are side by side (same row)
      const isTwoCol = tiles.length >= 2 ? Math.abs(tileRects[0].top - tileRects[1].top) < 4 : false;
      const equalTileWidth = tiles.length >= 2 ? Math.abs(tileRects[0].width - tileTileWidth(tileRects[1])) <= 2 : true;
      const anyOverflow = tileRects.some(t => t.hasOverflow);

      function tileTileWidth(t) { return t ? t.width : 0; }

      return {
        itemCount: tiles.length,
        isTwoCol,
        equalTileWidth,
        anyOverflow,
        tileRects
      };
    });

    console.log(`  Tech items grid: ${techGridInfo.itemCount} items, 2-column layout = ${techGridInfo.isTwoCol}, no text overflow = ${!techGridInfo.anyOverflow}`);
    if (!techGridInfo.isTwoCol) throw new Error(`Technology items grid at ${vp.width}px is not 2 columns!`);
    if (techGridInfo.anyOverflow) throw new Error(`Technology card text overflow detected at ${vp.width}px!`);

    // 3. Measure Section Height vs Previous Height
    const sectionHeight = await page.evaluate(() => {
      return document.querySelector('.tech-stack-section').getBoundingClientRect().height;
    });
    console.log(`  Total Tech Section Height at ${vp.width}px: ${Math.round(sectionHeight)}px (Was: ~1,647px -> ${Math.round((1 - sectionHeight/1647) * 100)}% reduction)`);

    // Screenshot at 320 and 390
    if (['v320', 'v390'].includes(vpKey)) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `tech_${vpKey}_redesign.png`)
      });
    }
  }

  // 4. Test Category Switching and Collapsible Guarantees on 390px
  console.log('\n--- Testing Category Switching & Collapsible Guarantee on 390px ---');
  await page.setViewport(VIEWPORTS.v390);
  await page.goto('http://localhost:5173/#tech', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 400));

  const categories = ['frontend', 'backend', 'data', 'ai'];
  for (let i = 0; i < categories.length; i++) {
    const catId = categories[i];
    console.log(`  Switching to category ${i + 1}/4: ${catId}...`);
    const btn = await page.$(`.tech-tab-btn:nth-child(${i + 1})`);
    const scrollYBefore = await page.evaluate(() => window.scrollY);
    await btn.evaluate(el => el.click());
    await new Promise(r => setTimeout(r, 550));
    const scrollYAfter = await page.evaluate(() => window.scrollY);

    const switchState = await page.evaluate(() => {
      const activeBtn = document.querySelector('.tech-tab-btn.active');
      const catTitle = document.querySelector('.tech-cat-title')?.textContent?.trim();
      const items = Array.from(document.querySelectorAll('.tech-item-tile')).map(t =>
        t.querySelector('.tech-name')?.textContent?.trim()
      );
      const isTwoCol = items.length >= 2 ?
        Math.abs(document.querySelectorAll('.tech-item-tile')[0].getBoundingClientRect().top -
                 document.querySelectorAll('.tech-item-tile')[1].getBoundingClientRect().top) < 4 : true;
      return {
        activeText: activeBtn?.querySelector('.tab-title-text')?.textContent?.trim(),
        catTitle,
        itemCount: items.length,
        items,
        isTwoCol
      };
    });

    console.log(`    Active: "${switchState.activeText}", Items (${switchState.itemCount}): [${switchState.items.join(', ')}], 2-Col: ${switchState.isTwoCol}, Scroll Jump: ${Math.abs(scrollYAfter - scrollYBefore)}px`);
    if (!switchState.isTwoCol) throw new Error(`Category ${catId} did not render in 2 columns!`);
    if (Math.abs(scrollYAfter - scrollYBefore) > 10) throw new Error(`Unexpected vertical page jump on category switch!`);
  }

  // 5. Test Guarantees Collapsible toggle
  console.log('\n  Testing Collapsible Guarantees...');
  const trigger = await page.$('.tech-guarantees-mobile-trigger');
  if (!trigger) throw new Error('Collapsible trigger not found on mobile!');

  const initialExpanded = await page.evaluate(() => {
    return document.querySelector('.tech-guarantee-strip').classList.contains('open');
  });
  console.log('    Initially open:', initialExpanded, '(Should be false for compact footprint)');
  if (initialExpanded) throw new Error('Guarantees should be collapsed by default on mobile!');

  // Click to expand
  console.log('    Expanding guarantees...');
  await trigger.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 300));
  const afterExpand = await page.evaluate(() => {
    return document.querySelector('.tech-guarantee-strip').classList.contains('open');
  });
  console.log('    Open after click:', afterExpand);
  if (!afterExpand) throw new Error('Guarantees did not expand on click!');

  // Click to collapse
  console.log('    Collapsing guarantees...');
  await trigger.evaluate(el => el.click());
  await new Promise(r => setTimeout(r, 300));
  const afterCollapse = await page.evaluate(() => {
    return document.querySelector('.tech-guarantee-strip').classList.contains('open');
  });
  console.log('    Open after collapse:', afterCollapse);
  if (afterCollapse) throw new Error('Guarantees did not collapse on second click!');

  // 6. Test Tablet & Desktop Viewports
  for (const vpKey of ['v768', 'v1024', 'v1440']) {
    const vp = VIEWPORTS[vpKey];
    console.log(`\n--- Testing ${vpKey.toUpperCase()} Viewport [${vp.width}px] ---`);
    await page.setViewport(vp);
    await page.goto('http://localhost:5173/#tech', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));

    const check = await page.evaluate((width) => {
      const section = document.querySelector('.tech-stack-section');
      const tabs = document.querySelector('.tech-category-tabs');
      const btns = Array.from(document.querySelectorAll('.tech-tab-btn'));
      const tiles = Array.from(document.querySelectorAll('.tech-item-tile'));
      const guaranteeTrigger = document.querySelector('.tech-guarantees-mobile-trigger');
      const guaranteeStrip = document.querySelector('.tech-guarantee-strip');

      const triggerVisible = guaranteeTrigger && window.getComputedStyle(guaranteeTrigger).display !== 'none';
      const stripCols = window.getComputedStyle(guaranteeStrip).gridTemplateColumns;

      return {
        sectionHeight: section.getBoundingClientRect().height,
        hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        btnCount: btns.length,
        tileCount: tiles.length,
        triggerVisible,
        stripCols
      };
    }, vp.width);

    console.log(`  Height: ${Math.round(check.sectionHeight)}px, H-Overflow: ${check.hasHorizontalOverflow}, Trigger visible: ${check.triggerVisible}`);
    if (check.hasHorizontalOverflow) throw new Error(`Horizontal overflow on ${vp.width}px!`);
    if (vp.width >= 1024 && check.triggerVisible) {
      throw new Error(`Desktop at ${vp.width}px should show full 3-column guarantee strip, not mobile trigger!`);
    }

    if (['v768', 'v1440'].includes(vpKey)) {
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, `tech_${vpKey}_redesign.png`)
      });
    }
  }

  await browser.close();
  console.log('\n========================================================');
  console.log('  ALL TECHNICAL ARSENAL AUDIT CHECKS PASSED WITH 100%!  ');
  console.log('========================================================\n');
}

verifyTechRedesign().catch(err => {
  console.error('\n❌ AUDIT ERROR:', err);
  process.exit(1);
});
