import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Code2,
  BriefcaseBusiness,
  Bot,
  Users,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Zap,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Layers,
  Check,
  Clock,
  Target,
  BarChart3,
  Search,
  MessageSquare,
  Cpu,
  UserCheck,
  FileCheck,
  Menu,
  X
} from 'lucide-react';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  staggerContainer,
  TRANSITIONS,
  accordionVariants
} from '../utils/motion';
import PublicNavbar from './PublicNavbar';
import { useCarouselPagination } from '../utils/useCarouselPagination';
import { useIsMobile } from '../utils/responsive';
import SignaturePerimeterOutline from './SignaturePerimeterOutline';

const SERVICES_DATA = {
  build: {
    id: 'build',
    serviceName: 'Website / Build',
    title: 'BUILD',
    subtitle: 'Websites, Software & Digital Products',
    eyebrow: 'PILLAR 01 — DIGITAL ARCHITECTURE',
    heroDesc: 'High-performing business websites, e-commerce, custom web apps and internal tools designed to turn traffic into revenue and streamline operations.',
    whoFor: 'Restaurants, salons, gyms, clinics, consultants, local service contractors, real estate, small manufacturers, retailers, and startups needing a clean, high-converting digital presence that generates real inquiries.',
    whoForProfiles: [
      {
        index: '01',
        title: 'High-Intent Local Services & Practices',
        segments: 'Clinics, Salons, Consultants, Real Estate & Contractors',
        desc: 'Businesses where prospective clients evaluate credibility, reviews, and physical location within seconds of landing on a phone.',
        signal: 'Losing 70%+ of mobile visitors due to slow loading or broken tap-to-call flows.',
        outcome: 'Sub-second mobile authority hub with 1-tap WhatsApp lead capture and Google Maps integration.',
        tag: 'LOCAL AUTHORITY'
      },
      {
        index: '02',
        title: 'Modern Retailers & Specialty Brands',
        segments: 'Artisanal Goods, Apparel, Specialty Food & Boutiques',
        desc: 'Product creators needing a high-velocity online storefront with lightning-fast catalog browsing, cart drawers, and secure payment checkout.',
        signal: 'High cart abandonment on sluggish, bloated off-the-shelf templates.',
        outcome: 'PageSpeed 90+ storefront with frictionless Razorpay/Stripe checkout and automated order alerts.',
        tag: 'FAST COMMERCE'
      },
      {
        index: '03',
        title: 'Tech Founders, Platforms & Scaling Ops',
        segments: 'Software Startups, B2B Platforms & Multi-Branch Operations',
        desc: 'Teams needing dedicated client portals, custom calculators, internal operational dashboards, or custom full-stack web applications tailored to proprietary workflows.',
        signal: 'Generic no-code site builders cannot support custom database logic, secure authentication, or REST APIs.',
        outcome: 'Production full-stack architecture (React, FastAPI, PostgreSQL) with 100% source code and git repository ownership.',
        tag: 'BESPOKE SOFTWARE'
      }
    ],
    roadblocks: [
      {
        index: '01',
        category: 'SPEED & MOBILE EXPERIENCE',
        problem: 'Outdated or slow websites that repel 75%+ of mobile prospects before the hero section even loads.',
        resolution: 'Zero-bloat, sub-second PageSpeed architecture (90+ Google score target) engineered specifically for mobile conversion.'
      },
      {
        index: '02',
        category: 'CONVERSION & LEAD ROUTING',
        problem: 'Missing or broken lead capture where inquiries get trapped in spam folders or lost in messy inboxes.',
        resolution: 'Direct 1-click WhatsApp floating chat button and instant multi-channel CRM routing to notify your phone immediately.'
      },
      {
        index: '03',
        category: 'CODE OWNERSHIP & PLATFORM RISK',
        problem: 'Proprietary website builders charging recurring hostage fees while retaining custody of your data and code.',
        resolution: '100% full client ownership of source code, domain, hosting, and assets. Zero vendor lock-in or recurring builder tax.'
      },
      {
        index: '04',
        category: 'DELIVERY VELOCITY & BUDGET',
        problem: 'Traditional agency scope creep stretching 2-week website projects into 3-month budgetary nightmares.',
        resolution: 'Fixed-scope, sprint-based delivery in 5–10 business days backed by transparent 50% deposit / 50% launch milestone billing.'
      }
    ],
    deliverablesPillars: [
      {
        category: 'Commercial Web & Conversion Funnels',
        code: 'CORE-WEB',
        icon: 'Code2',
        headline: 'Authoritative Web Presences & High-Converting Funnels',
        summary: 'Fast, responsive, SEO-structured web platforms engineered to establish instant market authority and turn visits into booked revenue.',
        items: [
          {
            title: 'Business Websites & Digital Flagships',
            desc: '5–8 custom responsive pages with rich editorial typography, trust badges, and interactive service selectors.',
            badge: 'Speed 90+'
          },
          {
            title: 'High-Converting Landing Pages & Funnels',
            desc: 'Dedicated single-page campaigns with multi-step qualification quizzes, dynamic UTM tracking, and sticky mobile CTA docks.',
            badge: 'Lead Funnel'
          },
          {
            title: 'E-Commerce Storefronts & Shopping Carts',
            desc: 'Product catalog with variants, shopping cart drawers, and secure Razorpay/Stripe checkout with automated transactional receipts.',
            badge: 'Storefront'
          }
        ]
      },
      {
        category: 'Custom Applications & Operations Hubs',
        code: 'CUSTOM-APP',
        icon: 'Layers',
        headline: 'Bespoke Software, Portals & Data Integrations',
        summary: 'Full-stack software engineering that replaces disjointed spreadsheets with unified client portals, admin consoles, and two-way API pipelines.',
        items: [
          {
            title: 'Client Portals & Authenticated Dashboards',
            desc: 'Secure role-based access control (RBAC), personalized client accounts, document vaults, and live status tracking.',
            badge: 'Auth & Portals'
          },
          {
            title: 'Interactive Calculators & Dynamic CMS',
            desc: 'Custom quotation estimators, headless content management for case studies, and live booking calendar synchronization.',
            badge: 'Dynamic CMS'
          },
          {
            title: 'API Webhooks & Third-Party System Sync',
            desc: 'Seamless real-time synchronization between CRM, WhatsApp Business API, PostgreSQL databases, and payment processors.',
            badge: 'API Webhooks'
          }
        ]
      },
      {
        category: 'Engineering Standards & Guarantees',
        code: 'STANDARDS',
        icon: 'ShieldCheck',
        headline: 'The Sorted Technical Guarantee',
        summary: 'Every delivery conforms to our strict engineering protocol: zero vendor lock-in, uncompromising speed, and verified technical warranties.',
        items: [
          {
            title: '100% Asset & Source Code Ownership',
            desc: 'Complete transfer of git repositories, domain registrations, hosting accounts, and production assets upon launch.',
            badge: 'Full Ownership'
          },
          {
            title: 'PageSpeed 90+ & Schema SEO Target',
            desc: 'Rigorous asset minification, Open Graph metadata, semantic HTML5, and automated XML sitemap generation.',
            badge: 'Schema SEO'
          },
          {
            title: '30 to 90 Days Post-Launch Warranty',
            desc: 'Dedicated technical SLA covering defect fixes, performance monitoring, and team handover walkthrough.',
            badge: 'SLA Warranty'
          }
        ]
      }
    ],
    problemsSolved: [
      'Outdated or slow websites that repel qualified potential clients',
      'Missing or broken mobile experience where 75%+ of customers browse',
      'No direct WhatsApp or lead capture mechanism to convert visitors',
      'High drop-off rates due to complicated navigation or slow loading'
    ],
    offerings: [
      { title: 'Business Websites', desc: 'Fast, responsive, SEO-optimized web presences crafted to establish instant market authority.' },
      { title: 'High-Converting Landing Pages', desc: 'Dedicated campaign landing pages engineered for maximum lead and WhatsApp capture.' },
      { title: 'E-Commerce & Online Stores', desc: 'Secure, high-speed stores with payment gateways and automated order tracking.' },
      { title: 'Custom Web Applications', desc: 'Bespoke client portals, SaaS applications, and tailored business software.' },
      { title: 'Dashboards & Internal Tools', desc: 'Admin consoles, operations hubs, and data visualizations for your team.' },
      { title: 'API & Database Integrations', desc: 'Seamless synchronization between CRM, payment, ERP, and third-party systems.' }
    ],
    packages: [
      {
        name: 'Starter Website',
        priceINR: '₹14,999',
        priceUSD: '$400',
        billing: '50% upfront, 50% on completion • 5–7 Days',
        badge: 'Fast Launch',
        desc: 'For local businesses and professionals that need a clean, credible 3–5 page website with WhatsApp lead capture.',
        features: [
          '3 to 5 core responsive pages (Home, About, Services, Contact/Location)',
          'Direct WhatsApp chat button & instant email/CRM lead capture',
          'Google Maps & business contact integration',
          'Baseline On-Page SEO & SSL HTTPS security certificate',
          'Custom domain connection & high-speed hosting setup',
          '30 days post-launch warranty & 2 revision rounds'
        ],
        ctaText: 'Get Starter Website',
        popular: false
      },
      {
        name: 'Business Website',
        priceINR: '₹24,999',
        priceUSD: '$650',
        billing: '50% upfront, 50% on completion • 7–10 Days',
        badge: 'Most Popular',
        desc: 'Authoritative multi-page hub with dynamic CMS for case studies, deep service pages, and search rankings.',
        features: [
          '5 to 8 custom responsive pages with rich UI/UX',
          'Dynamic Headless CMS for articles & case studies',
          'Speed optimization (90+ PageSpeed score target)',
          'Advanced On-Page SEO & XML Sitemap auto-generation',
          'Direct WhatsApp & multi-step inquiry routing to CRM',
          '45 days priority warranty support & 2 revision rounds'
        ],
        ctaText: 'Get Business Website',
        popular: true
      },
      {
        name: 'Lead-Gen Website',
        priceINR: '₹29,999',
        priceUSD: '$750',
        billing: '50% upfront, 50% on completion • 6–8 Days',
        badge: 'High Conversion',
        desc: 'Sales funnel engineered specifically to convert paid & organic traffic into booked appointments.',
        features: [
          'High-converting long-form landing page + discovery intake page',
          'Interactive multi-step lead qualification form',
          'Real-time CRM sync with automated lead stage assignment',
          'Instant WhatsApp & Email notification trigger to sales team',
          'Dynamic UTM parameter tracking (source, medium, campaign)',
          '30 days conversion tracking warranty & 2 revision rounds'
        ],
        ctaText: 'Get Lead-Gen Website',
        popular: false
      },
      {
        name: 'E-Commerce Website',
        priceINR: '₹39,999',
        priceUSD: '$990',
        billing: '50% upfront, 50% on completion • 10–14 Days',
        badge: 'Storefront',
        desc: 'Blazing-fast online store with shopping cart, variant management, and Razorpay/Stripe checkout.',
        features: [
          'Up to 25 initial products uploaded & categorized with variants',
          'Secure payment gateway (Razorpay / Stripe / UPI / Cards)',
          'Automated transactional email receipts & order alerts',
          'Inventory tracking & discount coupon engine',
          'Mobile-first lightning-fast checkout flow',
          '60 days post-launch warranty & 2 revision rounds'
        ],
        ctaText: 'Get E-Commerce Website',
        popular: false
      },
      {
        name: 'Booking Website',
        priceINR: '₹34,999',
        priceUSD: '$890',
        billing: '50% upfront, 50% on completion • 8–12 Days',
        badge: 'Automated Slots',
        desc: 'Live scheduling calendar and deposit checkout that fills appointments without phone tag.',
        features: [
          'Live calendar availability sync (Google / Outlook / Apple Calendar)',
          'Slot duration, buffer times & recurring scheduling rules',
          'Online booking deposit or prepayment support (Razorpay/Stripe)',
          'Automated WhatsApp / Email appointment confirmations',
          'Staff & practitioner service assignment',
          '45 days warranty & 2 revision rounds'
        ],
        ctaText: 'Get Booking Website',
        popular: false
      },
      {
        name: 'Custom Web Application',
        priceINR: 'From ₹59,999',
        priceUSD: 'From $1,500',
        billing: 'Scope-based milestone pricing • 2–4 Weeks',
        badge: 'Enterprise',
        desc: 'Full-stack software engineering for bespoke portals, dashboards, SaaS platforms, and internal systems.',
        features: [
          'Full-scale custom software architecture (React, FastAPI, PostgreSQL)',
          'User authentication, role-based access control & security audit',
          'Complex database modeling & third-party API webhooks',
          'Dedicated squad lead & weekly milestone sprint updates',
          'Automated testing suite & CI/CD deployment pipeline',
          '90 days comprehensive SLA warranty & technical docs'
        ],
        ctaText: 'Request Custom Scope',
        popular: false
      }
    ],
    workflow: [
      { step: '01', title: 'Discovery & Requirements', desc: 'We dissect your brand goals, target audience, and functional specifications.' },
      { step: '02', title: 'Wireframes & Visual Design', desc: 'High-fidelity Figma layouts created for desktop and mobile preview.' },
      { step: '03', title: 'Full-Stack Development', desc: 'Clean, modular engineering with rigorous quality assurance and testing.' },
      { step: '04', title: 'Deployment & Handover', desc: 'Domain connection, live deployment, analytics setup, and admin training.' }
    ],
    faqs: [
      { q: 'How long does a website build take?', a: 'Standard Sorted Start websites launch in 7 to 10 days. Sorted Pro custom builds typically take 2 to 3 weeks depending on feedback speed and custom features.' },
      { q: 'Do I own the source code and domain?', a: 'Yes, 100%. Once project delivery is completed and payment is finalized, full ownership of code, assets, and hosting accounts is transferred to you.' },
      { q: 'Can you redesign our existing website without downtime?', a: 'Absolutely. We develop on our private staging servers and only switch DNS once you have fully reviewed and approved the live preview.' }
    ]
  },

  grow: {
    id: 'grow',
    serviceName: 'Marketing / Growth',
    title: 'GROW',
    subtitle: 'Content, SEO & Revenue Marketing',
    eyebrow: 'PILLAR 02 — REVENUE & ACQUISITION',
    heroDesc: 'Predictable growth engines built around high-impact content, search engine dominance, targeted customer acquisition, and measurable pipeline growth.',
    whoFor: 'B2B companies, service agencies, D2C brands, and local businesses wanting consistent qualified inquiries rather than vanity metrics.',
    whoForProfiles: [
      {
        index: '01',
        title: 'B2B Consultancies, Agencies & Advisors',
        segments: 'Legal, Financial Advisory, Consulting & Tech Services',
        desc: 'Practices requiring continuous high-intent inquiries from corporate decision-makers rather than vanity impressions.',
        signal: 'Erratic pipeline relying entirely on unpredictable word-of-mouth referrals.',
        outcome: 'Predictable monthly inbound inquiries via founder thought-leadership content and search ranking.',
        tag: 'B2B PIPELINE'
      },
      {
        index: '02',
        title: 'Local Multi-Location Businesses & Health Clinics',
        segments: 'Specialists, Aesthetic Clinics, Hospitality & Studios',
        desc: 'Brick-and-mortar operators competing in hyper-local Google Search and Maps catchments.',
        signal: 'Invisible on Google Maps while nearby competitors capture prime search intent.',
        outcome: 'Google Business Profile top-pack dominance, review velocity engine, and direct booking capture.',
        tag: 'MAPS DOMINANCE'
      },
      {
        index: '03',
        title: 'D2C Brands, Retailers & Consumer Products',
        segments: 'E-Commerce Founders, Artisanal Goods & Consumer Apps',
        desc: 'Fast-moving brands needing consistent short-form video hooks, creative ad testing, and conversion funnels.',
        signal: 'Ad fatigue and flat organic reach with zero creative variation.',
        outcome: 'High-volume short-form video engine (8–20 assets/mo) with full scripting, editing, and hook testing.',
        tag: 'CREATIVE VELOCITY'
      }
    ],
    roadblocks: [
      {
        index: '01',
        category: 'PIPELINE PREDICTABILITY',
        problem: 'Inconsistent monthly lead flow relying entirely on unpredictable, sporadic word-of-mouth.',
        resolution: 'Systematic inbound pipeline combining local search dominance with founder authority content.'
      },
      {
        index: '02',
        category: 'MARKETING ATTRIBUTION',
        problem: 'Spending on traditional agency retainers with zero clear attribution to booked calls or closed revenue.',
        resolution: 'End-to-end UTM attribution and CRM tracking matching every lead directly to campaign sources.'
      },
      {
        index: '03',
        category: 'CONTENT & CREATIVE VELOCITY',
        problem: 'Low social engagement and creative ad fatigue with zero consistent, high-grade short-form video content.',
        resolution: 'Dedicated short-form video engine delivering 8–20 scripted, edited, hook-tested assets monthly.'
      },
      {
        index: '04',
        category: 'LOCAL SEARCH VISIBILITY',
        problem: 'Invisible Google search rankings while competitors capture prime local search intent and map packs.',
        resolution: 'Complete Google Business Profile optimization, local schema, and review acceleration engine.'
      }
    ],
    deliverablesPillars: [
      {
        category: 'Short-Form Video & Content Engine',
        code: 'CONTENT-ENGINE',
        icon: 'Zap',
        headline: 'High-Retention Video Production & Scripting',
        summary: 'End-to-end creative production that turns industry expertise into engaging short-form video assets across Reels, Shorts, and LinkedIn.',
        items: [
          {
            title: 'Scriptwriting & Hook Architecture',
            desc: 'Direct-response narrative hooks crafted to capture mobile attention in the first 3 seconds.',
            badge: 'Viral Hooks'
          },
          {
            title: 'Professional Editing & Motion Graphics',
            desc: 'Paced cuts, sound design, on-screen typography, and animated accents optimized for retention.',
            badge: 'Short-Form Reels'
          },
          {
            title: 'Omnichannel Publishing Schedules',
            desc: 'Structured monthly content calendars distributed across Instagram, LinkedIn, YouTube, and TikTok.',
            badge: 'Omnichannel'
          }
        ]
      },
      {
        category: 'Search Engine & Local Maps Dominance',
        code: 'SEO-DOMINANCE',
        icon: 'Search',
        headline: 'Technical SEO & Google Business Profile Domination',
        summary: 'Search optimization designed to capture high-intent inbound searchers at the exact moment they look for your services.',
        items: [
          {
            title: 'Google Business Profile Top-3 Map Pack',
            desc: 'Local category optimization, geotagged photo updates, and structured review generation.',
            badge: 'Top Map Pack'
          },
          {
            title: 'Technical On-Page & Schema Domination',
            desc: 'Local business JSON-LD schema, keyword-focused service pages, and site architecture tuning.',
            badge: 'Schema Markup'
          },
          {
            title: 'Competitor Citation & Rank Tracking',
            desc: 'Local directory syndication, citation cleanup, and bi-weekly keyword rank trajectory reports.',
            badge: 'Rank Tracking'
          }
        ]
      },
      {
        category: 'Paid Acquisition & Pipeline Funnels',
        code: 'PAID-ACQUISITION',
        icon: 'BarChart3',
        headline: 'Targeted Lead Generation & Conversion Funnels',
        summary: 'High-ROI customer acquisition campaigns across Meta and Google Ads paired with CRM lead attribution.',
        items: [
          {
            title: 'High-Intent Meta & Google Ad Sprints',
            desc: 'Direct-response ad creative testing, custom audience segmentation, and budget optimization.',
            badge: 'Paid Ads'
          },
          {
            title: 'Dedicated Landing Page Funnel Sprints',
            desc: 'Fast-loading intake funnels engineered for maximum appointment booking and WhatsApp conversion.',
            badge: 'Conversion Funnel'
          },
          {
            title: 'Real-Time CRM Attribution & Reports',
            desc: 'Granular UTM parameter tracking linking booked calls and customer payments to ad spend.',
            badge: 'ROI Attribution'
          }
        ]
      }
    ],
    problemsSolved: [
      'Inconsistent monthly lead flow relying entirely on unpredictable word-of-mouth',
      'Spending on agency retainers with zero clear attribution to closed revenue',
      'Invisible Google search rankings while competitors capture prime local search intent',
      'Low social engagement and lack of consistent, high-grade short-form video content'
    ],
    offerings: [
      { title: 'Short-Form Video Production', desc: 'Scripting, editing, and publishing engaging Reels, Shorts, and TikToks.' },
      { title: 'Search Engine Optimization (SEO)', desc: 'Technical SEO, keyword domination, and backlink authority building.' },
      { title: 'Google Business Profile Domination', desc: 'Local map pack optimization to capture high-intent inbound searchers.' },
      { title: 'Targeted Lead Generation', desc: 'Paid acquisition campaigns across Meta and Google with conversion tracking.' },
      { title: 'Content & Editorial Strategy', desc: 'Authority-building articles, founder branding, and social distribution.' },
      { title: 'Conversion Funnel Optimization', desc: 'A/B testing, copy refinement, and lead magnet engineering to boost close rates.' }
    ],
    packages: [
      {
        name: 'SORTED PRESENCE',
        priceINR: '₹9,999',
        priceUSD: '$270',
        billing: 'per month',
        badge: 'Foundations',
        desc: 'Establish active brand credibility and local search dominance.',
        features: [
          '8 high-grade branded social posts per month',
          'Google Business Profile optimization & weekly updates',
          'Basic on-page SEO monitoring and keywords check',
          'Monthly performance report & growth review',
          'Direct Slack/WhatsApp comms channel'
        ],
        ctaText: 'Get Sorted Presence',
        popular: false
      },
      {
        name: 'SORTED GROWTH',
        priceINR: '₹19,999',
        priceUSD: '$540',
        billing: 'per month',
        badge: 'Most Popular',
        desc: 'Accelerate inbound pipeline with active content production and search acquisition.',
        features: [
          '16 pieces of content (8 short-form video reels + 8 carousel/graphic posts)',
          'Complete scriptwriting, professional captioning & video editing',
          'Advanced Local SEO & Google Maps optimization',
          'Meta/Google Ad campaign setup & weekly optimization',
          'Conversion tracking & CRM lead routing',
          'Bi-weekly strategy call & comprehensive monthly report'
        ],
        ctaText: 'Get Sorted Growth',
        popular: true
      },
      {
        name: 'SORTED SCALE',
        priceINR: '₹39,999',
        priceUSD: '$990',
        billing: 'per month',
        badge: 'Full Scale',
        desc: 'Full-service omnichannel growth team acting as your dedicated growth department.',
        features: [
          'Omnichannel distribution (Instagram, LinkedIn, YouTube, Google)',
          'Dedicated growth strategist and full production team',
          'High-volume short-form video engine (20+ assets/month)',
          'Custom landing page design & funnel A/B testing',
          'B2B outbound pipeline & lead list enrichment',
          'Weekly strategy calls & real-time revenue dashboard'
        ],
        ctaText: 'Request Scale Strategy',
        popular: false
      }
    ],
    adSpendNote: 'Please note: Advertising spend is paid directly to advertising platforms (Google / Meta) and is billed separately from management retainers.',
    workflow: [
      { step: '01', title: 'Audit & Market Research', desc: 'Deep dive into your current metrics, competitors, and highest-converting customer profiles.' },
      { step: '02', title: 'Strategy & Content Calendar', desc: 'Crafting content pillars, ad creatives, hooks, and monthly publishing schedules.' },
      { step: '03', title: 'Production & Client Approval', desc: 'Professional scripting, editing, and design submitted for your review.' },
      { step: '04', title: 'Publishing & Optimization', desc: 'Scheduled publishing, ad campaign management, and continuous conversion tracking.' }
    ],
    faqs: [
      { q: 'How quickly will we see growth results?', a: 'Content presence and ad campaigns start driving leads within 7 to 14 days of launch. Organic SEO compounding typically shows substantial ranking gains in 60 to 90 days.' },
      { q: 'Do we need to film the videos ourselves?', a: 'You can either provide raw phone clips that we script and edit into viral formats, or our creative team can produce graphic/motion content end-to-end.' },
      { q: 'Are there long-term lock-in contracts?', a: 'No. Our growth packages run on flexible monthly agreements with a 30-day notice period. We earn your business every single month.' }
    ]
  },

  automate: {
    id: 'automate',
    serviceName: 'AI / Automation',
    title: 'AUTOMATE',
    subtitle: 'AI Agents, CRM & Workflow Automation',
    eyebrow: 'PILLAR 03 — INTELLIGENT OPERATIONS',
    heroDesc: 'Eliminate repetitive manual tasks, automate customer follow-ups, connect your software tools, and deploy custom AI agents that work 24/7.',
    whoFor: 'Busy founders, sales teams, and operations managers spending hours on manual data entry, slow lead follow-ups, and disconnected tools.',
    whoForProfiles: [
      {
        index: '01',
        title: 'High-Volume Sales & Inbound Intake Teams',
        segments: 'Real Estate, Professional Coaching, Advisory & Financial Services',
        desc: 'Sales squads receiving inbound leads across WhatsApp, web forms, and Meta ads around the clock.',
        signal: 'Leads sitting unanswered for 2+ hours; prospects buying from faster competitors.',
        outcome: '24/7 instant WhatsApp/Email AI qualification bot and auto-routed CRM pipelines.',
        tag: 'INSTANT RESPONSE'
      },
      {
        index: '02',
        title: 'Operations Managers & Logistics Squads',
        segments: 'Contracting, Wholesale Distribution, Service Agencies & Delivery',
        desc: 'Teams spending hours manually copy-pasting customer records between forms, Google Sheets, and CRMs.',
        signal: 'Repetitive administrative drag causing human errors and forgotten invoice reminders.',
        outcome: 'Self-healing cross-tool API webhooks eliminating manual data entry and human transcription errors.',
        tag: 'ZERO COPY-PASTE'
      },
      {
        index: '03',
        title: 'Founders Scaling Beyond 5 to 20 Team Members',
        segments: 'Bootstrapped Operators, Creative Studios & Fast-Growing Agencies',
        desc: 'Leadership bogged down answering repetitive support questions and chasing overdue invoice status updates.',
        signal: 'Founder acting as the bottleneck for internal queries and client status reports.',
        outcome: 'Autonomous knowledge-base AI agents and Slack/WhatsApp internal command bots.',
        tag: 'FOUNDER AUTONOMY'
      }
    ],
    roadblocks: [
      {
        index: '01',
        category: 'SPEED TO LEAD',
        problem: 'Leads sitting unanswered for hours, causing hot prospects to buy from faster competitors.',
        resolution: 'Under-60-second automated response on WhatsApp and Email that pre-qualifies and books calls 24/7.'
      },
      {
        index: '02',
        category: 'MANUAL DATA DRAG',
        problem: 'Hours lost daily copy-pasting data between lead forms, spreadsheets, and disconnected CRMs.',
        resolution: 'Self-healing API webhooks and data pipelines synchronizing your software tools with zero manual touch.'
      },
      {
        index: '03',
        category: 'FOLLOW-UPS & CASHFLOW',
        problem: 'Missed client follow-ups, forgotten appointment confirmations, and delayed invoice reminders.',
        resolution: 'Automated 2-way calendar scheduling and automated payment reminder sequences with checkout links.'
      },
      {
        index: '04',
        category: 'SUPPORT OVERHEAD',
        problem: 'Customer support teams overwhelmed answering identical, repetitive customer policy inquiries.',
        resolution: 'Guardrailed AI agent trained on your internal documentation that resolves routine questions with zero hallucinations.'
      }
    ],
    deliverablesPillars: [
      {
        category: 'Instant AI Responders & Chatbots',
        code: 'AI-RESPONDER',
        icon: 'Bot',
        headline: '24/7 WhatsApp & Email AI Conversational Agents',
        summary: 'Autonomous conversational agents that instantly greet, qualify, answer questions, and book calendar appointments across WhatsApp and Email.',
        items: [
          {
            title: 'WhatsApp Business API AI Agent',
            desc: 'Interactive chat agent trained on your knowledge base to qualify inbound prospects and collect lead requirements.',
            badge: 'WhatsApp Bot'
          },
          {
            title: '2-Way Calendar Booking Integration',
            desc: 'Instant slot matching with Google Calendar or Outlook, timezone adjustments, and automated reminder notifications.',
            badge: 'Calendar Sync'
          },
          {
            title: 'Deterministic Knowledge Guardrails',
            desc: 'Strict knowledge-base scoping ensuring the AI only provides verified company answers, escalating complex cases to humans.',
            badge: 'Zero Hallucinations'
          }
        ]
      },
      {
        category: 'CRM & Pipeline Auto-Routing',
        code: 'PIPELINE-SYNC',
        icon: 'Layers',
        headline: 'End-to-End CRM & Cross-Tool Synchronization',
        summary: 'Eliminate duplicate data entry by bridging WhatsApp, HubSpot, Zoho, Google Sheets, Airtable, and PostgreSQL in real time.',
        items: [
          {
            title: 'Automated Lead Qualification & Stage Assignment',
            desc: 'Automatically assess deal size, assign leads to the right salesperson, and update CRM pipeline stages instantly.',
            badge: 'Auto-Routing'
          },
          {
            title: 'Internal Team Alert Bots',
            desc: 'Instant WhatsApp and Slack notifications triggered when VIP prospects submit forms or close milestone agreements.',
            badge: 'Team Alerts'
          },
          {
            title: 'Self-Healing Webhook Error Monitoring',
            desc: 'Automated retries, fallback notification queues, and error alerting to ensure zero leads are ever dropped.',
            badge: 'Error Logging'
          }
        ]
      },
      {
        category: 'Document & Operational Workflows',
        code: 'DOC-WORKFLOW',
        icon: 'ShieldCheck',
        headline: 'Automated Invoicing, Contracts & Document Processing',
        summary: 'Streamline operational back-office tasks including PDF invoice creation, payment status tracking, and contract handoffs.',
        items: [
          {
            title: 'Automated Invoice & Receipt Generation',
            desc: 'Trigger professional PDF invoices and automated payment follow-up reminders upon milestone sign-offs.',
            badge: 'Invoice Engine'
          },
          {
            title: 'Document Data Extraction & Parsing',
            desc: 'Extract key fields from receipts, invoices, and contracts directly into your financial database.',
            badge: 'Data Extraction'
          },
          {
            title: 'Staff Training & Video Documentation',
            desc: 'Custom Loom video tutorials and a simple control console so non-technical team members can manage workflows.',
            badge: 'Team Handover'
          }
        ]
      }
    ],
    problemsSolved: [
      'Leads sitting unanswered for hours, causing prospects to buy from faster competitors',
      'Hours lost daily copy-pasting data between forms, spreadsheets, and CRMs',
      'Missed client follow-ups and forgotten renewal/invoice reminders',
      'Support teams overwhelmed by identical, repetitive customer inquiries'
    ],
    offerings: [
      { title: 'Instant WhatsApp & Email AI Responders', desc: 'Engage, qualify, and book leads in seconds 24/7 across chat channels.' },
      { title: 'CRM & Lead Pipeline Automation', desc: 'Auto-route leads, update stages, and notify your sales team instantly.' },
      { title: 'Document & Invoice Processing', desc: 'Extract data from PDFs, receipts, and contracts into databases automatically.' },
      { title: 'Calendar & Meeting Coordination', desc: 'Eliminate back-and-forth scheduling with automated qualification and booking.' },
      { title: 'Internal Operations Bots', desc: 'Slack and WhatsApp bots that query internal databases and trigger actions.' },
      { title: 'Custom LLM & API Integrations', desc: 'Connect OpenAI, Anthropic, or proprietary models to your proprietary business logic.' }
    ],
    packages: [
      {
        name: 'SORTED AUTOMATE',
        priceINR: '₹24,999',
        priceUSD: '$650',
        billing: 'one-time setup',
        badge: 'Starter Workflows',
        desc: 'Automate your primary lead intake, notifications, and customer response pipeline.',
        features: [
          'Up to 3 core automated workflow integrations',
          'Instant WhatsApp / Email lead responder with qualification',
          'CRM integration (Auto-sync leads, assign leads, trigger alerts)',
          'Automated appointment booking & calendar reminders',
          'Full error monitoring and testing',
          '30 days post-setup support'
        ],
        ctaText: 'Get Sorted Automate',
        popular: false
      },
      {
        name: 'AUTOMATE PRO',
        priceINR: '₹49,999',
        priceUSD: '$1,350',
        billing: 'one-time setup',
        badge: 'Most Popular',
        desc: 'Comprehensive business automation with intelligent AI agents and multi-tool sync.',
        features: [
          'Up to 8 complex multi-step workflows',
          'Custom AI Agent trained on your company knowledge base',
          'Automated invoice generation & payment follow-up engine',
          'Data synchronization across CRM, Google Sheets, & databases',
          'Webhook integrations & custom API endpoints',
          'Team training session & video documentation',
          '60 days priority optimization support'
        ],
        ctaText: 'Get Automate Pro',
        popular: true
      },
      {
        name: 'AUTOMATE CUSTOM',
        priceINR: 'From ₹79,999',
        priceUSD: 'From $2,000',
        billing: 'Scope-based architecture',
        badge: 'Enterprise',
        desc: 'Bespoke AI pipelines, custom ERP integrations, and autonomous operational systems.',
        features: [
          'Unlimited workflow integrations across complex tech stacks',
          'Proprietary AI model fine-tuning & secure document processing',
          'Legacy system integration & database automation',
          'Dedicated automation engineer & priority SLA support',
          'Enterprise security & compliance review'
        ],
        ctaText: 'Request Custom Automation',
        popular: false
      }
    ],
    supportAddon: 'Optional ongoing automation maintenance and optimization available from ₹4,999 ($130)/month.',
    workflow: [
      { step: '01', title: 'Process Mapping', desc: 'We analyze your team workflows and map out bottlenecks and manual friction points.' },
      { step: '02', title: 'Architecture & Security', desc: 'Designing secure API pipelines without storing credentials in plaintext.' },
      { step: '03', title: 'Development & Sandbox Testing', desc: 'Building and rigorously stress-testing automations with live edge cases.' },
      { step: '04', title: 'Deployment & Monitoring', desc: 'Live deployment with automated error alerting, fail-safes, and staff training.' }
    ],
    faqs: [
      { q: 'Will AI give incorrect answers to our clients?', a: 'No. We configure deterministic guardrails and strict knowledge base constraints so the AI only answers what it is authorized to answer, escalating complex queries to humans.' },
      { q: 'What tools can you integrate?', a: 'We integrate with virtually all modern tools including WhatsApp Business API, Gmail, Google Workspace, HubSpot, Zoho, Notion, Stripe, Airtable, PostgreSQL, and custom REST APIs.' },
      { q: 'Do we need technical staff to maintain this?', a: 'Not at all. We build self-healing automations with clear error logs and provide simple dashboards so anyone on your team can manage them.' }
    ]
  },

  hire: {
    id: 'hire',
    serviceName: 'Hiring',
    title: 'HIRE',
    subtitle: 'AI-Powered Recruitment & Sourcing',
    eyebrow: 'PILLAR 04 — TALENT OPERATIONS',
    heroDesc: 'Source, screen, and secure top-tier talent in record time. Powered by HireSense AI to shortlist only qualified candidates who match your exact technical and cultural bar.',
    whoFor: 'Fast-growing startups, agencies, and enterprises needing engineers, growth leads, marketers, and operations staff without endless recruiter back-and-forth.',
    whoForProfiles: [
      {
        index: '01',
        title: 'High-Growth Tech Startups & Engineering Squads',
        segments: 'Seed & Series A Startups, Boutique Engineering Studios',
        desc: 'Founders needing reliable Full-Stack Engineers, Product Designers, and Tech Leads without recruiter delay.',
        signal: 'Sifting through 300+ spam resumes; engineers failing simple technical assessments.',
        outcome: 'Top 3–5 pre-screened, code-benchmarked candidates delivered in 7–10 days with HireSense AI.',
        tag: 'ENGINEERING TALENT'
      },
      {
        index: '02',
        title: 'Performance Marketing & Creative Agencies',
        segments: 'Growth Agencies, Production Houses & Media Collectives',
        desc: 'Fast-expanding agencies that need immediate account managers, media buyers, and video editors.',
        signal: 'Traditional recruitment firms charging exorbitant 20% retainers with zero retention guarantee.',
        outcome: 'Pay-on-success placement model backed by a 90-day free candidate replacement guarantee.',
        tag: 'ZERO UPFRONT RISK'
      },
      {
        index: '03',
        title: 'Enterprises Scaling Multiple Teams Concurrently',
        segments: 'Mid-Market Operators & Expanding Department Heads',
        desc: 'Organizations needing an embedded talent partner to handle end-to-end sourcing, ATS setup, and pipeline.',
        signal: 'Hiring managers spending 15+ hours weekly coordinating interviews and screening calls.',
        outcome: 'Dedicated embedded recruiter running ATS pipeline, scorecarding, and offer closing.',
        tag: 'EMBEDDED PARTNER'
      }
    ],
    roadblocks: [
      {
        index: '01',
        category: 'SCREENING EFFICIENCY',
        problem: 'Sorting through hundreds of unqualified resumes wasting dozens of hiring manager hours.',
        resolution: 'HireSense AI screening algorithm evaluating code samples, portfolio benchmarks, and technical fit.'
      },
      {
        index: '02',
        category: 'RECRUITER RISK',
        problem: 'Traditional recruiters sending spam candidates with high upfront fees and zero performance risk.',
        resolution: 'Pay-on-success recruitment model: zero upfront fee; you pay only upon a verified, successful hire.'
      },
      {
        index: '03',
        category: 'INTERVIEW VELOCITY',
        problem: 'Slow interview cycles causing top candidates to drop out and accept competing offers.',
        resolution: 'Curated shortlist of top 3–5 interview-ready candidates delivered within 5–7 business days.'
      },
      {
        index: '04',
        category: 'RETENTION ASSURANCE',
        problem: 'Bad hires leaving within weeks, leaving the role vacant and agency recruitment fees lost.',
        resolution: '90-day comprehensive candidate replacement guarantee with immediate re-sourcing at zero additional cost.'
      }
    ],
    deliverablesPillars: [
      {
        category: 'HireSense AI Sourcing & Benchmarking',
        code: 'HIRESENSE-AI',
        icon: 'Users',
        headline: 'AI-Powered Sourcing & Technical Benchmarking',
        summary: 'Proprietary sourcing algorithms scouring active and passive candidate networks across GitHub, LinkedIn, and specialized talent communities.',
        items: [
          {
            title: 'Role Scorecards & Technical Profiling',
            desc: 'Collaborative role scorecard definition establishing exact technical, stack, and cultural expectations.',
            badge: 'Role Scorecard'
          },
          {
            title: 'Automated Portfolio & Code Screening',
            desc: 'HireSense AI scans verified work history, past project repositories, and technical benchmarks.',
            badge: 'Code Benchmark'
          },
          {
            title: 'Technical Screening & Work Sample Evaluation',
            desc: 'Screening calls conducted by experienced engineers before presenting candidates to your hiring team.',
            badge: 'Tech Screened'
          }
        ]
      },
      {
        category: 'Curated Shortlists & Interview Logistics',
        code: 'SHORTLIST-OPS',
        icon: 'FileCheck',
        headline: 'Fast-Track Shortlists & Frictionless Interview Loops',
        summary: 'Receive only the top 3–5 pre-vetted, interview-ready candidates within 5 to 7 business days, with calendar scheduling managed end-to-end.',
        items: [
          {
            title: 'Comprehensive Candidate Dossiers',
            desc: 'Receive deep candidate profiles including screening notes, compensation expectations, and notice periods.',
            badge: 'Vetted Dossier'
          },
          {
            title: 'Automated Interview Scheduling',
            desc: 'Frictionless calendar slot coordination eliminating back-and-forth email scheduling with candidates.',
            badge: 'Calendar Booking'
          },
          {
            title: 'Compensation Benchmarking & Offer Closing',
            desc: 'Market salary data and offer structuring guidance to ensure offer acceptance rates exceed 90%.',
            badge: 'Offer Advisory'
          }
        ]
      },
      {
        category: 'Accountability & Replacement Protection',
        code: 'TALENT-SLA',
        icon: 'ShieldCheck',
        headline: 'Pay-on-Success Model & 90-Day Placement Guarantee',
        summary: 'We eliminate recruitment risk entirely. You pay only upon a successful hire, protected by our 90-day replacement warranty.',
        items: [
          {
            title: 'Pay Only Upon Verified Hire',
            desc: 'Zero upfront retainers or listing fees. Commercial invoices are issued only after candidate contract signing.',
            badge: 'Zero Upfront Risk'
          },
          {
            title: '90-Day Free Candidate Replacement',
            desc: 'If a placed candidate leaves or is deemed an unfit match within 90 days, we source a replacement immediately at no charge.',
            badge: '90-Day Warranty'
          },
          {
            title: 'Dedicated Talent Squad Lead',
            desc: 'Single point of contact managing pipeline velocity, feedback collection, and candidate debriefs.',
            badge: 'Dedicated Lead'
          }
        ]
      }
    ],
    problemsSolved: [
      'Sorting through hundreds of unqualified resumes wasting dozens of hiring manager hours',
      'Traditional recruiters sending spam candidates without technical understanding',
      'Slow interview cycles causing top candidates to accept competing offers',
      'High recruitment fees with zero guarantee on candidate retention'
    ],
    offerings: [
      { title: 'AI-Assisted Candidate Sourcing', desc: 'Proprietary sourcing algorithms scouring LinkedIn, GitHub, and talent networks.' },
      { title: 'HireSense AI Screening', desc: 'Automated skill benchmarking, background validation, and technical fit ranking.' },
      { title: 'Curated Candidate Shortlists', desc: 'Receive only the top 3-5 pre-vetted, interview-ready candidates.' },
      { title: 'Interview Scheduling & Coordination', desc: 'Frictionless calendar scheduling and candidate briefing before calls.' },
      { title: 'Offer & Compensation Advisory', desc: 'Market salary benchmarking and offer negotiation to ensure high acceptance rates.' },
      { title: 'Replacement Guarantee', desc: '90-day candidate placement protection for complete peace of mind.' }
    ],
    packages: [
      {
        name: 'SORTED PLACEMENT',
        priceINR: 'Pay on Success',
        priceUSD: 'Pay on Success',
        billing: 'Pay only upon successful hire',
        badge: 'Pay on Success',
        desc: 'Ideal for critical individual hires where you want zero upfront risk.',
        features: [
          'Full job specification & role scorecard creation',
          'HireSense AI sourcing & candidate ranking',
          'Technical screening & candidate interview summaries',
          'Top 3-5 candidates delivered in 7 to 10 days',
          'Interview coordination & offer management',
          '90-day free candidate replacement guarantee'
        ],
        ctaText: 'Hire With Sorted',
        popular: true
      },
      {
        name: 'EMBEDDED TALENT PARTNER',
        priceINR: '₹29,999',
        priceUSD: '$750',
        billing: 'per month',
        badge: 'High-Volume',
        desc: 'For companies scaling teams and making 3+ hires across engineering, sales, and operations.',
        features: [
          'Dedicated recruitment lead embedded in your team',
          'Unlimited role sourcing and pipeline management',
          'Custom ATS setup and applicant tracking automation',
          'Significant savings compared to per-placement agency fees',
          'Employer branding & candidate experience optimization',
          'Weekly pipeline reviews and hiring velocity analytics'
        ],
        ctaText: 'Partner With Sorted',
        popular: false
      }
    ],
    techNote: 'Powered by HireSense AI — our proprietary screening engine evaluating candidate portfolio history, coding/work benchmarks, and cultural alignment.',
    workflow: [
      { step: '01', title: 'Role Scorecard & Requirements', desc: 'We define the must-have capabilities, compensation bands, and cultural expectations.' },
      { step: '02', title: 'AI Sourcing & Screening', desc: 'HireSense AI scans thousands of active and passive profiles to build a vetted talent pool.' },
      { step: '03', title: 'Curated Shortlist Delivery', desc: 'You receive detailed candidate profiles with screening notes and interview recordings.' },
      { step: '04', title: 'Interviews & Offer Closing', desc: 'We coordinate interview rounds, collect candidate feedback, and help close the offer.' }
    ],
    faqs: [
      { q: 'What roles does The Sorted Club hire for?', a: 'We specialize in Full-Stack Engineers, Product Designers, Growth Marketers, Sales Executives, Operations Leads, and Technical Project Managers.' },
      { q: 'How fast do we receive candidates?', a: 'You will receive your first batch of vetted, qualified candidates within 5 to 7 business days of opening the role.' },
      { q: 'What if a candidate leaves within 3 months?', a: 'Every placement is covered by our 90-day free replacement guarantee. If a candidate leaves or is not a fit, we source a replacement immediately at zero additional fee.' }
    ]
  }
};

export default function ServicesPages({
  currentPath = '/services',
  onNavigate = () => {},
  onOpenInquiry = () => {},
  onBackToSite = () => {}
}) {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [currency, setCurrency] = useState('INR'); // 'INR' or 'USD'
  const isMobile = useIsMobile(768);
  const packageContainerRef = React.useRef(null);
  const packageCardRefs = React.useRef({});

  // Determine active pillar view
  const subroute = currentPath.replace('/services', '').replace(/^\//, '').toLowerCase();
  const activePillarKey = ['build', 'grow', 'automate', 'hire'].includes(subroute) ? subroute : null;
  const pillarData = activePillarKey ? SERVICES_DATA[activePillarKey] : null;

  const { activeDotIndex, scrollToIndex } = useCarouselPagination(
    packageContainerRef,
    pillarData?.packages?.length || 0
  );

  useEffect(() => {
    scrollToIndex(0);
  }, [activePillarKey, scrollToIndex]);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  return (
    <div className="services-page-root">
      {/* Public Header / Navbar */}
      <PublicNavbar
        onNavigate={onNavigate}
        onOpenInquiry={onOpenInquiry}
        currentPath={currentPath}
      >
        {({ closeMenu }) => (
          <>
            <motion.button
              type="button"
              className={`nav-sublink ${!activePillarKey ? 'active' : ''}`}
              onClick={() => {
                closeMenu();
                onNavigate('/services');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              All Services
            </motion.button>
            <motion.button
              type="button"
              className={`nav-sublink ${activePillarKey === 'build' ? 'active' : ''}`}
              onClick={() => {
                closeMenu();
                onNavigate('/services/build');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Build
            </motion.button>
            <motion.button
              type="button"
              className={`nav-sublink ${activePillarKey === 'grow' ? 'active' : ''}`}
              onClick={() => {
                closeMenu();
                onNavigate('/services/grow');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Grow
            </motion.button>
            <motion.button
              type="button"
              className={`nav-sublink ${activePillarKey === 'automate' ? 'active' : ''}`}
              onClick={() => {
                closeMenu();
                onNavigate('/services/automate');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Automate
            </motion.button>
            <motion.button
              type="button"
              className={`nav-sublink ${activePillarKey === 'hire' ? 'active' : ''}`}
              onClick={() => {
                closeMenu();
                onNavigate('/services/hire');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Hire
            </motion.button>
            <motion.button
              type="button"
              className="nav-sublink"
              onClick={() => {
                closeMenu();
                onNavigate('/templates');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Templates &amp; Portfolio
            </motion.button>
            <motion.button
              type="button"
              className="nav-sublink"
              onClick={() => {
                closeMenu();
                onNavigate('/pricing');
              }}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
            >
              Pricing
            </motion.button>
            <motion.button
              type="button"
              className="navcta"
              onClick={() => {
                closeMenu();
                onOpenInquiry(pillarData ? pillarData.serviceName : undefined);
              }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
            >
              Get in Touch <ArrowRight size={16} />
            </motion.button>
          </>
        )}
      </PublicNavbar>

      {/* =====================================================================
          VIEW A: ALL SERVICES OVERVIEW (/services)
      ===================================================================== */}
      {!pillarData ? (
        <main className="services-overview-main">
          {/* Hero */}
          <motion.section
            className="hero"
            style={{ padding: '80px 20px 60px' }}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              className="hero-orbit orbit-one"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
            />
            <motion.div className="eyebrow" variants={fadeInUp}>
              FOUR CORE PILLARS — ONE OPERATING SYSTEM
              <span className="live-dot" />
            </motion.div>
            <motion.h1 variants={fadeInUp}>
              Everything your business needs.<br />
              <em>Sorted end-to-end.</em>
            </motion.h1>
            <motion.p className="hero-copy" style={{ maxWidth: '640px' }} variants={fadeInUp}>
              We partner with ambitious companies to build high-performance digital products, accelerate revenue growth, automate repetitive operations, and secure top-tier talent.
            </motion.p>
            <motion.div className="actions" variants={fadeInUp}>
              <motion.button
                className="primary"
                onClick={() => onOpenInquiry()}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
              >
                Get Sorted Today <ArrowRight size={18} />
              </motion.button>
              <motion.button
                className="secondary"
                onClick={() => onNavigate('/')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft size={16} /> Back to Home
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Pillars Detailed Grid */}
          <motion.section
            className="services-grid-section"
            style={{ maxWidth: '1240px', margin: '0 auto 80px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <div className="services-overview-pillars-grid">
              {/* Pillar 1: BUILD */}
              <motion.div
                className="service-pillar-box"
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.08)' }}
                transition={TRANSITIONS.cardSpring}
                data-cursor="explore"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="empty-icon-box" style={{ width: '48px', height: '48px', margin: 0 }}>
                    <Code2 size={24} color="var(--ink)" />
                  </div>
                  <span className="client-code-tag" style={{ font: '700 11px monospace' }}>PILLAR 01</span>
                </div>
                <h3 style={{ font: '700 24px "Space Grotesk"', margin: '0 0 8px' }}>BUILD</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, minHeight: '60px' }}>
                  Websites, e-commerce, custom web apps and internal software built for speed, conversion, and scalability.
                </p>
                <div className="pillar-price-tag">
                  From <strong>₹14,999</strong>
                </div>
                <ul className="pillar-feature-list">
                  <li><Check size={14} color="#15803d" /> Business Websites & Landing Pages</li>
                  <li><Check size={14} color="#15803d" /> E-Commerce & Custom Software</li>
                  <li><Check size={14} color="#15803d" /> Admin Portals & API Webhooks</li>
                </ul>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="primary"
                    style={{ flex: 1, height: '38px', fontSize: '12px' }}
                    onClick={() => onNavigate('/services/build')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Packages <ArrowRight size={13} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Pillar 2: GROW */}
              <motion.div
                className="service-pillar-box"
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.08)' }}
                transition={TRANSITIONS.cardSpring}
                data-cursor="explore"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="empty-icon-box" style={{ width: '48px', height: '48px', margin: 0 }}>
                    <BriefcaseBusiness size={24} color="var(--ink)" />
                  </div>
                  <span className="client-code-tag" style={{ font: '700 11px monospace' }}>PILLAR 02</span>
                </div>
                <h3 style={{ font: '700 24px "Space Grotesk"', margin: '0 0 8px' }}>GROW</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, minHeight: '60px' }}>
                  Short-form content engines, SEO ranking, Google Business maps domination, and high-ROI lead generation.
                </p>
                <div className="pillar-price-tag">
                  From <strong>₹9,999</strong><small>/mo</small>
                </div>
                <ul className="pillar-feature-list">
                  <li><Check size={14} color="#15803d" /> Short-form Reels & Video Content</li>
                  <li><Check size={14} color="#15803d" /> Google Maps & Technical SEO</li>
                  <li><Check size={14} color="#15803d" /> Targeted Lead Generation Campaigns</li>
                </ul>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="primary"
                    style={{ flex: 1, height: '38px', fontSize: '12px' }}
                    onClick={() => onNavigate('/services/grow')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Packages <ArrowRight size={13} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Pillar 3: AUTOMATE */}
              <motion.div
                className="service-pillar-box"
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.08)' }}
                transition={TRANSITIONS.cardSpring}
                data-cursor="explore"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="empty-icon-box" style={{ width: '48px', height: '48px', margin: 0 }}>
                    <Bot size={24} color="var(--ink)" />
                  </div>
                  <span className="client-code-tag" style={{ font: '700 11px monospace' }}>PILLAR 03</span>
                </div>
                <h3 style={{ font: '700 24px "Space Grotesk"', margin: '0 0 8px' }}>AUTOMATE</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, minHeight: '60px' }}>
                  Custom AI assistants, WhatsApp automated responders, CRM synchronization, and frictionless business workflows.
                </p>
                <div className="pillar-price-tag">
                  From <strong>₹24,999</strong> <small>setup</small>
                </div>
                <ul className="pillar-feature-list">
                  <li><Check size={14} color="#15803d" /> 24/7 AI WhatsApp & Email Responders</li>
                  <li><Check size={14} color="#15803d" /> CRM & Pipeline Auto-Routing</li>
                  <li><Check size={14} color="#15803d" /> Document & Invoice Automation</li>
                </ul>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="primary"
                    style={{ flex: 1, height: '38px', fontSize: '12px' }}
                    onClick={() => onNavigate('/services/automate')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View Packages <ArrowRight size={13} />
                  </motion.button>
                </div>
              </motion.div>

              {/* Pillar 4: HIRE */}
              <motion.div
                className="service-pillar-box"
                variants={fadeInUp}
                whileHover={{ y: -6, boxShadow: '0 16px 36px rgba(0,0,0,0.08)' }}
                transition={TRANSITIONS.cardSpring}
                data-cursor="explore"
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div className="empty-icon-box" style={{ width: '48px', height: '48px', margin: 0 }}>
                    <Users size={24} color="var(--ink)" />
                  </div>
                  <span className="client-code-tag" style={{ font: '700 11px monospace' }}>PILLAR 04</span>
                </div>
                <h3 style={{ font: '700 24px "Space Grotesk"', margin: '0 0 8px' }}>HIRE</h3>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5, minHeight: '60px' }}>
                  AI-assisted candidate screening, technical scoring, and curated shortlists powered by HireSense AI.
                </p>
                <div className="pillar-price-tag">
                  <strong>Success-Based</strong> <small>Pay on hire</small>
                </div>
                <ul className="pillar-feature-list">
                  <li><Check size={14} color="#15803d" /> HireSense AI Candidate Ranking</li>
                  <li><Check size={14} color="#15803d" /> Top 3-5 Pre-Vetted Shortlists</li>
                  <li><Check size={14} color="#15803d" /> 90-Day Free Replacement Guarantee</li>
                </ul>
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <motion.button
                    type="button"
                    className="primary"
                    style={{ flex: 1, height: '38px', fontSize: '12px' }}
                    onClick={() => onNavigate('/services/hire')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Explore Hiring <ArrowRight size={13} />
                  </motion.button>
                </div>
              </motion.div>
            </div>
          </motion.section>
        </main>
      ) : (
        /* =====================================================================
            VIEW B: INDIVIDUAL PILLAR PAGE (/services/build, /grow, etc.)
        ===================================================================== */
        <main className="pillar-detail-main">
          {/* Pillar Hero */}
          <motion.section
            className="hero"
            style={{ padding: '70px 20px 50px' }}
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div
              className="hero-orbit orbit-one"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 60, ease: 'linear' }}
            />
            <motion.div className="eyebrow" variants={fadeInUp}>
              {pillarData.eyebrow}
              <span className="live-dot" />
            </motion.div>
            <motion.h1 style={{ fontSize: 'clamp(36px, 6vw, 68px)' }} variants={fadeInUp}>
              {pillarData.title}.<br />
              <em>{pillarData.subtitle}</em>
            </motion.h1>
            <motion.p className="hero-copy" style={{ maxWidth: '680px' }} variants={fadeInUp}>
              {pillarData.heroDesc}
            </motion.p>
            <motion.div className="actions" variants={fadeInUp}>
              <motion.button
                className="primary"
                onClick={() => onOpenInquiry(pillarData.serviceName)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
              >
                Get Started with {pillarData.title} <ArrowRight size={18} />
              </motion.button>
              <motion.button
                className="secondary"
                onClick={() => onNavigate('/services')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <ArrowLeft size={16} /> All Services
              </motion.button>
            </motion.div>
          </motion.section>

          {/* Section: Who This Is For (Editorial Audience System) */}
          <motion.section
            className="service-audience-section"
            style={{ maxWidth: '1160px', margin: '0 auto 80px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ marginBottom: '32px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Target size={14} color="var(--ink)" />
                AUDIENCE PROFILE MAPPING • PILLAR {pillarData.id.toUpperCase()}
              </div>
              <h2 style={{ font: '700 clamp(26px, 4vw, 36px) "Space Grotesk"', margin: '0 0 10px', color: 'var(--ink)' }}>
                Engineered for businesses where credibility &amp; conversion matter.
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '680px', margin: 0, lineHeight: 1.55 }}>
                We do not build generic templates for everyone. We design high-conviction digital systems tailored to distinct operational profiles and conversion requirements.
              </p>
            </motion.div>

            <div className="service-audience-grid">
              {(pillarData.whoForProfiles || []).map((prof, idx) => (
                <motion.div
                  key={idx}
                  className="audience-profile-card"
                  variants={fadeInUp}
                  whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(16, 16, 15, 0.08)' }}
                  transition={TRANSITIONS.cardSpring}
                >
                  <div className="audience-card-top">
                    <span className="audience-index-badge">PROFILE [{prof.index}]</span>
                    <span className="audience-category-tag">{prof.tag}</span>
                  </div>

                  <h3 className="audience-title">{prof.title}</h3>
                  <div className="audience-segments-pill">{prof.segments}</div>
                  <p className="audience-desc">{prof.desc}</p>

                  <div className="audience-callout-block signal">
                    <div className="callout-label">
                      <span className="callout-dot warning" /> IDENTIFYING SIGNAL
                    </div>
                    <div className="callout-text">{prof.signal}</div>
                  </div>

                  <div className="audience-callout-block outcome">
                    <div className="callout-label">
                      <span className="callout-dot success" /> TARGETED OUTCOME
                    </div>
                    <div className="callout-text">{prof.outcome}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section: Common Roadblocks We Eliminate (Problem-to-Resolution System) */}
          <motion.section
            className="service-roadblocks-section"
            style={{ maxWidth: '1160px', margin: '0 auto 85px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ marginBottom: '32px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={14} color="var(--ink)" />
                FRICTION DIAGNOSTICS &amp; SYSTEM RESOLUTION
              </div>
              <h2 style={{ font: '700 clamp(26px, 4vw, 36px) "Space Grotesk"', margin: '0 0 10px', color: 'var(--ink)' }}>
                Common roadblocks we eliminate in {pillarData.title}.
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '680px', margin: 0, lineHeight: 1.55 }}>
                Sluggish performance, missing lead triggers, and vendor hostage traps cost revenue daily. Here is how our architecture replaces industry friction with tangible outcomes.
              </p>
            </motion.div>

            <div className="service-roadblocks-grid">
              {(pillarData.roadblocks || []).map((road, idx) => (
                <motion.div
                  key={idx}
                  className="roadblock-resolution-card"
                  variants={fadeInUp}
                  whileHover={{ y: -3, boxShadow: '0 14px 32px rgba(16, 16, 15, 0.08)' }}
                  transition={TRANSITIONS.cardSpring}
                >
                  <div className="roadblock-card-header">
                    <span className="roadblock-tag">DIAGNOSTIC [{road.index}]</span>
                    <span className="roadblock-category">{road.category}</span>
                  </div>

                  <div className="roadblock-problem-pane">
                    <div className="roadblock-pane-label problem">
                      <span className="roadblock-marker-x">✕</span> COMMON ROADBLOCK
                    </div>
                    <p className="roadblock-problem-text">{road.problem}</p>
                  </div>

                  <div className="roadblock-divider">
                    <span className="roadblock-arrow">↓</span>
                  </div>

                  <div className="roadblock-resolution-pane">
                    <div className="roadblock-pane-label resolution">
                      <span className="roadblock-marker-check">✓</span> THE SORTED RESOLUTION
                    </div>
                    <p className="roadblock-resolution-text">{road.resolution}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section: What We Deliver (Editorial Delivery System) */}
          <motion.section
            className="service-deliverables-section"
            style={{ maxWidth: '1160px', margin: '0 auto 85px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ textAlign: 'center', marginBottom: '36px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Layers size={14} color="var(--ink)" />
                CAPABILITIES &amp; DELIVERABLES ARCHITECTURE
              </div>
              <h2 style={{ font: '700 clamp(26px, 4vw, 36px) "Space Grotesk"', margin: '4px 0 10px' }}>
                What We Deliver in {pillarData.title}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '15px', maxWidth: '640px', margin: '0 auto', lineHeight: 1.55 }}>
                Engineered deliverables with rigorous technical standards, zero bloat, and full intellectual property ownership.
              </p>
            </motion.div>

            {pillarData.deliverablesPillars && pillarData.deliverablesPillars.length > 0 ? (
              <div className="service-deliverables-editorial">
                {pillarData.deliverablesPillars.map((col, cIdx) => (
                  <motion.div
                    key={cIdx}
                    className="deliverable-pillar-col"
                    variants={fadeInUp}
                    whileHover={{ y: -4, boxShadow: '0 16px 36px rgba(16, 16, 15, 0.07)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <div className="deliverable-pillar-header">
                      <span className="deliverable-pillar-code">[{col.code}]</span>
                      <h3 className="deliverable-pillar-headline">{col.category}</h3>
                      <p className="deliverable-pillar-summary">{col.summary}</p>
                    </div>

                    <div className="deliverable-items-list">
                      {col.items.map((item, iIdx) => (
                        <div key={iIdx} className="deliverable-item-card">
                          <div className="deliverable-item-top">
                            <h4 className="deliverable-item-title">{item.title}</h4>
                            <span className="deliverable-item-badge">{item.badge}</span>
                          </div>
                          <p className="deliverable-item-desc">{item.desc}</p>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {pillarData.offerings.map((off, idx) => (
                  <motion.div
                    key={idx}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '22px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    variants={fadeInUp}
                    whileHover={{ y: -4, boxShadow: '0 10px 24px rgba(0,0,0,0.06)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <h4 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 6px', color: 'var(--ink)' }}>
                      {off.title}
                    </h4>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                      {off.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Section: Productized Packages & Pricing */}
          <motion.section
            style={{ maxWidth: '1160px', margin: '0 auto 80px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Clock size={14} color="var(--ink)" />
                TRANSPARENT COMMERCIAL PACKAGES
              </div>
              <h2 style={{ font: '700 clamp(26px, 4vw, 36px) "Space Grotesk"', margin: '4px 0 0' }}>
                Choose Your {pillarData.title} Package
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', margin: '8px auto 16px', maxWidth: '500px' }}>
                Simple, transparent pricing. 50% deposit on start, 50% only upon live staging sign-off.
              </p>

              {/* Currency Selector Pill */}
              <div style={{ display: 'flex', justifyContent: 'center', margin: '14px 0 20px' }}>
                <div className="currency-toggle-container">
                  <button
                    type="button"
                    className={`currency-btn ${currency === 'INR' ? 'active' : ''}`}
                    onClick={() => setCurrency('INR')}
                    aria-label="View pricing in INR"
                  >
                    INR (₹)
                  </button>
                  <button
                    type="button"
                    className={`currency-btn ${currency === 'USD' ? 'active' : ''}`}
                    onClick={() => setCurrency('USD')}
                    aria-label="View pricing in USD"
                  >
                    USD ($)
                  </button>
                </div>
              </div>

              {pillarData.id === 'build' && (
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <motion.button
                    type="button"
                    className="secondary"
                    style={{ fontSize: '12px', height: '34px', padding: '0 14px' }}
                    onClick={() => onNavigate('/pricing')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    View All 6 Packages &amp; Comparison Matrix →
                  </motion.button>
                  <motion.button
                    type="button"
                    className="secondary"
                    style={{ fontSize: '12px', height: '34px', padding: '0 14px', background: 'var(--acid)', color: '#10100f', border: 'none' }}
                    onClick={() => onOpenInquiry({ service: 'Website / Build' })}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Sparkles size={12} style={{ marginRight: '4px' }} /> Request Free Consultation
                  </motion.button>
                </div>
              )}
            </motion.div>

            <div
              ref={packageContainerRef}
              className="service-pillar-packages-grid"
            >
              {pillarData.packages.map((pkg, idx) => {
                const displayPrice = currency === 'USD' ? (pkg.priceUSD || pkg.priceINR) : (pkg.priceINR || pkg.priceUSD);
                const isFocused = isMobile ? activeDotIndex === idx : pkg.popular;

                return (
                  <motion.div
                    key={idx}
                    ref={(el) => {
                      if (el) packageCardRefs.current[idx] = el;
                    }}
                    className={`package-card ${isFocused ? 'focused' : ''} ${pkg.popular ? 'popular' : ''}`}
                    style={{
                      background: pkg.popular ? '#ffffff' : '#fdfcf9',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '30px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: pkg.popular ? '0 10px 30px rgba(0,0,0,0.06)' : 'none'
                    }}
                    variants={fadeInUp}
                    whileHover={{ y: -6, boxShadow: pkg.popular ? '0 16px 40px rgba(0,0,0,0.12)' : '0 10px 24px rgba(0,0,0,0.06)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <SignaturePerimeterOutline
                      isFocused={isFocused}
                      isSelected={pkg.popular}
                      borderRadius={12}
                    />

                    {pkg.badge && (
                      <span
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '20px',
                          background: pkg.popular ? 'var(--acid)' : '#10100f',
                          color: '#10100f',
                          padding: '3px 10px',
                          borderRadius: '999px',
                          font: '700 10px "Space Grotesk"',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: pkg.popular ? '1px solid #bfe63c' : 'none',
                          zIndex: 6
                        }}
                      >
                        {pkg.badge}
                      </span>
                    )}

                    <div>
                      <h3 style={{ font: '700 20px "Space Grotesk"', margin: '0 0 6px' }}>{pkg.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '14px 0 4px' }}>
                        <span className="package-price-number" style={{ font: '700 32px "Space Grotesk"', color: 'var(--ink)' }}>{displayPrice}</span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{pkg.billing}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 20px' }}>
                        {pkg.desc}
                      </p>

                      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '18px', marginBottom: '24px' }}>
                        <label className="section-subtitle" style={{ fontSize: '10px', marginBottom: '10px' }}>WHAT'S INCLUDED</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ink)' }}>
                              <CheckCircle2 size={14} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      className="primary"
                      style={{ width: '100%', height: '42px', fontSize: '13px' }}
                      onClick={() =>
                        onOpenInquiry({
                          service: pillarData.serviceName,
                          package: pkg.name,
                          scope: pkg.name,
                          pillar: pillarData.title,
                          currency,
                          estimatedPrice: displayPrice,
                          priceINR: pkg.priceINR,
                          priceUSD: pkg.priceUSD,
                          problem: `I am interested in the ${pkg.name} package for ${pillarData.title}. Investment: ${displayPrice} (${currency}).`
                        })
                      }
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pkg.ctaText} <ArrowRight size={14} />
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>

            {/* Subtle Carousel Pagination Indicators on Mobile */}
            {pillarData.packages && pillarData.packages.length > 1 && (
              <div className="services-carousel-indicators" aria-label="Package Carousel Controls">
                <span className="carousel-swipe-hint">
                  Swipe to explore packages →
                </span>
                <div className="carousel-dots-list">
                  {pillarData.packages.map((pkg, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`carousel-dot-btn ${activeDotIndex === idx ? 'active' : ''}`}
                      onClick={() => scrollToIndex(idx)}
                      aria-label={`View ${pkg.name} package`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Ad Spend or Support Disclaimers */}
            {pillarData.adSpendNote && (
              <div style={{ margin: '24px auto 0', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', maxWidth: '600px' }}>
                💡 {pillarData.adSpendNote}
              </div>
            )}
            {pillarData.supportAddon && (
              <div style={{ margin: '24px auto 0', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', maxWidth: '600px' }}>
                ⚡ {pillarData.supportAddon}
              </div>
            )}
            {pillarData.techNote && (
              <div style={{ margin: '24px auto 0', textAlign: 'center', fontSize: '12px', color: 'var(--muted)', maxWidth: '600px' }}>
                ✨ {pillarData.techNote}
              </div>
            )}
          </motion.section>

          {/* Section: 4-Step Delivery Workflow */}
          <motion.section
            style={{ maxWidth: '1100px', margin: '0 auto 80px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div style={{ textAlign: 'center', marginBottom: '40px' }} variants={fadeInUp}>
              <label className="section-subtitle">DELIVERY ENGINE</label>
              <h2 style={{ font: '700 32px "Space Grotesk"', margin: '4px 0 0' }}>
                How We Get It Sorted
              </h2>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
              {pillarData.workflow.map((st, idx) => (
                <motion.div
                  key={idx}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: '10px',
                    padding: '24px 20px',
                    position: 'relative'
                  }}
                  variants={fadeInUp}
                  whileHover={{ y: -4, boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
                  transition={TRANSITIONS.cardSpring}
                >
                  <span style={{ font: '700 28px/1 "Space Grotesk"', color: 'var(--muted)', opacity: 0.4, display: 'block', marginBottom: '10px' }}>
                    {st.step}
                  </span>
                  <h4 style={{ font: '700 16px "Space Grotesk"', margin: '0 0 6px', color: 'var(--ink)' }}>
                    {st.title}
                  </h4>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', margin: 0, lineHeight: 1.5 }}>
                    {st.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section: FAQs Accordion */}
          <motion.section
            style={{ maxWidth: '800px', margin: '0 auto 80px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} variants={fadeInUp}>
              <label className="section-subtitle">COMMONLY ASKED</label>
              <h2 style={{ font: '700 28px "Space Grotesk"', margin: '4px 0 0' }}>
                Frequently Asked Questions
              </h2>
            </motion.div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {pillarData.faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <motion.div
                    key={idx}
                    variants={fadeInUp}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: '8px',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: '100%',
                        padding: '16px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'none',
                        border: 'none',
                        textAlign: 'left',
                        cursor: 'pointer',
                        fontWeight: 600,
                        fontSize: '14px',
                        color: 'var(--ink)'
                      }}
                    >
                      <span>{faq.q}</span>
                      <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown size={16} />
                      </motion.div>
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          variants={accordionVariants}
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          style={{ overflow: 'hidden' }}
                        >
                          <div style={{ padding: '0 20px 16px', fontSize: '13px', color: '#55534c', lineHeight: 1.6 }}>
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* Final Callout */}
          <motion.section
            style={{ maxWidth: '900px', margin: '0 auto 80px', padding: '0 24px', textAlign: 'center' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer}
          >
            <motion.div
              style={{ background: '#10100f', color: '#fff', borderRadius: '16px', padding: '50px 30px' }}
              variants={scaleIn}
              whileHover={{ scale: 1.01 }}
              transition={TRANSITIONS.cardSpring}
            >
              <h2 style={{ font: '700 36px "Space Grotesk"', margin: '0 0 12px' }}>
                Ready to get your {pillarData.title.toLowerCase()} sorted?
              </h2>
              <p style={{ color: '#a09f98', fontSize: '15px', maxWidth: '500px', margin: '0 auto 28px' }}>
                Submit a brief in under 60 seconds. Our team will review and share a tailored proposal.
              </p>
              <motion.button
                className="primary"
                style={{ background: 'var(--acid)', color: '#10100f', height: '46px', padding: '0 24px', fontSize: '14px' }}
                onClick={() => onOpenInquiry(pillarData.serviceName)}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                transition={TRANSITIONS.buttonSpring}
              >
                Get Sorted Now <ArrowRight size={16} />
              </motion.button>
            </motion.div>
          </motion.section>
        </main>
      )}

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--line)', padding: '40px 24px', background: '#faf8f2', textAlign: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div className="brand" style={{ cursor: 'pointer' }} onClick={() => onNavigate('/')}>
            THE SORTED <span>CLUB</span>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--muted)', flexWrap: 'wrap' }}>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/services/build')}>Build</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/services/grow')}>Grow</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/services/automate')}>Automate</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/services/hire')}>Hire</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/templates')}>Templates</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/pricing')}>Pricing</span>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/discovery')}>Discovery Brief</span>
            <a href="mailto:thesortedclub@gmail.com" style={{ color: 'inherit', textDecoration: 'none' }}>thesortedclub@gmail.com</a>
            <a href="https://wa.me/919643820888?text=Hi%20The%20Sorted%20Club%2C%20I%27m%20interested%20in%20your%20BUILD%20services." target="_blank" rel="noopener noreferrer" style={{ color: '#15803d', fontWeight: 600, textDecoration: 'none' }}>WhatsApp: +91 9643820888</a>
            <span style={{ cursor: 'pointer' }} onClick={() => onNavigate('/admin')}>Admin Access</span>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
            © 2026 The Sorted Club. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
