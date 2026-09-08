// templatesData.js
// Curated website templates and demo concepts for The Sorted Club
// Note: All examples are clearly marked as "Demo Concept" or "Sample Project".

export const TEMPLATE_CATEGORIES = [
  'All Categories',
  'Restaurants and Cafés',
  'Coaching Institutes',
  'Salons and Spas',
  'Real Estate',
  'E-commerce',
  'Local Service Businesses',
  'Freelancers and Personal Brands',
  'Booking Websites',
  'Startup Landing Pages',
  'Portfolio Websites'
];

export const DESIGN_STYLES = [
  'All Styles',
  'Warm & Organic',
  'Dark Luxury',
  'Clean Tech',
  'Minimal & Editorial',
  'Bold & Modern',
  'High-Conversion'
];

export const TEMPLATES = [
  {
    id: 'saffron-and-sage',
    slug: 'saffron-and-sage',
    name: 'Saffron & Sage Bistro',
    badge: 'Demo Concept',
    category: 'Restaurants and Cafés',
    designStyle: 'Warm & Organic',
    suitableFor: 'Fine dining restaurants, artisan cafés, gourmet bistros, wine bars, rooftop lounges',
    shortDesc: 'A sensory-rich dining website featuring interactive seasonal menus, instant table reservations, private event inquiries, and chef stories.',
    tagline: 'Culinary storytelling combined with effortless table booking and seasonal menu showcase.',
    startingPrice: '₹24,999',
    startingPriceUSD: '$650',
    budgetRange: '$2,500 - $5,000',
    turnaround: '5 - 7 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80',
    accentColor: '#c2410c',
    secondaryColor: '#fef3c7',
    mainFeatures: [
      'Interactive filterable seasonal menu with allergen badges',
      'Instant table reservation widget with date/time/guest selection',
      'Private dining & event catering inquiry funnel',
      'Integrated Google Maps location, opening hours & parking guide',
      'Direct WhatsApp booking & OpenTable/Zomato links',
      'Sub-second page load optimized for mobile diners'
    ],
    includedSections: [
      'Hero section with ambient imagery and instant "Reserve Table" CTA',
      'Digital Menu showcase with category tabs (Starters, Mains, Desserts, Artisan Drinks)',
      'Chef Philosophy & Farm-to-Table Story module with 3 live stat counters',
      'Atmospheric Dining Ambience Photo Gallery (Hearth, Courtyard, Wine Vault, Mezzanine)',
      'Private Dining & Banquet Hall booking form',
      'Location map, transport guide, and operating hours',
      'Footer with social links, newsletter signup, and WhatsApp contact'
    ],
    techStack: 'Vite + React, Vanilla CSS, Schema.org Restaurant Markup, Instant WhatsApp API',
    customizationOptions: [
      'Custom brand color palette and curated font pairings',
      'Direct integration with reservation engines (OpenTable, Resy, Dineout)',
      'Multi-currency and multi-language switchers',
      'Online gift card & voucher purchase flow',
      'Takeaway / delivery menu ordering integration'
    ],
    seo: {
      title: 'Saffron & Sage Bistro — Restaurant & Café Website Template | The Sorted Club',
      description: 'Explore the Saffron & Sage demo concept. An elegant, warm restaurant website featuring digital menus, online table booking, and mobile-first dining UX.'
    },
    demoData: {
      heroHeading: 'Artisan Flavours. Timeless Hospitality.',
      heroSub: 'An intimate culinary haven celebrating seasonal ingredients, wild herbs, and slow wood-fired craftsmanship in Indiranagar, Bengaluru.',
      menuCategories: ['Starters', 'Mains', 'Desserts', 'Artisan Drinks'],
      menuItems: [
        { name: 'Wood-Fired Burrata', category: 'Starters', price: '₹650', desc: 'Heirloom tomatoes, wild oregano, aged balsamic glaze, toasted sourdough', tag: 'Chef Choice' },
        { name: 'Charred Artichoke & Truffle Crema', category: 'Starters', price: '₹580', desc: 'Crispy capers, smoked sea salt, lemon thyme infusion, focaccia crisps', tag: 'Seasonal' },
        { name: 'Handcrafted Truffle Tagliatelle', category: 'Mains', price: '₹950', desc: 'Fresh egg pasta, black summer truffle, Parmigiano-Reggiano 24-month aged', tag: 'Popular' },
        { name: 'Charred Himalayan Trout', category: 'Mains', price: '₹1,150', desc: 'Saffron butter sauce, braised fennel, caperberries and lemon zest', tag: 'Wood-Fired' },
        { name: 'Porcini & Wild Mushroom Risotto', category: 'Mains', price: '₹890', desc: 'Acquerello rice, thyme butter, crispy sage, shaved pecorino romano', tag: 'Signature' },
        { name: 'Dark Chocolate Ganache Tart', category: 'Desserts', price: '₹550', desc: 'Sea salt flakes, roasted hazelnut praline, bourbon vanilla gelato', tag: 'Sweet' },
        { name: 'Rosewater Panna Cotta', category: 'Desserts', price: '₹480', desc: 'Pistachio crumble, pomegranate reduction, organic edible petals', tag: 'Light' },
        { name: 'Smoked Rosemary Negroni', category: 'Artisan Drinks', price: '₹680', desc: 'Botanical gin, artisanal vermouth, Campari, charred pine smoke', tag: 'Signature Cocktail' },
        { name: 'Wild Lavender Elderflower Spritz', category: 'Artisan Drinks', price: '₹420', desc: 'Zero-proof botanical cordial, sparkling spring water, fresh mint', tag: 'Zero Proof' }
      ],
      ambienceGallery: [
        { title: 'The Open Hearth Kitchen', subtitle: 'Live wood-fired cooking & artisanal bread baking', img: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80' },
        { title: 'Candlelit Courtyard', subtitle: 'Botanical garden dining under starlight canopy', img: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80' },
        { title: 'Sommelier Wine Vault', subtitle: 'Curated natural & biodynamic vintages', img: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&q=80' },
        { title: 'Private Mezzanine Lounge', subtitle: 'Intimate celebratory dinners for up to 18 guests', img: 'https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=800&q=80' }
      ],
      stats: [
        { val: '100%', label: 'Organic Farm Partners' },
        { val: '0', label: 'Artificial Preservatives' },
        { val: '24-Mo', label: 'Artisanal Fermentation' }
      ],
      openHours: 'Tuesday – Sunday: 12:00 PM – 11:30 PM (Mondays Closed)',
      address: 'Heritage Square, 4th Avenue, 100 Feet Rd, Indiranagar, Bengaluru, KA 560038',
      phone: '+91 9643820888'
    }
  },
  {
    id: 'apex-institute',
    slug: 'apex-institute',
    name: 'Apex Learning & Exam Hub',
    badge: 'Demo Concept',
    category: 'Coaching Institutes',
    designStyle: 'Clean Tech',
    suitableFor: 'Competitive exam coaching, IIT/NEET institutes, coding bootcamps, UPSC academies, tuition centers',
    shortDesc: 'A high-authority educational website designed to showcase batch schedules, download syllabi, highlight student ranks, and capture student inquiries.',
    tagline: 'High-conversion education blueprint engineered to turn parent visits into admissions.',
    startingPrice: '₹29,999',
    startingPriceUSD: '$750',
    budgetRange: '$2,500 - $5,000',
    turnaround: '6 - 8 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&q=80',
    accentColor: '#2563eb',
    secondaryColor: '#eff6ff',
    mainFeatures: [
      'Interactive batch finder & upcoming cohort schedule calendar',
      '1-Click Syllabus download modal with lead capture hook',
      'Faculty profiles & mentorship credentials grid',
      'Interactive Scholarship Test registration calculator',
      'Direct WhatsApp counselor chat & phone callback request',
      'Structured FAQ module addressing parent & student queries'
    ],
    includedSections: [
      'Hero banner with admission status badge and brochure download CTA',
      'Target Exam Course Finder (JEE Advanced, NEET-UG, Foundation, Full-Stack)',
      'Proven Study Methodology & 4-Step Learning Framework',
      'Interactive Batch Schedule & Fee Calculator module',
      'Faculty & Academic Advisory board showcase',
      'Sample Student Results & Rank Showcase (Sample format)',
      'Free Mock Test & Diagnostic Assessment registration',
      'Center Locations & Campus Contact Directory'
    ],
    techStack: 'Vite + React, Vanilla CSS, Course Schema Markup, Automated Lead Webhook',
    customizationOptions: [
      'Student portal / LMS login button link',
      'Integrated test result lookup by roll number',
      'Multi-branch / multi-city center selector',
      'Razorpay/Stripe online registration fee payment',
      'Automated SMS / WhatsApp counselor alert webhook'
    ],
    seo: {
      title: 'Apex Learning — Coaching Institute Website Template | The Sorted Club',
      description: 'Explore the Apex Learning demo concept. A high-trust coaching institute website featuring course schedules, syllabus downloads, and admission inquiry forms.'
    },
    demoData: {
      heroHeading: 'Target 99+ Percentile with Disciplined Mentorship',
      heroSub: 'Structured classroom programs, AI-powered diagnostic tests, and top-tier mentorship for engineering & medical entrance exams.',
      courses: [
        { name: 'JEE Advanced 2-Year Intensive', target: 'Class 11 & 12', duration: '24 Months', timing: 'Mon - Fri (4:00 PM - 7:30 PM)', fee: '₹1,25,000/yr', badge: 'Flagship Batch', seats: '18 Seats Left' },
        { name: 'NEET Super 50 Crash Course', target: 'Class 12 & Repeaters', duration: '6 Months', timing: 'Daily (9:00 AM - 2:00 PM)', fee: '₹68,000', badge: 'High Yield', seats: '12 Seats Left' },
        { name: 'Foundation Olympiad & NTSE', target: 'Class 8 to 10', duration: '12 Months', timing: 'Tue/Thu/Sat (4:30 PM - 6:30 PM)', fee: '₹45,000/yr', badge: 'Early Starter', seats: '25 Seats Left' },
        { name: 'Full-Stack Software Bootcamp', target: 'College & Grads', duration: '16 Weeks', timing: 'Weekend Intensive + Live Labs', fee: '₹55,000', badge: 'Job Ready', seats: '8 Seats Left' }
      ],
      methodology: [
        { step: '01', title: 'Diagnostic Baseline', desc: 'AI-driven assessment identifying micro-level knowledge gaps across Physics, Chemistry & Math.' },
        { step: '02', title: 'Concept Masterclasses', desc: 'In-depth interactive theory sessions led by IIT/AIIMS alumni with practical problem solving.' },
        { step: '03', title: 'Daily 1-on-1 Doubt Desk', desc: 'Dedicated 45-minute daily doubt-clearing sessions ensuring zero conceptual debt.' },
        { step: '04', title: 'All-India Mock Simulation', desc: 'Weekly simulated computer-based tests with real-time percentile ranking and error heatmaps.' }
      ],
      faculty: [
        { name: 'Dr. Alok Verma, Ph.D.', degree: 'IIT Kanpur Alumni', role: 'Head of Physics & Mechanics', exp: '14+ Yrs Mentorship', highlights: 'Mentored 38 top-100 AIR rankers in JEE Advanced.' },
        { name: 'Prof. Ananya Roy, M.S.', degree: 'AIIMS Gold Medalist', role: 'Head of Biology & Genetics', exp: '11+ Yrs Mentorship', highlights: 'Author of 3 best-selling NEET prep textbooks.' },
        { name: 'Vikramaditya Sen, M.Tech', degree: 'Ex-FAANG Senior Architect', role: 'Lead Instructor — Computer Science', exp: '9+ Yrs Industry', highlights: 'Placed 400+ students into Tier-1 product tech companies.' }
      ],
      sampleResults: [
        { rank: 'AIR 42', exam: 'JEE Advanced', student: 'Rohan M. (Classroom Student)', note: 'Sample Historical Result / Concept Data' },
        { rank: 'AIR 118', exam: 'NEET-UG 2025', student: 'Priya K. (Super 50 Cohort)', note: 'Sample Historical Result / Concept Data' },
        { rank: 'AIR 204', exam: 'JEE Main 99.94%ile', student: 'Aditya S. (2-Year Intensive)', note: 'Sample Historical Result / Concept Data' }
      ]
    }
  },
  {
    id: 'lumina-wellness',
    slug: 'lumina-wellness',
    name: 'Lumina Sanctuary & Spa',
    badge: 'Demo Concept',
    category: 'Salons and Spas',
    designStyle: 'Dark Luxury',
    suitableFor: 'Luxury day spas, aesthetic skin clinics, unisex salons, wellness resorts, massage therapy studios',
    shortDesc: 'A soothing, editorial-grade wellness website featuring treatment menus, aesthetician profiles, VIP membership tiers, and instant appointment booking.',
    tagline: 'Serene aesthetics and frictionless booking crafted for premier self-care brands.',
    startingPrice: '₹24,999',
    startingPriceUSD: '$650',
    budgetRange: '$2,500 - $5,000',
    turnaround: '5 - 7 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=80',
    accentColor: '#9333ea',
    secondaryColor: '#faf5ff',
    mainFeatures: [
      'Interactive service catalogue with duration, benefits & pricing',
      'Instant slot booking modal with preferred specialist selection',
      'Membership & monthly wellness pass promotion block',
      'Aesthetic photo gallery of treatment suites and products',
      'WhatsApp concierge button for personalized recommendations',
      'Mobile-optimized booking flow with SMS confirmation format'
    ],
    includedSections: [
      'Atmospheric hero section with video loop support & "Book Treatment" CTA',
      'Treatment categories: Holistic Body, Advanced Skin, Hair Rituals & Nails',
      'Signature Ritual of the Month highlight box',
      'Therapist & aesthetic specialist credential cards',
      'Sanctuary Ambience Gallery (Hydrotherapy Lounge, Cedar Sauna, Treatment Suites)',
      'VIP Memberships & Gift Card purchase tier',
      'Spa etiquette, hygiene standards & FAQs',
      'Sanctuary location, parking, and appointment policy'
    ],
    techStack: 'Vite + React, CSS Glassmorphism, Booking Schema, WhatsApp Concierge Hook',
    customizationOptions: [
      'Direct integration with Fresha, Mindbody, or Square Appointments',
      'Integrated e-commerce for skincare and beauty retail',
      'Custom loyalty points / package balance calculator',
      'Couples package and bridal group inquiry form'
    ],
    seo: {
      title: 'Lumina Sanctuary — Luxury Salon & Spa Website Template | The Sorted Club',
      description: 'Explore the Lumina Sanctuary demo concept. A dark luxury spa and aesthetic clinic website template featuring treatment menus and instant booking.'
    },
    demoData: {
      heroHeading: 'Reclaim Balance. Restore Radiance.',
      heroSub: 'Holistic botanical rituals, therapeutic bodywork, and clinical skin rejuvenation in an architectural sanctuary.',
      treatmentCategories: ['Body & Massage', 'Aesthetic Skin', 'Hair Rituals', 'Therapy'],
      treatments: [
        { id: 't1', title: 'Signature Himalayan Salt Stone Ritual', time: '90 Mins', price: '₹4,500', category: 'Body & Massage', tag: 'Best Seller', desc: 'Warm pink salt crystals soothe muscular tension, stimulate lymphatic drainage and deeply ground the nervous system.' },
        { id: 't2', title: 'Deep Tissue Botanical Recovery', time: '75 Mins', price: '₹3,600', category: 'Body & Massage', tag: 'Therapeutic', desc: 'Targeted myofascial release infused with wild arnica, eucalyptus, and organic cold-pressed sesame oil.' },
        { id: 't3', title: 'Hydra-Infusion Oxygen Facial', time: '60 Mins', price: '₹3,800', category: 'Aesthetic Skin', tag: 'Signature', desc: 'Non-invasive dermabrasion followed by hyaluronic oxygen mist infusion for instant luminous glow.' },
        { id: 't4', title: 'Cellular Peptide Skin Sculpting', time: '75 Mins', price: '₹4,200', category: 'Aesthetic Skin', tag: 'Anti-Aging', desc: 'Micro-current lymphatic stimulation, marine collagen mask, and botanical ceramide barrier repair.' },
        { id: 't5', title: 'Deep Nourish Botanical Hair Spa', time: '75 Mins', price: '₹2,900', category: 'Hair & Scalp', tag: 'Restorative', desc: 'Warm herbal scalp massage, steam infusion with bhringraj and moringa nectar, leaving hair silky and revitalized.' },
        { id: 't6', title: 'Aromatherapy Reflexology & Foot Bath', time: '45 Mins', price: '₹2,200', category: 'Therapy', tag: 'Relaxation', desc: 'Thermal magnesium foot soak followed by pressure point activation to release whole-body fatigue.' }
      ],
      specialists: [
        { name: 'Maya Lin, L.E.', role: 'Master Aesthetician & Skin Sculptor', exp: '10+ Yrs', focus: 'Cellular Hydration & Lymphatic Sculpting' },
        { name: 'David Chen', role: 'Senior Bodywork & Deep Tissue Therapist', exp: '12+ Yrs', focus: 'Myofascial Release & Himalayan Salt Therapy' },
        { name: 'Priya Nair', role: 'Holistic Ayurvedic Scalp Specialist', exp: '8+ Yrs', focus: 'Botanical Hair Therapy & Pressure Point Healing' }
      ],
      ambienceGallery: [
        { title: 'Aromatherapy Suite', img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80' },
        { title: 'Hydrotherapy Lounge', img: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=800&q=80' },
        { title: 'Herbal Infusion Tea Bar', img: 'https://images.unsplash.com/photo-1512290900672-1f4f664a7873?w=800&q=80' },
        { title: 'Botanical Relaxation Garden', img: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?w=800&q=80' }
      ],
      memberships: [
        { name: 'Sanctuary Gold Pass', price: '₹7,999/mo', desc: '2 Signature Treatments / month + 15% discount on botanical skincare retail & priority weekend booking.' },
        { name: 'Lumina Black Tier', price: '₹14,999/mo', desc: '4 Premium Treatments / month + Unlimited Hydrotherapy lounge access & complimentary couples upgrade.' }
      ]
    }
  },
  {
    id: 'haven-prime',
    slug: 'haven-prime',
    name: 'Haven & Prime Luxury Estates',
    badge: 'Demo Concept',
    category: 'Real Estate',
    designStyle: 'Dark Luxury',
    suitableFor: 'Luxury real estate agencies, property developers, boutique brokerages, vacation villa rentals, commercial leasing',
    shortDesc: 'A high-impact real estate showcase with filterable property listings, floor plans, virtual tour bookings, and private consultation funnels.',
    tagline: 'Architectural sophistication tailored for premium developments and luxury realtors.',
    startingPrice: '₹34,999',
    startingPriceUSD: '$890',
    budgetRange: '$5,000 - $15,000',
    turnaround: '7 - 10 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80',
    accentColor: '#d97706',
    secondaryColor: '#fffbeb',
    mainFeatures: [
      'Filterable property gallery (Location, Price, Bedrooms, Property Type)',
      'Comprehensive property detail views with floor plan toggles',
      'Schedule a Private Site Tour interactive modal',
      'Neighborhood amenity radar (Schools, Transit, Lifestyle hubs)',
      'Mortgage & EMI estimate preview widget',
      'Direct WhatsApp inquiry with specific property reference'
    ],
    includedSections: [
      'Hero showcase with immersive property video/imagery and search bar',
      'Featured Developments & Exclusive Listings grid with BHK filters',
      'Development Highlights (Architecture, Green Building, Smart Home)',
      'Neighborhood Amenity Radar (Airport, Helipad, Golf Club, Schools)',
      'RERA Compliance, Title Verification Guarantee & Advisory Board',
      'Schedule a Private Site Viewing Interactive Form',
      'VIP Investor Lounge & Private Preview Registration'
    ],
    techStack: 'Vite + React, Vanilla CSS, RealEstateListing Schema, Multi-Filter Engine',
    customizationOptions: [
      'Integration with Matterport 3D Virtual Tour iframe embeds',
      'Automated PDF brochure generation on lead submission',
      'Multi-currency price toggle (INR, USD, AED, GBP)',
      'Agent assignment routing based on property tier'
    ],
    seo: {
      title: 'Haven & Prime — Real Estate Website Template | The Sorted Club',
      description: 'Explore the Haven & Prime demo concept. A luxury real estate website template featuring filterable property listings, virtual tours, and private viewing booking.'
    },
    demoData: {
      heroHeading: 'Distinguished Living. Iconic Addresses.',
      heroSub: 'Curating an exclusive portfolio of bespoke penthouses, private sea-facing estates, and contemporary architectural villas.',
      properties: [
        { id: 're1', title: 'The Skyview Penthouse', location: 'Worli Sea Face, Mumbai', price: '₹14.5 Cr', beds: '4 BHK', area: '4,200 sq.ft', tag: 'Ready Possession', img: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80', highlights: 'Panoramic Arabian Sea view, private plunge pool, 3 reserved basements, 12ft ceiling height.' },
        { id: 're2', title: 'Villa Serenity & Palms', location: 'Assagao, North Goa', price: '₹8.9 Cr', beds: '5 BHK Villa', area: '5,800 sq.ft', tag: 'Private Pool', img: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80', highlights: 'Portuguese heritage architecture, 40ft private pool, lush tropical gardens, fully furnished.' },
        { id: 're3', title: 'The Zenith Golf Residences', location: 'Golf Course Road, Gurgaon', price: '₹6.7 Cr', beds: '3 BHK + Deck', area: '2,950 sq.ft', tag: 'New Launch', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80', highlights: 'Direct golf course frontage, biometric access, smart HVAC automation, clubhouse concierge.' },
        { id: 're4', title: 'The Waterfront Manor', location: 'Awas Beach, Alibaug', price: '₹11.2 Cr', beds: '4 BHK Coastal Estate', area: '6,400 sq.ft', tag: 'Beachfront', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80', highlights: 'Private beach access path, solar-powered estate, open-air cabanas, speed boat jetty.' }
      ],
      amenitiesRadar: [
        { label: 'International Airport', time: '18 Mins', desc: 'Seamless VIP terminal highway corridor' },
        { label: 'Championship Golf Club', time: '6 Mins', desc: '18-hole signature course & country club' },
        { label: 'Private Yacht Helipad', time: '8 Mins', desc: 'Direct coastal air transfer connectivity' },
        { label: 'Top International Academy', time: '10 Mins', desc: 'IB World School & Cambridge Curriculum' }
      ],
      advisors: [
        { name: 'Sameer Singhania', role: 'Head of Private Wealth Real Estate', rera: 'RERA/MAH/2024/0984', exp: '16+ Yrs' },
        { name: 'Natasha Fernandez', role: 'Luxury Villa Specialist — Goa & Coastal', rera: 'RERA/GOA/2023/1102', exp: '12+ Yrs' }
      ]
    }
  },
  {
    id: 'nordic-craft',
    slug: 'nordic-craft',
    name: 'Nordic Craft Studio',
    badge: 'Demo Concept',
    category: 'E-commerce',
    designStyle: 'Minimal & Editorial',
    suitableFor: 'Direct-to-consumer (D2C) brands, apparel lines, handcrafted goods, lifestyle products, artisanal coffee & tea',
    shortDesc: 'A clean, high-conversion online store with smooth product catalogs, size/color selectors, slide-out cart drawer, and frictionless checkout.',
    tagline: 'Minimalist editorial product storytelling with lightning-fast cart performance.',
    startingPrice: '₹34,999',
    startingPriceUSD: '$890',
    budgetRange: '$5,000 - $15,000',
    turnaround: '7 - 10 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80',
    accentColor: '#0f766e',
    secondaryColor: '#f0fdfa',
    mainFeatures: [
      'Interactive product catalog with category & price filtering',
      'Slide-out quick cart drawer with instant subtotal calculation',
      'Variant picker for sizes, colors, and material finishes',
      'Customer reviews and verified buyer badge preview',
      'Automated stock countdown & free shipping progress bar',
      'Razorpay / Stripe / COD payment flow integration readiness'
    ],
    includedSections: [
      'Hero banner with seasonal collection drop & "Shop Now" button',
      'Curated Product Grid with quick "Add to Cart" interactions',
      'Interactive Slide-out Shopping Cart Drawer with quantity steppers (+/-)',
      'Free Express Shipping Progress Bar (Orders over ₹3,000)',
      'Brand Craftsmanship & Sustainable Materials spotlight',
      'Editorial Lookbook / Instagram lifestyle carousel',
      'Customer satisfaction guarantee & easy returns policy',
      'Complete footer with policy links, order tracking & support'
    ],
    techStack: 'Vite + React, Vanilla CSS, Product Schema, Client Cart State Engine',
    customizationOptions: [
      'Shopify / WooCommerce headless API synchronization',
      'Automated WhatsApp order confirmation & delivery updates',
      'Currency converter & international DHL/FedEx rate calculation',
      'Custom bundle builder / Gift box creator'
    ],
    seo: {
      title: 'Nordic Craft — E-Commerce Website Template | The Sorted Club',
      description: 'Explore the Nordic Craft demo concept. A sleek D2C e-commerce website template featuring product galleries, interactive cart drawers, and rapid checkout.'
    },
    demoData: {
      heroHeading: 'Intentional Living. Handcrafted Essentials.',
      heroSub: 'Sustainable ceramics, Belgian woven linen, and timeless homeware designed to endure generations.',
      freeShippingThreshold: 3000,
      products: [
        { id: 'p1', name: 'Raw Stoneware Pour-Over Carafe', price: '₹2,400', priceNum: 2400, category: 'Coffee & Kitchen', rating: '4.9 ★', tag: 'Best Seller', img: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80', desc: 'Hand-thrown unglazed exterior with food-safe satin interior. 650ml brew capacity.' },
        { id: 'p2', name: 'Woven Belgian Linen Throw', price: '₹3,800', priceNum: 3800, category: 'Living & Decor', rating: '5.0 ★', tag: 'New Season', img: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80', desc: '100% certified organic European flax. Pre-washed for supreme cloud softness.' },
        { id: 'p3', name: 'Minimalist Matte Vessel (Set of 2)', price: '₹1,950', priceNum: 1950, category: 'Ceramics', rating: '4.8 ★', tag: 'Limited Batch', img: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=800&q=80', desc: 'Architectural silhouette for dried botanical stems or tabletop styling.' },
        { id: 'p4', name: 'Cedar & Bergamot Botanical Candle', price: '₹1,200', priceNum: 1200, category: 'Aromatics', rating: '4.9 ★', tag: 'Hand Poured', img: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800&q=80', desc: '100% soy wax, wooden crackling wick, 45-hour clean soot-free burn.' },
        { id: 'p5', name: 'Solid Walnut Chopping Board', price: '₹2,750', priceNum: 2750, category: 'Coffee & Kitchen', rating: '4.9 ★', tag: 'Artisan Carved', img: 'https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80', desc: 'Single slab American walnut treated with cold-pressed organic mineral oil.' },
        { id: 'p6', name: 'Hand-Blown Smoked Glass Tumblers (4-Pack)', price: '₹2,100', priceNum: 2100, category: 'Living & Decor', rating: '4.7 ★', tag: 'Hand Blown', img: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=800&q=80', desc: 'Subtle charcoal tint, weighted base, heat-resistant borosilicate glass.' }
      ]
    }
  },
  {
    id: 'profix-masters',
    slug: 'profix-masters',
    name: 'ProFix Masters — HVAC & Electrical',
    badge: 'Demo Concept',
    category: 'Local Service Businesses',
    designStyle: 'High-Conversion',
    suitableFor: 'Plumbers, HVAC contractors, electricians, pest control, roofing experts, cleaning agencies, auto repair',
    shortDesc: 'A trust-building, conversion-focused local service website with emergency dispatch banners, upfront pricing tables, service area checkers, and instant quote requests.',
    tagline: 'Engineered specifically for local service contractors to dominate Google search and phone calls.',
    startingPrice: '₹19,999',
    startingPriceUSD: '$550',
    budgetRange: '< $2,500',
    turnaround: '4 - 6 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=1200&q=80',
    accentColor: '#dc2626',
    secondaryColor: '#fef2f2',
    mainFeatures: [
      '24/7 Emergency Service floating bar with 1-click phone dialer',
      'Zip-code / Pin-code service radius validator widget',
      'Transparent upfront pricing & flat-rate estimate calculator',
      'Live booking form with preferred time window selection',
      'Licensing, insurance & background-checked technician badges',
      'Rich Google Local SEO Schema for map ranking domination'
    ],
    includedSections: [
      'Top 24/7 Emergency Dispatch Banner with instant phone dialer',
      'Hero banner with emergency response guarantee & instant call CTA',
      'Interactive Postal Code / Service Area Radius Checker',
      'Core 6 Flat-Rate Repair Services with clear price tags',
      'Why Choose Us: 5-Point Contractor Guarantee',
      'Interactive 3-Step "How We Work" timeline',
      'Emergency Dispatch Booking & Callback Form',
      'Complete contact hub with direct WhatsApp & booking form'
    ],
    techStack: 'Vite + React, LocalBusiness Schema Markup, Click-to-Call Integration',
    customizationOptions: [
      'Housecall Pro / Jobber CRM booking integration',
      'Live technician dispatch tracker simulation',
      'Multi-city service page generation',
      'Automated SMS review request post-service webhook'
    ],
    seo: {
      title: 'ProFix Masters — Local Service Business Website Template | The Sorted Club',
      description: 'Explore the ProFix Masters demo concept. A high-converting contractor website template featuring emergency dispatch banners, service radius checks, and instant quote forms.'
    },
    demoData: {
      heroHeading: 'Same-Day HVAC, Electrical & Plumbing. 100% Fixed Right.',
      heroSub: 'Licensed, background-checked master technicians at your doorstep within 60 minutes. Zero overtime fees. Transparent upfront pricing guaranteed.',
      phone: '+91 9643820888',
      services: [
        { id: 's1', title: 'Emergency AC Repair & Gas Refill', price: 'From ₹499', desc: 'Complete cooling diagnostic, refrigerant pressure top-up, compressor check & filter overhaul.', badge: 'Same Day Dispatch', warranty: '90-Day Guarantee' },
        { id: 's2', title: 'Electrical Panel & Short Circuit Fix', price: 'From ₹799', desc: 'MCB breaker replacement, wiring burn repair, overload safety checks by certified wiremen.', badge: 'Licensed Masters', warranty: '180-Day Guarantee' },
        { id: 's3', title: 'High-Pressure Leak Detection & Plumbing', price: 'From ₹399', desc: 'Concealed wall pipe leak acoustics, tap & mixer overhaul, main line valve repair.', badge: 'Zero Mess', warranty: '90-Day Guarantee' },
        { id: 's4', title: 'Hydro-Jet Drain Cleaning & De-clog', price: 'From ₹599', desc: 'Commercial grade rotary snakes and hydro-jetting to clear grease, roots, and blockages.', badge: 'Instant Clearance', warranty: '30-Day Guarantee' },
        { id: 's5', title: 'Water Heater & Geyser Overhaul', price: 'From ₹699', desc: 'Heating element descale, thermostat calibration, safety valve test and anode replacement.', badge: 'Energy Saver', warranty: '90-Day Guarantee' },
        { id: 's6', title: 'Annual Home Care AMC Maintenance', price: '₹1,999/yr', desc: '3 comprehensive seasonal visits, priority 30-minute dispatch & 20% discount on all spare parts.', badge: 'Best Value', warranty: 'Year-Round Coverage' }
      ],
      guarantees: [
        { title: '60-Min Rapid Dispatch', desc: 'Technicians stationed across town for emergency calls.' },
        { title: 'Licensed & Background Checked', desc: 'Strict police-verified master technicians with ID badges.' },
        { title: '100% Upfront Pricing', desc: 'You approve the exact price quote before any wrench turns.' },
        { title: '90-Day Workmanship Warranty', desc: 'If the issue returns within 90 days, we fix it 100% free.' },
        { title: 'No Overtime or Weekend Surcharge', desc: 'Same transparent flat-rate fee 24 hours a day, 7 days a week.' }
      ]
    }
  },
  {
    id: 'elena-vance',
    slug: 'elena-vance',
    name: 'Elena Vance — Brand Strategist & Advisor',
    badge: 'Demo Concept',
    category: 'Freelancers and Personal Brands',
    designStyle: 'Minimal & Editorial',
    suitableFor: 'Brand consultants, executive coaches, keynote speakers, freelance designers, fractional CMOs, industry authors',
    shortDesc: 'A bespoke personal brand website featuring case study deep-dives, speaking engagements, thought leadership articles, and advisory booking.',
    tagline: 'High-authority personal brand platform engineered to command premium client retainers.',
    startingPrice: '₹24,999',
    startingPriceUSD: '$650',
    budgetRange: '$2,500 - $5,000',
    turnaround: '5 - 7 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=1200&q=80',
    accentColor: '#10100f',
    secondaryColor: '#f4f1e9',
    mainFeatures: [
      'Editorial case study layouts with impact metrics and deliverables',
      'Integrated Calendly / Cal.com discovery call scheduler',
      'Podcast / Keynote speaking reel video embed section',
      'Newsletter / Substack subscription lead magnet hook',
      'Client logos and advisory retainer package breakdown',
      'Ultra-fast reading mode and typographic refinement'
    ],
    includedSections: [
      'Hero section with distinct value manifesto and "Book Consultation" CTA',
      'Advisory Services: Narrative Design, Fractional CMO & Executive Advisory',
      '3 Detailed Sample Case Studies with client problem, strategy & measurable impact metrics',
      'Skills, Frameworks & Consulting Methodology Stack',
      'Executive Bio & 12-Year Advisory Background',
      'Retainer & Project Investment tiers',
      '30-Minute Discovery Briefing Booking Modal'
    ],
    techStack: 'Vite + React, Vanilla CSS, Person Schema, Cal.com Embed Hook',
    customizationOptions: [
      'Substack / Beehiiv API email newsletter integration',
      'Private client portal for shared deliverables',
      'Digital product / course checkout integration (Gumroad/Stripe)',
      'Dynamic blog CMS with Markdown support'
    ],
    seo: {
      title: 'Elena Vance — Brand Strategist Website Template | The Sorted Club',
      description: 'Explore the Elena Vance demo concept. A clean, editorial personal brand website template for consultants, strategists, and executive advisors.'
    },
    demoData: {
      heroHeading: 'I Help Category-Defining Founders Clarify Their Story & Scale.',
      heroSub: 'Former agency VP turned fractional brand strategist for venture-backed technology, fintech, and luxury consumer brands.',
      services: [
        { title: 'Narrative Design & Category Creation', deliverable: 'Category Manifesto, Strategic Story Deck, Key Messaging Architecture', timeline: '3 - 4 Weeks', investment: '₹1,50,000' },
        { title: 'Fractional CMO & Marketing Leadership', deliverable: 'Weekly Executive Strategy, Agency Squad Oversight, GTM Orchestration', timeline: 'Quarterly Retainer', investment: '₹85,000 / mo' },
        { title: 'High-Stakes Pitch & Fundraise Storytelling', deliverable: 'Investor Deck Narrative, Founder Keynote Coaching, Teaser Video Script', timeline: '2 Weeks Sprint', investment: '₹1,10,000' },
        { title: 'Brand Repositioning & Market Expansion', deliverable: 'Competitive Audit, Audience Segmentation, Visual System Guidelines', timeline: '4 - 6 Weeks', investment: '₹1,80,000' }
      ],
      caseStudies: [
        {
          id: 'cs1',
          client: 'HyperScale AI (Enterprise Infrastructure)',
          badge: 'SaaS / DevTools',
          problem: 'Positioned merely as a database connector, resulting in low enterprise contract values and high CAC.',
          strategy: 'Re-anchored the brand as the "Deterministic AI Orchestration Layer" for Fortune 500 engineering teams.',
          deliverables: 'Category Manifesto, Website Overhaul, Enterprise Sales Deck & Demo Video Script.',
          impact: '+240% Inbound Enterprise Pipeline • $18M Series A Secured • 3.2x ACV Increase',
          tag: 'Sample Case Study Concept'
        },
        {
          id: 'cs2',
          client: 'Solis Renewable Mobility (D2C Electric)',
          badge: 'Consumer Tech',
          problem: 'Struggled to differentiate from legacy automotive manufacturers with sterile spec-heavy marketing.',
          strategy: 'Crafted an inspiring lifestyle narrative around "Quiet Speed" and minimalist Scandinavian urban mobility.',
          deliverables: 'Launch Campaign Film, Interactive Configurator Story, Press Kit & VIP Waitlist.',
          impact: '12,000 Paid Pre-Orders in 72 Hours • Featured in TechCrunch, Wired, Monocle',
          tag: 'Sample Case Study Concept'
        },
        {
          id: 'cs3',
          client: 'Luminary Wealth Management (Fintech)',
          badge: 'Private Wealth',
          problem: 'Archaic onboarding experience leading to 60% client drop-off among Next-Gen high net worth founders.',
          strategy: 'Redesigned the digital client journey with institutional transparency and bespoke advisory touchpoints.',
          deliverables: 'Client Portal Narrative, Trust Manifesto, Founder Welcome Experience.',
          impact: '$45M Net New AUM in Q1 • 88% Client Retention • NPS 78',
          tag: 'Sample Case Study Concept'
        }
      ],
      skillsStack: [
        'Category Design Frameworks',
        'C-Suite Narrative Alignment',
        'Go-to-Market (GTM) Architecture',
        'Series A/B Fundraise Pitching',
        'Executive Ghostwriting',
        'Design System Direction'
      ]
    }
  },
  {
    id: 'flowgrid-ai',
    slug: 'flowgrid-ai',
    name: 'FlowGrid AI — Automation Platform',
    badge: 'Demo Concept',
    category: 'Startup Landing Pages',
    designStyle: 'Clean Tech',
    suitableFor: 'AI startups, B2B SaaS, dev tools, fintech apps, productivity software, API platforms',
    shortDesc: 'A dynamic, modern SaaS landing page with interactive product demonstrations, API code switchers, tiered pricing toggles, and instant signup funnels.',
    tagline: 'Engineered for venture-backed and bootstrapped startups to drive trial signups.',
    startingPrice: '₹29,999',
    startingPriceUSD: '$750',
    budgetRange: '$2,500 - $5,000',
    turnaround: '5 - 7 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    accentColor: '#06b6d4',
    secondaryColor: '#ecfeff',
    mainFeatures: [
      'Interactive feature tab switcher with dynamic preview graphics',
      'Interactive code snippet viewer (Python, Node.js, cURL, Go)',
      'Monthly / Annual billing toggle with 20% discount calculation',
      'Self-serve ROI & time saved calculator slider',
      'SOC2 / GDPR compliance badges & security credentials',
      'Waitlist / Early access email capture with verification'
    ],
    includedSections: [
      'Hero section with animated terminal badge and "Start Free Trial" CTA',
      'Interactive Feature Tour with 3 dynamic tabs (Orchestration, Autonomous Agents, Webhooks)',
      '3-Step Pipeline Architecture Diagram',
      'Live Multi-Language Code Playground (Python, Node.js, cURL) with Copy feedback',
      'Tiered SaaS Pricing with Monthly / Annual -20% discount calculation',
      'Interactive SaaS FAQ Accordion',
      'Free 14-Day Trial Signup Modal'
    ],
    techStack: 'Vite + React, Vanilla CSS, SoftwareApplication Schema, Syntax Highlighter',
    customizationOptions: [
      'Integration with Supabase / Firebase / Auth0 login flows',
      'Stripe Billing & Customer Portal subscription setup',
      'Intercom / Crisp live chat widget integration',
      'Changelog & Public Roadmap documentation hub'
    ],
    seo: {
      title: 'FlowGrid AI — Startup SaaS Landing Page Template | The Sorted Club',
      description: 'Explore the FlowGrid AI demo concept. A high-converting SaaS landing page template featuring interactive product tours, code previews, and tiered pricing.'
    },
    demoData: {
      heroHeading: 'Automate Complex Workflows. Zero Boilerplate.',
      heroSub: 'The developer-first orchestration engine for autonomous AI agents, multi-step webhooks, and real-time database pipelines.',
      featureTabs: [
        {
          id: 'orchestration',
          label: 'Deterministic Orchestration',
          headline: 'Build robust DAG workflows with automatic retries and state rollbacks',
          desc: 'Chain multiple LLM calls, vector search queries, and external APIs with sub-millisecond execution overhead and full observability.',
          points: ['Automatic checkpointing & error rollbacks', 'Sub-millisecond execution latency', 'Distributed state machine with visual replay'],
          codePreview: 'pipeline.step("enrich").retry({ max: 3, backoff: "exponential" })'
        },
        {
          id: 'agents',
          label: 'Autonomous AI Agents',
          headline: 'Self-healing AI agents with sandboxed tool execution',
          desc: 'Equip your agents with custom OpenAPI tool specs, PostgreSQL access, and strict permission sandboxes. Zero hallucinated execution.',
          points: ['Zero-leak sandboxed code runners', 'Vector memory with automatic decay', 'Strict human-in-the-loop review triggers'],
          codePreview: 'agent = flowgrid.Agent(tools=[db_query, whatsapp_api, pdf_parser])'
        },
        {
          id: 'webhooks',
          label: 'Real-Time Sync & Webhooks',
          headline: 'Stream millions of events without managing Kafka clusters',
          desc: 'High-throughput ingestion engine capable of handling 50,000+ RPS with automatic deduplication, batching, and signature verification.',
          points: ['HMAC SHA-256 signature verification', 'Automated dead-letter queue routing', 'Instant bi-directional CRM synchronizers'],
          codePreview: 'flowgrid.listen("stripe.invoice_paid", handler=on_invoice_settled)'
        }
      ],
      pipelineSteps: [
        { step: '01', title: 'Ingest & Validate', desc: 'Incoming webhook or API event is verified, parsed, and logged in under 12ms.' },
        { step: '02', title: 'Agentic Reasoning', desc: 'AI models evaluate payload, pull relevant context from vector stores, and execute business logic.' },
        { step: '03', title: 'Sync & Dispatch', desc: 'Updates are committed to your database, CRM is synced, and WhatsApp/Slack notifications fire.' }
      ],
      pricingPlans: [
        { name: 'Developer Starter', priceMonthly: '$29 / mo', priceAnnual: '$24 / mo', desc: 'For early stage builders, side projects and rapid MVP testing.', features: ['Up to 50,000 pipeline runs/mo', '5 Active AI Agents', 'Standard API Rate Limit (60 req/sec)', 'Community Discord Support', '30-Day Execution Log History'] },
        { name: 'Growth Scale', priceMonthly: '$99 / mo', priceAnnual: '$79 / mo', desc: 'For scaling startups and product teams demanding dedicated throughput.', popular: true, features: ['500,000 pipeline runs/mo', '25 Active AI Agents', 'Priority Queue & Dedicated Webhooks', 'Custom OpenAPI Tool Integration', '99.95% Uptime SLA Guarantee', 'Private Slack Channel Support'] },
        { name: 'Enterprise Cluster', priceMonthly: 'Custom Quote', priceAnnual: 'Custom Quote', desc: 'For organizations with stringent VPC security and HIPAA compliance needs.', features: ['Unlimited pipeline runs', 'Dedicated VPC / Self-hosted instance', 'Custom LLM fine-tuning pipelines', 'Dedicated Technical Account Manager', '99.99% Uptime SLA & BAA Agreement', 'Custom SAML SSO & Audit Logs'] }
      ],
      faqs: [
        { q: 'How does FlowGrid connect to our existing database?', a: 'FlowGrid supports secure connection pooling to PostgreSQL, MySQL, MongoDB, and Supabase via encrypted TLS and IP whitelisting.' },
        { q: 'Can we self-host FlowGrid in our own AWS / GCP cloud?', a: 'Yes! Our Enterprise tier provides Docker Compose and Helm chart deployment manifests for full self-hosted air-gapped setups.' },
        { q: 'Is there a free trial period to test workflows?', a: 'Yes, every account starts with a 14-day full-access trial of our Growth plan with 10,000 free execution credits and no credit card required.' },
        { q: 'How are rate limits and burst capacity handled?', a: 'Our distributed gateway automatically absorbs traffic spikes and queues executions seamlessly without dropped payloads.' }
      ]
    }
  },
  {
    id: 'zenith-retreats',
    slug: 'zenith-retreats',
    name: 'Zenith Wellness & Retreat Booking',
    badge: 'Demo Concept',
    category: 'Booking Websites',
    designStyle: 'Warm & Organic',
    suitableFor: 'Yoga retreats, fitness bootcamps, adventure travel, boutique hotels, workshop organizers, wellness getaways',
    shortDesc: 'A captivating booking website with date-range pickers, room selection, itinerary timelines, and deposit reservation flows.',
    tagline: 'Inspiring visual journeys with frictionless date selection and retreat reservations.',
    startingPrice: '₹34,999',
    startingPriceUSD: '$890',
    budgetRange: '$5,000 - $15,000',
    turnaround: '7 - 10 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    accentColor: '#15803d',
    secondaryColor: '#f0fdf4',
    mainFeatures: [
      'Interactive date calendar with real-time room/spot availability',
      'Daily retreat itinerary timeline with activity breakdown',
      'Accommodation room selector with photo carousel & amenities',
      'Deposit payment & reserve your spot booking modal',
      'Instructor & guest host biography cards',
      'Direct WhatsApp booking concierge for travel questions'
    ],
    includedSections: [
      'Cinematic hero with upcoming retreat dates and "Reserve Spot" CTA',
      'Upcoming Retreat Destinations & Dates overview',
      'Daily Experience Itinerary (Morning Meditation, Hiking, Workshops)',
      'Room & Suite Selection with bed configurations & pricing',
      'What Is Included: Organic Meals, Transfers, Daily Yoga & Excursions',
      'Lead Instructor & Resident Wellness Guide credentials',
      'Packing checklist & travel preparation FAQ',
      'Booking checkout & retreat reservation form'
    ],
    techStack: 'Vite + React, Vanilla CSS, Event & Lodging Schema, Booking Flow Engine',
    customizationOptions: [
      'Integration with Stripe / Razorpay partial deposit payments',
      'Early-bird countdown discount timers',
      'Dietary requirements & flight detail intake forms',
      'Add-on excursion & private spa treatment checkout upsells'
    ],
    seo: {
      title: 'Zenith Retreats — Booking Website Template | The Sorted Club',
      description: 'Explore the Zenith Retreats demo concept. A tranquil retreat and experience booking website template featuring itinerary timelines and room selection.'
    },
    demoData: {
      heroHeading: '7-Day Mind & Body Immersion in the Himalayas.',
      heroSub: 'Reconnect with nature through guided meditation, organic farm cuisine, and breathtaking mountain vistas in Rishikesh Valley.',
      rooms: [
        { id: 'r1', name: 'Mountain View Deluxe Cedar Suite', price: '₹48,000 / person', capacity: '1 - 2 Guests', desc: 'Private cedar balcony overlooking snow peaks, king bed, ensuite botanical bath, wood-burning fireplace.', tag: 'Popular' },
        { id: 'r2', name: 'Shared Garden Sanctuary Cottage', price: '₹32,000 / person', capacity: '2 Guests', desc: 'Twin organic cotton beds, private garden patio, handcrafted brass fixtures, shared luxury relaxation lounge.', tag: 'Best Value' }
      ],
      itinerary: [
        { time: '06:30 AM', activity: 'Sunrise Pranayama & Guided Meditation', location: 'Open-Air Yoga Shala' },
        { time: '08:30 AM', activity: 'Ayurvedic Farm-to-Table Breakfast', location: 'Sanctuary Orchard' },
        { time: '11:00 AM', activity: 'Pine Forest Mindful Hiking & River Dip', location: 'Cedar Valley Trail' },
        { time: '04:30 PM', activity: 'Sound Healing & Tibetan Singing Bowls', location: 'Acoustic Pavilion' },
        { time: '07:30 PM', activity: 'Candlelit Organic Dinner & Philosophy Circle', location: 'Hearth Dining Room' }
      ]
    }
  },
  {
    id: 'atelier-noir',
    slug: 'atelier-noir',
    name: 'Atelier Noir — Motion & Architecture',
    badge: 'Demo Concept',
    category: 'Portfolio Websites',
    designStyle: 'Bold & Modern',
    suitableFor: 'Architecture studios, creative agencies, 3D artists, film directors, interior designers, branding studios',
    shortDesc: 'An avant-garde portfolio experience with fullscreen project showcases, client case studies, custom cursor effects, and project inquiry forms.',
    tagline: 'Gallery-grade digital presence built to display creative work in its highest fidelity.',
    startingPrice: '₹29,999',
    startingPriceUSD: '$750',
    budgetRange: '$2,500 - $5,000',
    turnaround: '6 - 8 Business Days',
    heroImage: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80',
    accentColor: '#e11d48',
    secondaryColor: '#fff1f2',
    mainFeatures: [
      'Filterable project grid (Architecture, 3D Motion, Brand Identity)',
      'Deep case study view with full-bleed imagery & design rationale',
      'Interactive design studio reel video player',
      'Awards & exhibition recognition honors roll',
      'Project inquiry brief builder with budget selector',
      'Smooth micro-interactions and refined typography'
    ],
    includedSections: [
      'Minimalist hero section with dynamic studio manifesto',
      'Selected Works Masonry Gallery with hover preview interactions',
      'Studio Philosophy & Architectural Methodology',
      'Full Case Study Breakdown: Concept, 3D Rendering & Construction',
      'Client Roster & Industry Recognition (Sample format)',
      'Studio Team & Global Locations (Tokyo, Berlin, Mumbai)',
      'Press, Publications & Monograph Books',
      'Project Inquiry Form with timeline & scope selector'
    ],
    techStack: 'Vite + React, Vanilla CSS, CreativeWork Schema, Smooth Animation Engine',
    customizationOptions: [
      'Vimeo / YouTube Pro seamless video background embeds',
      'Interactive 360° architectural render viewer',
      'PDF portfolio lookbook instant download trigger',
      'Dark / Light mode aesthetic theme toggle'
    ],
    seo: {
      title: 'Atelier Noir — Architecture & Creative Studio Portfolio Template | The Sorted Club',
      description: 'Explore the Atelier Noir demo concept. A bold, modern portfolio website template for architectural firms, creative agencies, and motion designers.'
    },
    demoData: {
      heroHeading: 'Sculpting Space. Defining Modernity.',
      heroSub: 'An international architecture and spatial design practice crafting monolithic structures and immersive brand environments across Tokyo, Berlin, and Mumbai.',
      projects: [
        { id: 'w1', title: 'The Monolith Residence', category: 'Architecture', year: '2025', location: 'Kyoto, Japan', tag: 'Featured Project', desc: 'Cast concrete residential sanctuary blending raw Brutalism with tranquil Japanese stone gardens.', img: 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80' },
        { id: 'w2', title: 'Vesper Pavilion & Spatial System', category: 'Spatial Design', year: '2026', location: 'Milan Biennale, Italy', tag: 'Exhibition', desc: 'Tensile membrane acoustic installation exploring sound reflection and filtered natural illumination.', img: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80' },
        { id: 'w3', title: 'Kroma Brand Identity & Flagship Gallery', category: 'Branding & Interior', year: '2025', location: 'London, UK', tag: 'Commercial', desc: 'Monochromatic retail interior and tactile packaging identity for a luxury ceramics house.', img: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80' }
      ]
    }
  }
];
