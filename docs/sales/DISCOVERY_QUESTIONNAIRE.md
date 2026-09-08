# Client Discovery & Website Intake Questionnaire

**Document Purpose:** Standardized questionnaire for sales calls, prospect onboarding, and project scoping.  
**Interactive Digital URL:** `https://thesortedclub.com/discovery`  
**Central CRM Destination:** Inbound leads sync directly to The Sorted Club CRM (`POST /api/leads`).

---

## Prospect Discovery Questions

### 1. Business Basics
1. **Business / Company Name:**  
   *What is the registered or trade name of your business?*  
   `[ Text Input ]`

2. **Contact Person & Details:**  
   - Full Name: `[ Text Input ]`  
   - Direct Email: `[ Email Input ]`  
   - WhatsApp / Phone Number: `[ Phone Input ]`  

3. **Business Type / Industry Vertical:**  
   *What industry best describes your business?*  
   - [ ] Restaurant / Café / Hospitality
   - [ ] Coaching / Education / Academy
   - [ ] Salon / Spa / Wellness / Clinic
   - [ ] Real Estate / Property Development
   - [ ] E-Commerce / Retail Brand
   - [ ] Local Service / Home Services / Contractor
   - [ ] Professional Services / Law / Accounting / Consulting
   - [ ] Tech Startup / SaaS / Digital Agency
   - [ ] Personal Brand / Portfolio / Creator
   - [ ] Other: `[ Text Input ]`

---

### 2. Current Digital Presence
4. **Current Website or Main Social Profile:**  
   *Do you have an existing website or active social page (Instagram/LinkedIn/Facebook)?*  
   `[ URL or @handle ]`  
   *(If redesigning an existing website, what are the biggest problems with your current site?)*

---

### 3. Project Requirements & Scope
5. **Required Website Pages:**  
   *Which pages do you need on your new website?*  
   - [ ] Home / Overview Page
   - [ ] About Us / Founder / Story
   - [ ] Services / Offerings Showcase
   - [ ] Pricing / Packages Table
   - [ ] Case Studies / Portfolio / Project Gallery
   - [ ] Blog / Articles / Insights
   - [ ] Contact Us / Location / Google Maps
   - [ ] E-Commerce Shop / Product Catalog
   - [ ] Appointment Booking / Calendar Page
   - [ ] Customer Reviews / Testimonials Page
   - [ ] Custom Portal / Other: `[ Text Input ]`

6. **Required Interactive Features:**  
   *What functionality does your website require?*  
   - [ ] Direct WhatsApp 1-Click Chat Button
   - [ ] Instant Lead Capture Form (Email & CRM notification)
   - [ ] Online Appointment / Slot Booking Calendar
   - [ ] Online Payment Gateway (Razorpay / Stripe / UPI)
   - [ ] Shopping Cart & Checkout Flow
   - [ ] Dynamic CMS (easily add blogs/case studies without code)
   - [ ] Google Analytics & Conversion Tracking
   - [ ] User Account Login / Restricted Area
   - [ ] Multi-Language Support
   - [ ] Custom Third-Party API Integration: `[ Text Input ]`

---

### 4. Audience, Strategy & Aesthetics
7. **Target Audience & Ideal Customer Profile:**  
   *Who is your primary customer? (e.g., local homeowners, high-net-worth investors, DTC consumers, B2B executives)*  
   `[ Multi-line Text ]`

8. **Reference Websites / Design Inspirations:**  
   *Are there 1 to 3 websites or The Sorted Club template blueprints you love the look and feel of?*  
   - Reference 1: `[ URL / Blueprint Name ]`  
   - Reference 2: `[ URL / Blueprint Name ]`  
   - Reference 3: `[ URL / Blueprint Name ]`  
   *(What specific elements do you like? e.g., typography, dark mode, colors, animation)*

---

### 5. Commercials & Timeline
9. **Estimated Investment Budget:**  
   *What is your approximate budget allocated for this project?*  
   - [ ] Starter Package (₹14,999 / ~$400)
   - [ ] Business Website (₹24,999 / ~$650)
   - [ ] Lead-Generation Website (₹29,999 / ~$750)
   - [ ] Booking Website (₹34,999 / ~$890)
   - [ ] E-Commerce Storefront (₹39,999 / ~$990)
   - [ ] Custom Web App / Platform (₹59,999+ / ~$1,500+)
   - [ ] Flexible / Need Recommendation

10. **Preferred Launch Date:**  
    *When would you ideally like this website live?*  
    - [ ] ASAP (Within 7–10 days)
    - [ ] Within 2 to 3 weeks
    - [ ] Within 1 month
    - [ ] Flexible / Planning phase

---

## Consultation Review Process

Once the prospect completes this questionnaire (either online at `/discovery` or via call notes):
1. **Automated CRM Ingestion:** The brief is logged in The Sorted Club CRM with stage `NEW` and tagged with the selected package / blueprint.
2. **24-Hour Review SLA:** An engineering lead evaluates requirements, page counts, and required integrations.
3. **Proposal Generation:** A tailored proposal with fixed pricing, milestone schedule, and blueprint link is generated and sent via `/proposal/[token]`.
