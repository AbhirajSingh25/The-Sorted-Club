import { TEMPLATES } from './templatesData';

export const QUALIFICATION_CRITERIA = [
  { key: 'has_real_business', label: 'Has a Real Business', desc: 'Active operation, trading history, existing customers or funded launch.' },
  { key: 'has_clear_need', label: 'Has a Clear Website Need', desc: 'Low conversion, broken mobile layout, outdated look, or starting fresh.' },
  { key: 'has_budget', label: 'Has Budget Fit', desc: 'Budget aligns with standard packages (₹14,999 to ₹59,999+ / $400 to $1,500+).' },
  { key: 'has_timeline', label: 'Has a 30-Day Timeline', desc: 'Wants website live within 7 to 30 days.' },
  { key: 'is_decision_maker', label: 'Is the Decision-Maker', desc: 'Speaking with founder, business owner, partner, or CMO.' },
  { key: 'responds_communication', label: 'Responds to Communication', desc: 'Engaged, responsive, shows up to scheduled calls.' }
];

export const DISCOVERY_CALL_CHECKLIST_ITEMS = [
  { id: 'research', label: 'Pre-Call Audit', desc: 'Reviewed current website/socials and identified 2 mobile friction points.' },
  { id: 'rapport', label: 'Rapport & Context', desc: 'Confirmed business model, target audience, and current lead sources.' },
  { id: 'pain', label: 'Pain & Leak Discovery', desc: 'Uncovered specific conversion bottlenecks (e.g. slow load, no WhatsApp CTA).' },
  { id: 'blueprint', label: 'Blueprint Walkthrough', desc: 'Presented matching live demo blueprint and highlighted sub-second performance.' },
  { id: 'commercials', label: 'Scope & Milestone Alignment', desc: 'Confirmed page count, features, and standard 50/50 payment terms.' },
  { id: 'commitment', label: 'Proposal Commitment', desc: 'Secured agreement to review formal tokenized proposal within 24 hours.' }
];

export function generateOutreachMessages(lead = {}) {
  const contactName = lead.name ? lead.name.split(' ')[0] : 'there';
  const businessName = lead.business_name || 'your business';
  const industry = lead.business_type || 'your industry';
  const websiteUrl = lead.website || 'your website';
  const problem = lead.problem_noticed || lead.problem || 'mobile load speed and lack of direct WhatsApp lead capture';

  // Find demo template slug & name
  let templateSlug = lead.relevant_template || 'apex-agency';
  let matchedTemplate = TEMPLATES.find((t) => t.slug === templateSlug) || TEMPLATES[0];
  const templateName = matchedTemplate.name;
  const demoUrl = `https://thesortedclub.com/demo/${matchedTemplate.slug}`;

  return {
    instagram_dm: {
      id: 'instagram_dm',
      title: 'Instagram DM',
      channel: 'Instagram',
      badge: 'Social DM',
      subject: null,
      text: `Hi ${contactName} 👋 Love what you're doing with ${businessName}! I was browsing your page and noticed when clicking your link that ${problem}.

We recently engineered a clean website blueprint for ${industry} that fixes this with instant WhatsApp chat and mobile conversion:
👉 ${demoUrl}

We build and launch custom websites in 5 to 7 days with transparent pricing (from ₹14,999 / $400) and zero monthly builder lock-ins.

Would you be open to a quick 2-minute video breakdown of how we'd structure your site?

Best,
The Sorted Club Team`
    },

    whatsapp: {
      id: 'whatsapp',
      title: 'WhatsApp Message',
      channel: 'WhatsApp',
      badge: 'Direct Chat',
      subject: null,
      text: `Hi ${contactName}, hope you're having a great week!

I'm reaching out from The Sorted Club. I came across ${businessName} and noticed that ${problem}.

We built an interactive website blueprint designed specifically for ${industry} to turn mobile visitors into paying clients:
🔗 ${demoUrl}

We build custom-branded websites in 5 to 7 days with transparent 50/50 milestone terms.

Would you be open to a quick 10-minute chat or brief walkthrough this week?

Best regards,
The Sorted Club Squad (thesortedclub.com)`
    },

    email: {
      id: 'email',
      title: 'Cold Email',
      channel: 'Email',
      badge: 'Formal Email',
      subject: `Quick observation regarding ${businessName}'s website`,
      text: `Hi ${contactName},

I’m reaching out from The Sorted Club. We build high-performance, conversion-focused websites for ambitious ${industry} companies.

While reviewing ${businessName}'s website (${websiteUrl}), I noticed a few high-impact opportunities:
1. ${problem}
2. Missing 1-click WhatsApp lead routing for mobile visitors
3. Opportunity to improve Google PageSpeed and search credibility

We recently launched a modern website architecture engineered for businesses like yours:
👉 Live Demo Blueprint: ${demoUrl}

How we work:
• Turnaround: Live within 5 to 7 business days.
• Transparent Pricing: Fixed packages from ₹14,999 / $400.
• Low-Risk Terms: 50% deposit to start, 50% upon live sign-off before DNS handover.
• 100% Ownership: You own your source code, domain, and assets outright.

Would you have 15 minutes for a free technical consultation this Thursday or Friday?

Best regards,
The Sorted Club Digital Architecture Squad
🌐 thesortedclub.com • 📱 +91 9643820888`
    },

    linkedin: {
      id: 'linkedin',
      title: 'LinkedIn Message',
      channel: 'LinkedIn',
      badge: 'B2B Network',
      subject: null,
      text: `Hi ${contactName},

Came across your profile and leadership at ${businessName}.

I took a look at ${businessName}'s digital presence and saw that ${problem}.

At The Sorted Club, we build clean, lightning-fast business websites (React, sub-second load times, 90+ PageSpeed) that establish immediate market authority and capture high-intent inquiries.

Here is a live sample of the architecture we deploy for ${industry}:
🔗 ${demoUrl}

Would love to connect and share a few tailored ideas for ${businessName} if you're evaluating web improvements this quarter.

Best,
The Sorted Club Collective`
    },

    followup_3days: {
      id: 'followup_3days',
      title: 'Follow-Up (3 Days)',
      channel: 'Multi-Channel',
      badge: 'Day 3 Nudge',
      subject: `Following up — ${businessName}'s website blueprint`,
      text: `Hi ${contactName},

Following up briefly on my note from earlier this week regarding ${businessName}'s website.

I put together a quick preview highlighting how our ${templateName} blueprint handles ${problem}:
👉 ${demoUrl}

No high-pressure pitch — just wanted to check if modernizing your website is on your roadmap for this month?

Best,
The Sorted Club Team`
    },

    followup_7days: {
      id: 'followup_7days',
      title: 'Follow-Up (7 Days)',
      channel: 'Multi-Channel',
      badge: 'Day 7 Last Check',
      subject: `Final follow-up for ${businessName}`,
      text: `Hi ${contactName},

Reaching out one last time regarding ${businessName}'s web presence.

We have engineering slots opening up in next week’s sprint. If you’d like to get your website sorted (5–7 day turnaround, starting from ₹14,999 / $400), we’d love to help you build it right.

You can also browse our full blueprint catalogue or request a free consultation here:
🔗 https://thesortedclub.com/pricing

Either way, wishing you and ${businessName} continued growth!

Best regards,
The Sorted Club`
    },

    proposal_followup: {
      id: 'proposal_followup',
      title: 'Proposal Follow-Up',
      channel: 'Email / WhatsApp',
      badge: 'Deal Closing',
      subject: `Checking in on commercial proposal for ${businessName}`,
      text: `Hi ${contactName},

Hope you’re having a great week!

I wanted to check in on the commercial proposal prepared for ${businessName}.

In case you need to review the scope, included pages, or milestone schedule again, you can access your secure online proposal link here:
🔗 https://thesortedclub.com/pricing

As a reminder:
• Turnaround: 5 to 7 business days from kickoff.
• Terms: 50% deposit to lock in squad sprint, 50% upon live sign-off.
• Includes 2 revision rounds and post-launch warranty.

Do you have any questions on the scope or milestones before we finalize the sprint dates?

Best regards,
The Sorted Club Squad`
    }
  };
}
