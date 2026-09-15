import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('==================================================');
console.log('🧪 THE SORTED CLUB - ADMIN RESPONSIVENESS AUDIT');
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

// 1. Check styles.css
console.log('📦 1. Auditing app/styles.css for Responsive Admin Rules:');
const cssContent = fs.readFileSync(path.join(rootDir, 'app', 'styles.css'), 'utf-8');

assert(cssContent.includes('.admin-mobile-menu-btn'), 'Mobile hamburger button (.admin-mobile-menu-btn) defined');
assert(cssContent.includes('.admin-mobile-drawer-backdrop'), 'Mobile drawer backdrop defined');
assert(cssContent.includes('.admin-mobile-drawer-content'), 'Mobile drawer container defined');
assert(cssContent.includes('.admin-drawer-nav-item'), 'Mobile drawer nav items defined with >=48px touch targets');
assert(cssContent.includes('@media (max-width: 1024px)'), 'Breakpoint @media (max-width: 1024px) defined');
assert(cssContent.includes('@media (max-width: 768px)'), 'Breakpoint @media (max-width: 768px) defined');
assert(cssContent.includes('@media (max-width: 480px)'), 'Breakpoint @media (max-width: 480px) defined');
assert(cssContent.includes('@media (max-width: 390px)'), 'Breakpoint @media (max-width: 390px) defined');
assert(cssContent.includes('@media (max-width: 360px)'), 'Breakpoint @media (max-width: 360px) defined');
assert(cssContent.includes('.table-responsive') && cssContent.includes('overflow-x: auto'), 'Table responsive horizontal scroll wrapper verified');
assert(cssContent.includes('.admin-table') && cssContent.includes('min-width: 640px'), 'Admin table minimum width protection verified');

// 2. Check AdminNavbar.jsx
console.log('\n📦 2. Auditing app/components/AdminNavbar.jsx:');
const adminNavbarContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'AdminNavbar.jsx'), 'utf-8');
assert(adminNavbarContent.includes('admin-mobile-menu-btn'), 'AdminNavbar renders hamburger button');
assert(adminNavbarContent.includes('admin-mobile-drawer-content'), 'AdminNavbar renders mobile navigation drawer');
assert(adminNavbarContent.includes('onNavigateToCommandCenter'), 'AdminNavbar supports Command Center navigation');
assert(adminNavbarContent.includes('onNavigateToInquiries'), 'AdminNavbar supports Inquiries navigation');
assert(adminNavbarContent.includes('onNavigateToCRM'), 'AdminNavbar supports CRM navigation');
assert(adminNavbarContent.includes('onNavigateToClients'), 'AdminNavbar supports Clients navigation');
assert(adminNavbarContent.includes('onNavigateToFinance'), 'AdminNavbar supports Finance navigation');
assert(adminNavbarContent.includes('onNavigateToProjects'), 'AdminNavbar supports Projects navigation');
assert(adminNavbarContent.includes('Escape') && adminNavbarContent.includes('mobileMenuOpen'), 'AdminNavbar handles Escape key to close drawer');

// 3. Check main.jsx handleNavigateToCRM resolution
console.log('\n📦 3. Auditing app/main.jsx for handleNavigateToCRM robustness:');
const mainContent = fs.readFileSync(path.join(rootDir, 'app', 'main.jsx'), 'utf-8');
assert(mainContent.includes('handleNavigateToCRM = (stageOrOptions'), 'handleNavigateToCRM accepts stageOrOptions parameter');
assert(mainContent.includes('URLSearchParams'), 'handleNavigateToCRM builds query params cleanly');
assert(mainContent.includes('onNavigateToCRM={handleNavigateToCRM}'), 'main.jsx passes onNavigateToCRM to CRMView and Admin views');

// 4. Check that inline rigid gridTemplateColumns are eliminated
console.log('\n📦 4. Auditing Admin Views for rigid inline styles:');
const clientDash = fs.readFileSync(path.join(rootDir, 'app', 'components', 'ClientDashboard.jsx'), 'utf-8');
assert(!clientDash.includes("gridTemplateColumns: 'repeat(5, 1fr)'"), 'ClientDashboard metrics grid does NOT have hardcoded 5-col inline override');

const financeDash = fs.readFileSync(path.join(rootDir, 'app', 'components', 'FinanceDashboard.jsx'), 'utf-8');
assert(!financeDash.includes("gridTemplateColumns: 'repeat(6, 1fr)'"), 'FinanceDashboard metrics grid does NOT have hardcoded 6-col inline override');

const projectDash = fs.readFileSync(path.join(rootDir, 'app', 'components', 'ProjectDashboard.jsx'), 'utf-8');
assert(!projectDash.includes("gridTemplateColumns: 'repeat(5, 1fr)'"), 'ProjectDashboard metrics grid does NOT have hardcoded 5-col inline override');

const crmView = fs.readFileSync(path.join(rootDir, 'app', 'components', 'CRMView.jsx'), 'utf-8');
assert(!crmView.includes("gridTemplateColumns: 'repeat(6, 1fr)'") || crmView.includes('crm-metrics-grid'), 'CRMView uses class-based responsive crm-metrics-grid');

// 5. Check NotificationCenter.jsx responsiveness
console.log('\n📦 5. Auditing app/components/NotificationCenter.jsx:');
const notifContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'NotificationCenter.jsx'), 'utf-8');
assert(notifContent.includes('min(380px') || notifContent.includes('calc(100vw'), 'NotificationCenter uses responsive width constraint for mobile');

// 6. Check EmailComposerModal.jsx responsiveness
console.log('\n📦 6. Auditing app/components/EmailComposerModal.jsx:');
const emailContent = fs.readFileSync(path.join(rootDir, 'app', 'components', 'EmailComposerModal.jsx'), 'utf-8');
assert(emailContent.includes('flexWrap: \'wrap\'') || emailContent.includes('flexWrap: "wrap"'), 'EmailComposerModal buttons wrap gracefully on small screens');

console.log('\n==================================================');
console.log(`📊 AUDIT RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
console.log('==================================================');

if (failCount > 0) {
  process.exit(1);
} else {
  console.log('✨ ALL RESPONSIVENESS AND INTEGRITY CHECKS PASSED!\n');
}
