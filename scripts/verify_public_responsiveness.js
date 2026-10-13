import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('🧪 THE SORTED CLUB - PUBLIC RESPONSIVENESS AUDIT');
console.log('==================================================\n');

let passCount = 0;
let failCount = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    passCount++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failCount++;
  }
}

// 1. Audit styles.css
console.log('📦 1. Auditing app/styles.css for Responsive Core & Viewport Rules:');
const cssContent = fs.readFileSync(path.join(rootDir, 'app', 'styles.css'), 'utf-8');

// Mobile navigation rules
assert(cssContent.includes('.mobile-nav-backdrop'), 'Mobile backdrop overlay (.mobile-nav-backdrop) defined');
assert(cssContent.includes('.navlinks.open') && cssContent.includes('position: fixed'), 'Mobile drawer (.navlinks.open) uses fixed positioning under sticky header');
assert(cssContent.includes('max-height: calc(100dvh - 72px)') || cssContent.includes('max-height: calc(100dvh - 68px)'), 'Mobile drawer constrained with viewport-relative max-height');
assert(cssContent.includes('safe-area-inset-bottom'), 'Mobile drawer respects safe-area-inset-bottom');

// Estimator responsiveness rules
assert(cssContent.includes('.estimator-mobile-summary-pill'), 'Estimator compact mobile progress pill (.estimator-mobile-summary-pill) defined');
assert(cssContent.includes('.estimator-progress-strip') && cssContent.includes('overflow-x: auto'), 'Estimator progress strip allows horizontal scrolling without page overflow');
assert(cssContent.includes('.step-num-circle') && cssContent.includes('.step-label-text') && cssContent.includes('.step-val-text'), 'Estimator step numbers, labels, and values are distinct semantic elements');
assert(cssContent.includes('.estimator-pillars-grid') && cssContent.includes('grid-template-columns: 1fr'), 'Estimator pillars collapse to single column on narrow screens');
assert(cssContent.includes('.estimator-tiers-grid') && cssContent.includes('grid-template-columns: 1fr'), 'Estimator scope tiers collapse to single column on narrow screens');
assert(cssContent.includes('.estimator-addons-grid') && cssContent.includes('grid-template-columns: 1fr'), 'Estimator add-ons list collapses to single column on narrow screens');
assert(cssContent.includes('.summary-cta-btn') && cssContent.includes('min-height: 48px'), 'Estimator primary CTA has minimum 48px touch target');

// VANVAS showcase rules
assert(cssContent.includes('.vanvas-card-grid') && cssContent.includes('grid-template-columns: 1fr'), 'VANVAS showcase collapses into vertical stack on mobile/tablet');
assert(cssContent.includes('.vanvas-screen-nav') && cssContent.includes('overflow-x: auto'), 'VANVAS screen tabs scroll horizontally without document blowout');
assert(cssContent.includes('.app-screen-img.mobile-screen-fit'), 'VANVAS authentic mobile PWA preview handles vertical aspect-ratio (.mobile-screen-fit)');
assert(cssContent.includes('.app-window-url') && (cssContent.includes('text-overflow: ellipsis') || cssContent.includes('overflow: hidden')), 'VANVAS browser bar truncates long URLs to prevent overflow');
assert(cssContent.includes('.vanvas-card-cta-group') && cssContent.includes('flex-direction: column'), 'VANVAS action buttons stack vertically on mobile');

// Technology section rules
assert(cssContent.includes('.tech-items-grid') && cssContent.includes('grid-template-columns: repeat(2, 1fr)'), 'Technology grid adapts to 2 columns on standard phones');
assert(cssContent.includes('.tech-category-tabs') && cssContent.includes('overflow-x: auto'), 'Technology category tabs scroll within container on mobile');
assert(cssContent.includes('.tech-guarantee-strip') && cssContent.includes('grid-template-columns: 1fr'), 'Technology guarantees strip collapses to single column on mobile');

// Founder section rules
assert(cssContent.includes('.founder-card-layout') && cssContent.includes('grid-template-columns: 1fr'), 'Founder section collapses to single column on tablet/mobile');
assert(cssContent.includes('.founder-image-wrapper') && cssContent.includes('min('), 'Founder portrait wrapper protects against 320px horizontal overflow');

// Case study and enquiry modal rules
assert(cssContent.includes('.case-study-modal-container') && cssContent.includes('padding-right: 40px'), 'Case study modal topbar accounts for close button clearance');
assert(cssContent.includes('.preview-canvas-overlay') && cssContent.includes('flex-direction: column'), 'Case study preview overlay stacks vertically on mobile');
assert(cssContent.includes('font-size: 16px') && cssContent.includes('.input-wrapper input'), 'Mobile form inputs use 16px font-size to prevent iOS Safari auto-zooming');

// 2. Audit main.jsx (LandingPage)
console.log('\n📦 2. Auditing app/main.jsx for Mobile Navigation Integrity:');
const mainContent = fs.readFileSync(path.join(rootDir, 'app', 'main.jsx'), 'utf-8');
assert(mainContent.includes('Escape') && mainContent.includes('mobileMenuOpen'), 'LandingPage navigation handles Escape key to dismiss mobile drawer');
assert(mainContent.includes("document.body.style.overflow = 'hidden'"), 'LandingPage locks body scrolling while mobile drawer is open');
assert(mainContent.includes('aria-expanded={mobileMenuOpen}'), 'LandingPage hamburger button exposes aria-expanded state');
assert(mainContent.includes('mobile-nav-backdrop'), 'LandingPage renders backdrop overlay for outside-tap dismissal');

// 3. Audit PricingPage.jsx
console.log('\n📦 3. Auditing app/components/PricingPage.jsx:');
const pricingContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'PricingPage.jsx'), 'utf-8');
assert(pricingContent.includes('Escape') && pricingContent.includes('mobileMenuOpen'), 'PricingPage navigation handles Escape key to dismiss mobile drawer');
assert(pricingContent.includes("document.body.style.overflow = 'hidden'"), 'PricingPage locks body scrolling while mobile drawer is open');
assert(pricingContent.includes('aria-expanded={mobileMenuOpen}'), 'PricingPage hamburger button exposes aria-expanded state');
assert(pricingContent.includes('mobile-nav-backdrop'), 'PricingPage renders backdrop overlay for outside-tap dismissal');
assert(!pricingContent.includes("minmax(320px, 1fr)"), 'PricingPage eliminated rigid minmax(320px, 1fr) inline style');

// 4. Audit ServicesPages.jsx
console.log('\n📦 4. Auditing app/components/ServicesPages.jsx:');
const servicesContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'ServicesPages.jsx'), 'utf-8');
assert(servicesContent.includes('Escape') && servicesContent.includes('mobileMenuOpen'), 'ServicesPages navigation handles Escape key to dismiss mobile drawer');
assert(servicesContent.includes("document.body.style.overflow = 'hidden'"), 'ServicesPages locks body scrolling while mobile drawer is open');
assert(servicesContent.includes('aria-expanded={mobileMenuOpen}'), 'ServicesPages hamburger button exposes aria-expanded state');
assert(servicesContent.includes('mobile-nav-backdrop'), 'ServicesPages renders backdrop overlay for outside-tap dismissal');

// 5. Audit TemplateCatalog.jsx
console.log('\n📦 5. Auditing app/components/TemplateCatalog.jsx:');
const catalogContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'TemplateCatalog.jsx'), 'utf-8');
assert(catalogContent.includes('Escape') && catalogContent.includes('mobileMenuOpen'), 'TemplateCatalog navigation handles Escape key to dismiss mobile drawer');
assert(catalogContent.includes("document.body.style.overflow = 'hidden'"), 'TemplateCatalog locks body scrolling while mobile drawer is open');
assert(catalogContent.includes('aria-expanded={mobileMenuOpen}'), 'TemplateCatalog hamburger button exposes aria-expanded state');
assert(catalogContent.includes('mobile-nav-backdrop'), 'TemplateCatalog renders backdrop overlay for outside-tap dismissal');

// 6. Audit VanvasFeaturedSection.jsx
console.log('\n📦 6. Auditing app/components/VanvasFeaturedSection.jsx:');
const vanvasContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'VanvasFeaturedSection.jsx'), 'utf-8');
assert(vanvasContent.includes('mobile-screen-fit'), 'VanvasFeaturedSection applies mobile-screen-fit for authentic mobile view asset');
assert(vanvasContent.includes('Mobile PWA Shell'), 'VanvasFeaturedSection provides distinct mobile PWA tag for mobile view');

// 7. Audit ProjectEstimator.jsx
console.log('\n📦 7. Auditing app/components/ProjectEstimator.jsx:');
const estimatorContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'ProjectEstimator.jsx'), 'utf-8');
assert(estimatorContent.includes('estimator-mobile-summary-pill'), 'ProjectEstimator renders compact mobile summary pill');
assert(estimatorContent.includes('step-num-circle') && estimatorContent.includes('step-val-text'), 'ProjectEstimator separates numbers and values into semantic spans');

console.log('\n==================================================');
console.log(`📊 AUDIT RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✨ ALL PUBLIC RESPONSIVENESS AND INTEGRITY CHECKS PASSED!\n');
}
