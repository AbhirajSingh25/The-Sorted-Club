# The Sorted Club — Design & Architecture Baseline Snapshot

> **Baseline Tag:** `pre-motion-baseline`  
> **Timestamp:** March 2026  
> **Repository:** The Sorted Club (`the-sorted-club`)  
> **Purpose:** Source of truth for the complete frontend visual design system, structure, components, typography, colors, animations, and routes before the Motion redesign.

---

## 1. Overall Visual Identity & Brand System

The Sorted Club employs a **refined brutalist, editorial, modernist "operating collective" aesthetic**. It combines high-contrast typography, warm parchment/sand physical paper tones, crisp hairline borders, deep obsidian/ink text, and high-visibility neon acid lime accents.

### Core Brand Attributes
- **Tone:** Direct, confident, no-fluff, authoritative, modern business collective.
- **Tagline:** *"Your business. Sorted."*
- **Sub-tagline:** *"We build, grow, automate and hire for ambitious businesses. One team. One place. Fewer things left unsorted."*
- **Four Core Pillars:**
  1. **BUILD** (Websites, Software & Digital Products)
  2. **GROW** (Growth, Content & Lead Generation)
  3. **AUTOMATE** (AI Workflows, WhatsApp & Operations)
  4. **HIRE** (HireSense AI & Talent Operations)
- **Signature Visual Motifs:**
  - **Orbit Rings:** Large background celestial/radar orbit rings (`orbit-one` solid 55vw circle, `orbit-two` dashed 32vw circle) floating in the hero section.
  - **Continuous Marquee Ticker:** Dark high-contrast banner with rotating pillar text and glowing acid lime bullets.
  - **The 2026 Member Pass Card:** Physical membership pass card tilted at `rotate(2deg)` with an offset solid shadow (`18px 20px 0 #d9d5ca`).
  - **Live Indicator Dot:** Pulsing live dot (`live-dot`) next to the eyebrow text.
  - **Browser Chrome Mockup Frames:** Window frame previews with traffic light control dots (`#ef4444`, `#f59e0b`, `#10b981`) and simulated URLs.

---

## 2. Typography System

The typography is loaded from Google Fonts in `app/styles.css`:
- **Primary Body Font:** `"DM Sans", sans-serif` (Weights: 400, 500, 600, 700)
- **Display & Headings Font:** `"Space Grotesk", sans-serif` (Weights: 500, 600, 700)

### Typographic Scale & Hierarchy
| Element | Font Family | Size / Line-height | Weight | Letter Spacing | Description / Example |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Brand Logo** | Space Grotesk | `17px / 1` | `700` (`500` for CLUB) | `-0.05em` | `THE SORTED CLUB` |
| **Eyebrows** | Space Grotesk | `10px` | `700` | `0.18em` | `THE BUSINESS CLUB FOR WHAT'S NEXT` (Uppercase) |
| **Hero H1** | Space Grotesk | `clamp(72px, 11.5vw, 166px) / 0.82` | `700` | `-0.085em` | `Your business. / Sorted.` |
| **Hero Copy** | DM Sans | `clamp(18px, 2vw, 25px) / 1.3` | `400` | Normal | Hero lead paragraph |
| **Section Headings** | Space Grotesk | `clamp(45px, 6vw, 82px) / 0.94` | `600` | `-0.065em` | `Whatever your business needs, / we'll get it sorted.` |
| **Card Headings** | Space Grotesk | `32px` | `600` | `-0.05em` | `01 Build`, `02 Grow`, etc. |
| **Body Paragraphs** | DM Sans | `14px - 16px / 1.5` | `400` | Normal | Main content body text |
| **Ticker Text** | Space Grotesk | `12px` | `600` | `0.12em` | `BUILD • GROW • AUTOMATE • HIRE` |
| **Button Text** | DM Sans | `13px - 15px` | `600` | Normal | Action buttons |

---

## 3. Color Palette & CSS Custom Properties

Defined on `:root` in `app/styles.css`:

```css
:root {
  --ink: #10100f;       /* Deep carbon black for primary text, dark cards, buttons */
  --paper: #f4f1e9;     /* Warm sand/parchment background */
  --line: #d4d0c5;      /* Warm stone divider border */
  --muted: #68665e;     /* Subdued warm graphite for secondary copy */
  --acid: #d8ff55;      /* Neon lime / chartreuse for high-impact CTA accents */
  --card-bg: #fbf9f4;   /* Elevated light parchment card background */
  --danger: #ef4444;    /* Crimson for error alerts and overdue badges */
  --success: #22c55e;   /* Green for success confirmations and WhatsApp green (#15803d) */
}
```

### Contextual Color Usage
- **Landing Page Background:** `var(--paper)` (`#f4f1e9`)
- **Manifesto Section Background:** `var(--ink)` (`#10100f`) with `#b8b5ad` text
- **Contact / Next Move Section Background:** `var(--acid)` (`#d8ff55`) with `var(--ink)` text
- **Navigation Bar Background:** `rgba(244, 241, 233, 0.88)` with `backdrop-filter: blur(18px)`
- **Modal Backdrop:** `rgba(16, 16, 15, 0.72)` with `backdrop-filter: blur(10px)`

---

## 4. Spacing, Borders & Radii

### Layout Spacing Tokens
- **Sticky Navbar Height:** `78px` with `padding: 0 5vw`
- **Hero Section:** `min-height: calc(100vh - 78px)`, `padding: 10vh 9vw 5vh`
- **Major Sections (Services, Manifesto, Club, Contact):** `padding: 115px 9vw`
- **Footer:** `padding: 45px 9vw`
- **Section Headers:** 2-column grid (`90px 1fr`) with `margin-bottom: 58px`

### Border & Radius System
- **Buttons / CTA Pills:** `border-radius: 999px` (Fully rounded pills)
- **Service Grid Cards:** Sharp corners (`border-radius: 0`), joined seamlessly with `1px` borders (`background: var(--line)`)
- **Member Pass Card:** Sharp rectangle with `box-shadow: 18px 20px 0 #d9d5ca`
- **Modals & Flyouts:** `border-radius: 14px`, `border: 1px solid var(--line)`
- **Category Filter Pills & Badges:** `border-radius: 999px`, `border: 1px solid var(--line)`
- **Browser Mockup Preview Windows:** `border-radius: 12px`

---

## 5. Navigation Bar

- **Brand Logo:** `THE SORTED CLUB` with bold `THE SORTED` and regular `CLUB`
- **Navigation Items:**
  1. `Services` (`/services`)
  2. `Templates & Portfolio` (`/templates` or `/portfolio`)
  3. `Pricing & Packages` (`/pricing`)
  4. `Why Sorted` (`#about`)
  5. `Free Consultation →` (Pill button opening `InquiryModal`)
- **Mobile Navigation:** Responsive hamburger toggle (`<Menu />` / `<X />`), slide-down mobile nav drawer.
- **Backdrop Effect:** Sticky positioning with `backdrop-filter: blur(18px)` and bottom hairline border.

---

## 6. Landing Page Sections Breakdown

1. **Hero Section (`.hero`):**
   - Background orbits (`orbit-one`, `orbit-two`)
   - Eyebrow tag: `THE BUSINESS CLUB FOR WHAT'S NEXT` with live status dot
   - H1: `Your business. / Sorted.`
   - Body copy: Value proposition on unified delivery
   - Action cluster: Primary CTA ("Free Website Consultation"), secondary CTA ("View Website Pricing"), and link ("Browse Blueprints →")
   - Bottom meta strip: "Welcome to the club." / "EST. 2026 — GLOBAL OPERATING COLLECTIVE"

2. **Continuous Marquee Ticker (`.ticker`):**
   - Infinite horizontal animation: `BUILD • GROW • AUTOMATE • HIRE • CUSTOM SOFTWARE • REVENUE SYSTEMS • AI WORKFLOWS • HIRESENSE`
   - Contrast: Black background, warm parchment text, acid lime bullet dividers.

3. **Services Grid (`.services`):**
   - Section head 01: `WHAT WE SORT`
   - 4-column structured grid for the 4 pillars: `01 Build`, `02 Grow`, `03 Automate`, `04 Hire`
   - Pillar cards include category icons (`Code2`, `BriefcaseBusiness`, `Bot`, `Users`), short summaries, and direct explore links.

4. **Manifesto / The Idea (`.manifesto`):**
   - Inverted dark theme (`var(--ink)`)
   - Section head 02: `THE IDEA`
   - Headline: `You bring the problem. / We get it sorted.`
   - 4 pill feature badges:
     - `✓ Single Point of Accountability`
     - `✓ Battle-tested Engineering`
     - `✓ Rapid Turnaround`
     - `✓ Transparent Pricing`

5. **Membership Section (`.club`):**
   - Section head 03: `MEMBERSHIP`
   - Two-column layout: Left column with pitch and "Become a member" CTA; Right column with the **2026 Member Pass** card.
   - Pass details: `SORTED*`, `MEMBER PASS`, `ONE DIRECT BRIEF LINE • DEDICATED SQUAD • UNLIMITED SCALE`, `THE SORTED CLUB 2026`.

6. **Contact / Next Move Section (`.contact`):**
   - Vibrant acid lime background (`var(--acid)`)
   - Section head 04: `GET STARTED`
   - Headline: `What's not sorted yet?`
   - Dark primary CTA button: `Tell us what needs sorting →`
   - Direct contact links: WhatsApp (`+91 9643820888`) and Email (`thesortedclub@gmail.com`).

7. **Footer (`footer`):**
   - 2-column grid layout
   - Brand mark and links to Templates, Pricing, Discovery Brief
   - Subtle, unobtrusive Admin Portal entry link with Shield icon (`/admin`)
   - Legal copyright & Demo Concept disclaimer.

---

## 7. Portfolio & Template Catalogue System

Located at `/templates` and `/portfolio`:
- **Header:** Blueprint portfolio hero with sample concept disclaimer pill.
- **Controls & Filters:**
  - Full-text search across template names, industries, features, and styles.
  - Design style dropdown selector (Warm & Organic, Dark Luxury, Clean Tech, Minimal & Editorial, Bold & Modern, High-Conversion).
  - 10 Industry Category filter pills with dynamic count badges:
    - *Restaurants and Cafés*
    - *Coaching Institutes*
    - *Salons and Spas*
    - *Real Estate*
    - *E-commerce*
    - *Local Service Businesses*
    - *Freelancers and Personal Brands*
    - *Booking Websites*
    - *Startup Landing Pages*
    - *Portfolio Websites*
- **10 Core Blueprints:**
  1. `saffron-and-sage` — Saffron & Sage Bistro (Warm & Organic, Table Booking, Seasonal Menu)
  2. `apex-institute` — Apex Learning & Exam Hub (Clean Tech, Batch Finder, Syllabus Download)
  3. `lumina-spa` — Lumina Sanctuary & Spa (Minimal & Editorial, Treatment Booking, Membership Pass)
  4. `haven-luxury-estates` — Haven & Prime Luxury Estates (Dark Luxury, Villa Listings, Private Viewings)
  5. `nordic-craft` — Nordic Craft Studio (Minimal & Editorial, E-commerce Cart, Artisan Ceramics)
  6. `profix-masters` — ProFix Masters - HVAC & Electrical (High-Conversion, Emergency Dispatch, Pricing Estimator)
  7. `elena-vance` — Elena Vance - Brand Strategist & Advisor (Bold & Modern, Advisory Packages, Case Studies)
  8. `flowgrid-ai` — FlowGrid AI - Automation Platform (Clean Tech, SaaS Pricing, Interactive Workflow Visualizer)
  9. `zenith-retreat` — Zenith Wellness & Retreat Booking (Warm & Organic, Room Booking, Retreat Calendar)
  10. `atelier-noir` — Atelier Noir - Motion & Architecture (Dark Luxury, Fullscreen Project Gallery, Project Inquiries)

---

## 8. Template Cards & Interactive Demos

- **Card Structure:**
  - Simulated browser chrome bar with 3 dots (`#ef4444`, `#f59e0b`, `#10b981`), URL pill, and desktop icon.
  - Image canvas with gradient scrim and "Demo Concept" pill.
  - Floating mobile peek thumbnail ("Mobile Ready").
  - Turnaround time badge (e.g. `5 - 7 Business Days`).
  - Core capabilities checkmarks.
  - Transparent dual-currency pricing indicator (`₹24,999 / $650`).
  - Dual action buttons: `View Details` and `Build This →`.
- **Live Interactive Demo View (`/demo/:slug`):**
  - Fullscreen simulated web app environment with top navigation bar.
  - Device switcher (Desktop preview vs Mobile frame).
  - Working demo interactions: menu category filters, reservation date pickers, cart counters, fee calculators, and inquiry buttons.

---

## 9. Pricing & Packages System

Located at `/pricing`:
- **Core Website Packages:**
  - **Starter Website (`₹14,999` / `$400`):** 3–5 pages, WhatsApp CTA, Google Maps, SSL, 5–7 days.
  - **Business Website (`₹24,999` / `$650`):** 5–8 pages, CMS blog, PageSpeed 90+, SEO, 7–10 days.
  - **Lead-Gen Website (`₹29,999` / `$750`):** Sales funnel, qualification form, CRM webhook, 6–8 days.
  - **E-Commerce Website (`₹39,999` / `$990`):** Full storefront, 25 products, Razorpay/Stripe, 10–14 days.
  - **Booking Website (`₹34,999` / `$890`):** Slot booking engine, Google Calendar sync, deposits, 8–12 days.
  - **Custom Web App (`From ₹59,999` / `$1,500`):** Bespoke portals, FastAPI/PostgreSQL, 2–4 weeks.
- **Payment Structure:** 50% deposit on start, 50% upon final sign-off before DNS handover.
- **Comparison Matrix:** Multi-tier architectural comparison across Core Architecture, Conversion, Functionality, SEO & Warranty.
- **FAQ Accordion:** Answers regarding 50/50 payments, zero platform lock-in, ownership, turnaround, and consultation scope.

---

## 10. Inquiry Modal System

Component: `app/components/InquiryModal.jsx`
- **Trigger:** Accessible anywhere via `handleOpenInquiry(serviceOrTemplate)`.
- **Context Awareness:** Automatically pre-fills service interest, business type, and scope description based on whether it was clicked from a template, a pricing tier, or a service pillar.
- **Form Fields:**
  1. Full Name (Auto-focused on open)
  2. Business Name
  3. Work Email
  4. Phone / WhatsApp Number
  5. Current Website URL (Optional)
  6. Business Type selector
  7. Service Interest selector
  8. Project Brief / Problem statement
  9. Budget Range picker
  10. Consent checkbox
- **Submission:** Transmits payload to `/api/leads` with instant validation, loading spinner, and success confirmation screen featuring a direct 1-click WhatsApp fallback.

---

## 11. Existing Animations & Hover Transitions

1. **Buttons (`.navcta`, `.primary`):**
   ```css
   transition: transform 0.2s, background-color 0.2s, box-shadow 0.2s;
   &:hover {
     transform: translateY(-2px);
     box-shadow: 0 6px 16px rgba(16, 16, 15, 0.15);
   }
   ```
2. **Service Cards (`.service-card`):**
   ```css
   transition: transform 0.25s, background 0.25s;
   &:hover {
     transform: translateY(-6px);
     background: #eeece4;
   }
   ```
3. **Marquee Animation (`@keyframes marquee`):**
   ```css
   @keyframes marquee {
     to { transform: translateX(-30%); }
   }
   animation: marquee 22s linear infinite;
   ```
4. **Modal Entry (`fadeIn` & `slideUp`):**
   ```css
   @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
   @keyframes slideUp {
     from { transform: translateY(20px); opacity: 0; }
     to { transform: translateY(0); opacity: 1; }
   }
   ```
5. **Smooth Page Scrolling:**
   ```css
   html { scroll-behavior: smooth; }
   ```

---

## 12. Public vs. Admin Routing Architecture

The single-page application manages client-side routing in `app/main.jsx` with full browser history support (`pushState` / `popstate`):

### Public Routes
- `/` — Landing Page
- `/services` & `/services/:slug` (`build`, `grow`, `automate`, `hire`) — Productized Services
- `/templates` & `/portfolio` — Website Blueprint Gallery
- `/templates/:slug` — Individual Blueprint Details
- `/demo/:slug` — Fullscreen Interactive Live Demo
- `/pricing` — Website Packages & Commercial Pricing Matrix
- `/discovery` — Interactive Client Discovery Questionnaire

### Public Tokenized Client Portals (Secure Client Token Access)
- `/proposal/:token` — Interactive Scope Proposal with 1-Click Client Acceptance
- `/contract/:token` — Binding Service Agreement with Signature & Acceptance
- `/invoice/:token` — Commercial Invoice with Payment Verification & UPI/Bank Details
- `/project/:token` — Live Project Tracker with Sprint Milestones & Timeline
- `/project-review/:token` — Deliverable Review & Sign-Off Approval Portal

### Authenticated Admin Control Plane (`/admin`)
- Guarded by session token in `localStorage` (`verifyAdminSession()`)
- Unauthenticated requests render `AdminLogin.jsx`
- Authenticated modules:
  - `/admin` — Inbound Inquiries Inbox & Triage Console (`AdminDashboard.jsx`)
  - `/admin/crm` — Visual Lead Pipeline & Follow-up Center (`CRMView.jsx`)
  - `/admin/clients` — Client Directory & Profile Management (`ClientDashboard.jsx`)
  - `/admin/projects` — Engineering Project Delivery & Milestone Control (`ProjectDashboard.jsx`)
  - `/admin/finance` — Proposals, Contracts, Invoices & Payment Verifications (`FinanceDashboard.jsx`)
  - `/admin/command-center` — Executive Business Overview Cockpit (`CommandCenterView.jsx`)

---

## 13. Critical Design Details That Must NOT Be Changed

1. **Brand Identity:** The name **The Sorted Club**, the tagline *"Your business. Sorted."*, and the 4 pillars (*BUILD, GROW, AUTOMATE, HIRE*).
2. **Typography System:** The pairing of `Space Grotesk` (headings/display) and `DM Sans` (body/UI).
3. **Palette Foundations:** The warm sand `#f4f1e9` paper tone, obsidian `#10100f` ink, and high-visibility `#d8ff55` acid accent.
4. **Member Pass & Operating Collective Concept:** The tilted pass card and structured editorial tone.
5. **Transparent Pricing Philosophy:** The 50/50 payment model, fixed tier pricing (starting from ₹14,999 / $400), and 100% client code ownership.
6. **Tokenized Portal Workflow:** The zero-login client experience for proposals, contracts, invoices, and deliverable approvals.
7. **Production Build Integrity:** Fast, modular, zero-bloat client build (`vite build`) producing standard web assets.

---

## 14. Restoration Instructions (Source of Truth)

If at any point in the future the user requests:
- *"change it back to the way it was"*
- *"restore the original design"*
- *"undo the Motion redesign"*

The agent **MUST**:
1. Check out the Git tag `pre-motion-baseline` as the absolute source of truth:
   ```bash
   git checkout pre-motion-baseline
   ```
2. Verify that `npm run build` succeeds without errors.
3. Reference this `DESIGN_BASELINE.md` document for all structural, styling, and functional verification.
4. **Never attempt to recreate the pre-motion design from memory.**
