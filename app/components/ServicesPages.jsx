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
import StudioIllustration from './StudioIllustration';

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
        title: 'Local Services & Practices',
        illustration: 'build-local',
        desc: 'Turn local mobile visitors into booked appointments and direct WhatsApp enquiries.'
      },
      {
        title: 'Specialty Brands & Retail',
        illustration: 'build-commerce',
        desc: 'Lightning-fast digital storefronts with friction-free cart and payment checkout.'
      },
      {
        title: 'Tech Startups & Platforms',
        illustration: 'build-platform',
        desc: 'Custom full-stack web applications, authenticated client portals, and bespoke tools.'
      }
    ],
    roadblocks: [
      {
        illustration: 'build-speed',
        problem: 'Slow, Bloated Templates',
        solution: 'Sub-second PageSpeed 90+ custom code. 100% full client code ownership.'
      },
      {
        illustration: 'build-mobile-chat',
        problem: 'Lost Mobile Enquiries',
        solution: 'Direct 1-tap WhatsApp lead triggers and streamlined mobile inquiry capture.'
      },
      {
        illustration: 'build-lock-repo',
        problem: 'Proprietary Builder Lock-in',
        solution: 'Standard modern React stack. Full Git repository and domain handover upon launch.'
      },
      {
        illustration: 'build-milestone',
        problem: 'Agency Scope Creep & Delays',
        solution: 'Fixed 5–10 day sprint turnaround with 50/50 staging milestone approval.'
      }
    ],
    deliverablesPillars: [
      {
        illustration: 'build-deliver-web',
        title: 'Commercial Web & Conversion',
        bullets: [
          '5–8 custom responsive pages with rich typography',
          'Direct WhatsApp chat and CRM lead capture',
          'PageSpeed 90+ optimization and local schema SEO'
        ]
      },
      {
        illustration: 'build-deliver-app',
        title: 'Custom Applications & Portals',
        bullets: [
          'Role-based client dashboards and auth systems',
          'Interactive pricing calculators and dynamic CMS',
          'Secure PostgreSQL database and REST API webhooks'
        ]
      },
      {
        illustration: 'build-deliver-standards',
        title: 'Standards & Guarantees',
        bullets: [
          '100% full client source code and asset ownership',
          'Private staging sandbox testing before live DNS',
          '30 to 90 days technical warranty SLA included'
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
        title: 'B2B & Consultancies',
        illustration: 'grow-b2b',
        desc: 'Generate consistent qualified inbound inquiries through high-retention video and authority content.'
      },
      {
        title: 'Local Clinics & Practices',
        illustration: 'grow-local',
        desc: 'Capture prime local search intent and dominate Google Maps top-3 local pack.'
      },
      {
        title: 'D2C Brands & Commerce',
        illustration: 'grow-d2c',
        desc: 'High-velocity creative ad sprints and conversion funnels tied directly to closed revenue.'
      }
    ],
    roadblocks: [
      {
        illustration: 'grow-search',
        problem: 'Invisible Local Search Ranking',
        solution: 'Google Business Profile dominance, local citation cleanup, and review velocity.'
      },
      {
        illustration: 'grow-stream',
        problem: 'Unpredictable Referral Pipeline',
        solution: 'Systematic multi-channel inbound engine pairing short-form video with targeted ads.'
      },
      {
        illustration: 'grow-attribution',
        problem: 'Vague Agency Retainer Spend',
        solution: 'End-to-end CRM lead attribution tracking every rupee/dollar directly to closed deals.'
      },
      {
        illustration: 'grow-calendar',
        problem: 'Creative Video Fatigue',
        solution: 'Done-for-you scriptwriting, hook testing, and professional editing for 8–20 assets monthly.'
      }
    ],
    deliverablesPillars: [
      {
        illustration: 'grow-calendar',
        title: 'Short-Form Video Engine',
        bullets: [
          'Hook-architected video scripts for Reels and Shorts',
          'High-retention editing, sound design, and motion text',
          'Structured monthly cross-platform publishing calendar'
        ]
      },
      {
        illustration: 'grow-search',
        title: 'Search & Maps Dominance',
        bullets: [
          'Google Maps top-3 local pack ranking optimization',
          'Technical on-page SEO and structured JSON-LD schema',
          'Bi-weekly keyword and competitor rank trajectory reports'
        ]
      },
      {
        illustration: 'grow-attribution',
        title: 'Paid Acquisition & Funnels',
        bullets: [
          'High-intent Meta and Google Ad campaign management',
          'Dedicated high-converting appointment landing pages',
          'Real-time CRM lead attribution and ROI reporting'
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
        title: 'Sales & Inbound Teams',
        illustration: 'automate-inbound',
        desc: 'Instant 24/7 WhatsApp and email responders that pre-qualify and book leads in under 60 seconds.'
      },
      {
        title: 'Operations Managers',
        illustration: 'automate-ops',
        desc: 'Auto-sync inquiries to CRM, assign pipeline stages, and eliminate repetitive copy-pasting.'
      },
      {
        title: 'Scaling Founders',
        illustration: 'automate-founders',
        desc: 'Automate invoice generation, client onboarding, and daily admin tasks so your squad stays lean.'
      }
    ],
    roadblocks: [
      {
        illustration: 'automate-speed',
        problem: 'Hours Lost to Slow Follow-ups',
        solution: 'Under-60-second automated WhatsApp and email response qualifying prospects 24/7.'
      },
      {
        illustration: 'automate-sync',
        problem: 'Disconnected Business Tools',
        solution: 'Self-healing API webhooks synchronizing lead forms, CRM stages, and team alerts.'
      },
      {
        illustration: 'automate-invoice',
        problem: 'Manual Invoicing & Late Payments',
        solution: 'Automated invoice generation, payment reminders, and instant digital receipts.'
      },
      {
        illustration: 'automate-guard',
        problem: 'Repetitive Customer Inquiries',
        solution: 'Internal AI assistant trained strictly on your documentation with zero hallucinations.'
      }
    ],
    deliverablesPillars: [
      {
        illustration: 'automate-inbound',
        title: 'AI Customer Responders',
        bullets: [
          '24/7 WhatsApp and Email intelligent lead qualification',
          'Calendar booking integration with automated confirmations',
          'Custom guardrails trained on your company knowledge'
        ]
      },
      {
        illustration: 'automate-sync',
        title: 'CRM & Pipeline Sync',
        bullets: [
          'Automatic lead ingestion, deduplication, and stage routing',
          'Slack and WhatsApp instant hot lead team notifications',
          'Two-way sync across Google Sheets, Airtable, and custom CRMs'
        ]
      },
      {
        illustration: 'automate-invoice',
        title: 'Workflow Automation & SLAs',
        bullets: [
          'Trigger-based automated invoice and contract workflows',
          'Error-monitoring webhooks with automatic fallback alerts',
          '30–60 days technical warranty and video handover docs'
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
        title: 'Tech Startups & Squads',
        illustration: 'hire-tech',
        desc: 'Top-tier Full-Stack Engineers, Product Designers, and Tech Leads sourced in 7–10 days.'
      },
      {
        title: 'Marketing & Creative Agencies',
        illustration: 'hire-growth',
        desc: 'Pre-vetted media buyers, performance marketers, and operations leads without recruiter delay.'
      },
      {
        title: 'Scaling Enterprises',
        illustration: 'hire-bench',
        desc: 'Scale dedicated project benches with a 100% pay-on-success model and zero upfront fees.'
      }
    ],
    roadblocks: [
      {
        illustration: 'hire-filter',
        problem: 'Endless Resume Screening',
        solution: 'HireSense AI screens thousands of profiles to deliver top 3–5 finalists in 7–10 days.'
      },
      {
        illustration: 'hire-benchmark',
        problem: 'Unverified Technical Skills',
        solution: 'Hands-on coding assessments and structured scorecard evaluations before client review.'
      },
      {
        illustration: 'hire-handshake',
        problem: 'Exorbitant Upfront Recruiter Fees',
        solution: '100% pay-on-success commercial model: zero fee until you successfully hire.'
      },
      {
        illustration: 'hire-shield',
        problem: 'Early Candidate Departure',
        solution: '90-day comprehensive replacement guarantee: immediate re-sourcing at zero extra cost.'
      }
    ],
    deliverablesPillars: [
      {
        illustration: 'hire-filter',
        title: 'HireSense AI Benchmarking',
        bullets: [
          'Custom role scorecard and capability bar definition',
          'AI sourcing across active job boards and passive talent pools',
          'Technical coding benchmark and portfolio verification'
        ]
      },
      {
        illustration: 'hire-benchmark',
        title: 'Curated Candidate Shortlists',
        bullets: [
          'Top 3–5 interview-ready candidates delivered in 7–10 days',
          'Comprehensive candidate dossier with screening notes and salary expectation',
          'Interview scheduling coordination and structured feedback'
        ]
      },
      {
        illustration: 'hire-shield',
        title: 'Risk Protection & Guarantees',
        bullets: [
          '100% pay-on-success commercial engagement terms',
          '90-day free candidate replacement guarantee',
          'Dedicated senior hiring partner managing pipeline to offer closing'
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
  const [chosenPackageName, setChosenPackageName] = useState(null);
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
    setChosenPackageName(null);
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

          {/* Section: Who This Is For (Compact Visual Studio Cards) */}
          <motion.section
            className="service-audience-section"
            style={{ maxWidth: '1160px', margin: '0 auto 60px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ marginBottom: '24px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Target size={14} color="var(--ink)" />
                WHO THIS IS FOR • {pillarData.title.toUpperCase()}
              </div>
              <h2 style={{ font: '700 clamp(24px, 3.5vw, 32px) "Space Grotesk"', margin: '0 0 8px', color: 'var(--ink)' }}>
                Built for businesses where credibility and conversion matter.
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
                Tailored digital systems designed for high-conviction outcomes across distinct business models.
              </p>
            </motion.div>

            <div className="service-audience-compact-grid service-audience-grid">
              {(pillarData.whoForProfiles || []).map((prof, idx) => (
                <motion.div
                  key={idx}
                  className="audience-compact-card audience-profile-card"
                  variants={fadeInUp}
                  whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(16, 16, 15, 0.06)' }}
                  transition={TRANSITIONS.cardSpring}
                >
                  <div className="audience-compact-visual">
                    <StudioIllustration name={prof.illustration} size={46} />
                  </div>
                  <h3 className="audience-compact-title audience-title">{prof.title}</h3>
                  <p className="audience-compact-desc audience-desc">{prof.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section: Common Roadblocks We Eliminate (Problem-to-Solution Transformation) */}
          <motion.section
            className="service-roadblocks-section"
            style={{ maxWidth: '1160px', margin: '0 auto 60px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ marginBottom: '24px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Zap size={14} color="var(--ink)" />
                FRICTION WE ELIMINATE • {pillarData.title.toUpperCase()}
              </div>
              <h2 style={{ font: '700 clamp(24px, 3.5vw, 32px) "Space Grotesk"', margin: '0 0 8px', color: 'var(--ink)' }}>
                Common roadblocks we eliminate in {pillarData.title}.
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '640px', margin: 0, lineHeight: 1.5 }}>
                We replace recurring industry bottlenecks with engineered clarity and measurable velocity.
              </p>
            </motion.div>

            <div className="service-roadblocks-compact-grid service-roadblocks-grid">
              {(pillarData.roadblocks || []).map((road, idx) => (
                <motion.div
                  key={idx}
                  className="roadblock-compact-card roadblock-resolution-card"
                  variants={fadeInUp}
                  whileHover={{ y: -3, boxShadow: '0 12px 28px rgba(16, 16, 15, 0.06)' }}
                  transition={TRANSITIONS.cardSpring}
                >
                  <div className="roadblock-compact-visual">
                    <StudioIllustration name={road.illustration} size={42} />
                  </div>
                  <div className="roadblock-compact-body">
                    <div className="roadblock-problem-line">
                      <span className="roadblock-dot problem">✕</span>
                      <h4 className="roadblock-problem-text">{road.problem}</h4>
                    </div>
                    <div className="roadblock-connector">
                      <span className="roadblock-arrow">→</span>
                    </div>
                    <div className="roadblock-solution-line">
                      <span className="roadblock-dot solution">✓</span>
                      <p className="roadblock-solution-text">{road.solution || road.resolution}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Section: What We Deliver (Illustrated Delivery Modules) */}
          <motion.section
            className="service-deliverables-section"
            style={{ maxWidth: '1160px', margin: '0 auto 60px', padding: '0 24px' }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={staggerContainer(0.08, 0.05)}
          >
            <motion.div style={{ textAlign: 'center', marginBottom: '32px' }} variants={fadeInUp}>
              <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <Layers size={14} color="var(--ink)" />
                DELIVERABLES &amp; CAPABILITIES • {pillarData.title.toUpperCase()}
              </div>
              <h2 style={{ font: '700 clamp(24px, 3.5vw, 32px) "Space Grotesk"', margin: '4px 0 8px' }}>
                What We Deliver in {pillarData.title}
              </h2>
              <p style={{ color: 'var(--muted)', fontSize: '14px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.5 }}>
                Engineered deliverables with rigorous technical standards, zero bloat, and 100% intellectual property ownership.
              </p>
            </motion.div>

            {pillarData.deliverablesPillars && pillarData.deliverablesPillars.length > 0 ? (
              <div className="service-deliverables-modules-grid service-deliverables-editorial">
                {pillarData.deliverablesPillars.map((col, cIdx) => (
                  <motion.div
                    key={cIdx}
                    className="deliverable-module-card deliverable-pillar-col"
                    variants={fadeInUp}
                    whileHover={{ y: -3, boxShadow: '0 14px 30px rgba(16, 16, 15, 0.06)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <div className="deliverable-module-head">
                      <div className="deliverable-module-visual">
                        <StudioIllustration name={col.illustration} size={44} />
                      </div>
                      <div>
                        <h3 className="deliverable-module-title deliverable-pillar-headline">{col.title || col.category}</h3>
                        {col.summary && <p className="deliverable-module-summary deliverable-pillar-summary">{col.summary}</p>}
                      </div>
                    </div>

                    <ul className="deliverable-module-list">
                      {(col.bullets || col.items || []).map((bullet, bIdx) => {
                        const bulletDesc = typeof bullet === 'string' ? bullet : bullet.desc || bullet.title;
                        const bulletTitle = typeof bullet === 'object' && bullet.desc ? bullet.title : null;
                        const bulletBadge = typeof bullet === 'object' ? bullet.badge : null;
                        return (
                          <li key={bIdx} className="deliverable-module-item">
                            <CheckCircle2 size={13} className="deliverable-check-icon" />
                            <div className="deliverable-item-text">
                              {bulletTitle && <span className="deliverable-item-title">{bulletTitle}</span>}
                              {bulletBadge && <span className="deliverable-item-badge">{bulletBadge}</span>}
                              <p className="deliverable-item-desc">{bulletDesc}</p>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                {pillarData.offerings.map((off, idx) => (
                  <motion.div
                    key={idx}
                    style={{
                      background: '#fff',
                      border: '1px solid var(--line)',
                      borderRadius: '10px',
                      padding: '20px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                    }}
                    variants={fadeInUp}
                    whileHover={{ y: -3, boxShadow: '0 8px 20px rgba(0,0,0,0.05)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <h4 style={{ font: '700 15px "Space Grotesk"', margin: '0 0 6px', color: 'var(--ink)' }}>
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
                const isFocused = isMobile ? activeDotIndex === idx : false;
                const isChosen = chosenPackageName === pkg.name;

                return (
                  <motion.div
                    key={idx}
                    ref={(el) => {
                      if (el) packageCardRefs.current[idx] = el;
                    }}
                    className={`package-card ${isFocused ? 'focused' : ''} ${isChosen ? 'chosen' : ''} ${pkg.popular ? 'popular' : ''}`}
                    onClick={() => setChosenPackageName(pkg.name)}
                    style={{
                      background: pkg.popular ? '#ffffff' : '#fdfcf9',
                      border: '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '28px 22px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: pkg.popular ? '0 10px 30px rgba(0,0,0,0.06)' : 'none',
                      cursor: 'pointer'
                    }}
                    variants={fadeInUp}
                    whileHover={{ y: -4, boxShadow: pkg.popular ? '0 16px 36px rgba(0,0,0,0.1)' : '0 8px 20px rgba(0,0,0,0.05)' }}
                    transition={TRANSITIONS.cardSpring}
                  >
                    <SignaturePerimeterOutline
                      isFocused={isFocused}
                      isSelected={isChosen}
                      borderRadius={12}
                    />

                    {pkg.popular && (
                      <span
                        className="package-popular-badge"
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '20px',
                          background: 'var(--acid)',
                          color: '#10100f',
                          padding: '3px 12px',
                          borderRadius: '999px',
                          font: '700 10px "Space Grotesk"',
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          border: '1px solid #bfe63c',
                          zIndex: 6
                        }}
                      >
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h3 style={{ font: '700 20px "Space Grotesk"', margin: '0 0 6px' }}>{pkg.name}</h3>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '12px 0 4px' }}>
                        <span className="package-price-number" style={{ font: '700 30px "Space Grotesk"', color: 'var(--ink)' }}>{displayPrice}</span>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>{pkg.billing}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, margin: '0 0 18px' }}>
                        {pkg.desc}
                      </p>

                      <div style={{ borderTop: '1px solid var(--line)', paddingTop: '16px', marginBottom: '20px' }}>
                        <label className="section-subtitle" style={{ fontSize: '10px', marginBottom: '10px' }}>WHAT'S INCLUDED</label>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {pkg.features.map((feat, fIdx) => (
                            <div key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', fontSize: '12px', color: 'var(--ink)' }}>
                              <CheckCircle2 size={13} color="#15803d" style={{ flexShrink: 0, marginTop: '2px' }} />
                              <span>{feat}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <motion.button
                      type="button"
                      className="primary"
                      style={{ width: '100%', height: '40px', fontSize: '13px' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setChosenPackageName(pkg.name);
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
                        });
                      }}
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
