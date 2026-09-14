import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  ArrowRight,
  Laptop,
  Tablet,
  Smartphone,
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  Phone,
  Mail,
  User,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  X,
  Sparkles,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  Code,
  Sliders,
  DollarSign,
  Copy,
  Check,
  Zap,
  Award,
  BookOpen,
  Compass,
  Layers,
  Heart
} from 'lucide-react';
import { TEMPLATES } from './templatesData';
import {
  fadeInUp,
  fadeIn,
  scaleIn,
  TRANSITIONS
} from '../utils/motion';

export default function TemplateLiveDemo({ slug, onNavigate, onOpenInquiry }) {
  const template = TEMPLATES.find((t) => t.slug === slug) || TEMPLATES[0];
  const [viewportMode, setViewportMode] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Update SEO Document Title
  useEffect(() => {
    document.title = `Live Demo: ${template.name} (${template.badge}) | The Sorted Club`;
    window.scrollTo(0, 0);
  }, [template]);

  // General Booking / Interaction Modal State
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingType, setBookingType] = useState('Table Reservation');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingFormData, setBookingFormData] = useState({
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+91 9876543210',
    date: '2026-09-15',
    time: '19:30',
    guests: '2',
    specialist: 'Maya Lin, L.E.',
    notes: 'Window seat or quiet booth if available'
  });

  // 1. Restaurant Demo State
  const [restaurantMenuTab, setRestaurantMenuTab] = useState('Starters');

  // 2. Coaching Demo State
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);

  // 3. Spa Demo State
  const [spaCategoryTab, setSpaCategoryTab] = useState('Body & Massage');

  // 4. Real Estate Filter State
  const [reBedFilter, setReBedFilter] = useState('All');

  // 5. E-commerce Cart State
  const [cartItems, setCartItems] = useState([
    { id: 'p1', name: 'Raw Stoneware Pour-Over Carafe', price: 2400, qty: 1 }
  ]);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [ecomCategoryTab, setEcomCategoryTab] = useState('All');

  // 6. Local Service Radius Checker State
  const [zipInput, setZipInput] = useState('');
  const [zipResult, setZipResult] = useState(null);

  // 7. SaaS Demo State
  const [saasBillingAnnual, setSaasBillingAnnual] = useState(false);
  const [saasActiveTabId, setSaasActiveTabId] = useState('orchestration');
  const [saasCodeLang, setSaasCodeLang] = useState('python');
  const [copiedCode, setCopiedCode] = useState(false);
  const [saasOpenFaq, setSaasOpenFaq] = useState(null);

  // Cart operations
  const addToCart = (product) => {
    const numericPrice = product.priceNum || parseInt(String(product.price).replace(/[^\d]/g, ''), 10) || 1500;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id: product.id, name: product.name, price: numericPrice, qty: 1 }];
    });
    setCartDrawerOpen(true);
  };

  const updateCartQty = (id, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeCartItem = (id) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id));
  };

  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const freeShippingThreshold = 3000;
  const freeShippingRemaining = Math.max(0, freeShippingThreshold - cartSubtotal);

  // Zip code checker handler
  const handleCheckZip = (e) => {
    e.preventDefault();
    if (!zipInput.trim()) return;
    const cleanZip = zipInput.trim();
    if (cleanZip.length >= 5) {
      setZipResult({
        available: true,
        message: `✅ Great news! Same-day dispatch is active for postal code ${cleanZip}. Estimated technician arrival: Under 60 mins.`
      });
    } else {
      setZipResult({
        available: false,
        message: `Please enter a valid 6-digit postal code to verify dispatch availability.`
      });
    }
  };

  // Code snippets for SaaS Demo
  const codeSnippets = {
    python: `import flowgrid

client = flowgrid.Client(api_key="fg_live_sample")

# Deploy autonomous workflow pipeline
pipeline = client.pipelines.create(
    name="customer_onboarding",
    trigger="webhook.lead_created",
    steps=[
        flowgrid.ai.enrich(provider="gpt-4o"),
        flowgrid.crm.sync(target="sorted_crm"),
        flowgrid.notify.whatsapp(to="+919643820888")
    ]
)
print(f"Pipeline active: {pipeline.id}")`,
    node: `import { FlowGrid } from '@flowgrid/sdk';

const client = new FlowGrid({ apiKey: 'fg_live_sample' });

const pipeline = await client.pipelines.create({
  name: 'customer_onboarding',
  trigger: 'webhook.lead_created',
  steps: [
    FlowGrid.ai.enrich({ provider: 'gpt-4o' }),
    FlowGrid.crm.sync({ target: 'sorted_crm' }),
    FlowGrid.notify.whatsapp({ to: '+919643820888' })
  ]
});
console.log('Pipeline active:', pipeline.id);`,
    curl: `curl -X POST https://api.flowgrid.ai/v1/pipelines \\
  -H "Authorization: Bearer fg_live_sample" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "customer_onboarding",
    "trigger": "webhook.lead_created",
    "steps": [
      {"action": "ai.enrich", "model": "gpt-4o"},
      {"action": "crm.sync", "target": "sorted_crm"},
      {"action": "notify.whatsapp", "to": "+919643820888"}
    ]
  }'`
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeSnippets[saasCodeLang]);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDemoBookingSubmit = (e) => {
    e.preventDefault();
    setBookingSuccess(true);
  };

  const openBookingModal = (actionTitle) => {
    setBookingType(actionTitle);
    setBookingSuccess(false);
    setBookingModalOpen(true);
  };

  return (
    <div className="live-demo-fullscreen-wrapper">
      {/* Floating Demo Navigation Header */}
      <motion.header
        className="demo-floating-bar"
        role="banner"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={TRANSITIONS.editorial}
      >
        <div className="demo-bar-left">
          <motion.button
            type="button"
            className="demo-back-btn"
            whileHover={{ scale: 1.03, x: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onNavigate(`/templates/${template.slug}`)}
            title="Return to template detail page"
          >
            <ArrowLeft size={16} />
            <span className="hide-on-small">Back to Details</span>
          </motion.button>

          <div className="demo-badge-group">
            <span className="demo-live-indicator">
              <span className="live-pulse-dot" /> Interactive Demo
            </span>
            <span className="demo-template-title">{template.name}</span>
            <span className="demo-concept-pill">{template.badge}</span>
          </div>
        </div>

        {/* Viewport Width Controls */}
        <div className="demo-viewport-controls" role="group" aria-label="Device viewport switcher">
          <motion.button
            type="button"
            className={`viewport-btn ${viewportMode === 'desktop' ? 'active' : ''}`}
            onClick={() => setViewportMode('desktop')}
            title="Desktop 100% Full Width"
            aria-label="Desktop view"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Laptop size={15} />
            <span className="hide-on-small">Desktop</span>
          </motion.button>
          <motion.button
            type="button"
            className={`viewport-btn ${viewportMode === 'tablet' ? 'active' : ''}`}
            onClick={() => setViewportMode('tablet')}
            title="Tablet 768px View"
            aria-label="Tablet view"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Tablet size={15} />
            <span className="hide-on-small">Tablet (768px)</span>
          </motion.button>
          <motion.button
            type="button"
            className={`viewport-btn ${viewportMode === 'mobile' ? 'active' : ''}`}
            onClick={() => setViewportMode('mobile')}
            title="Mobile 390px View"
            aria-label="Mobile view"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Smartphone size={15} />
            <span className="hide-on-small">Mobile (390px)</span>
          </motion.button>
        </div>

        <div className="demo-bar-right">
          <motion.button
            type="button"
            className="demo-build-btn"
            whileHover={{ scale: 1.03, y: -1 }}
            whileTap={{ scale: 0.97 }}
            transition={TRANSITIONS.buttonSpring}
            onClick={() => onOpenInquiry({ template })}
            title="Request a website build based on this template"
          >
            Build this Website <ArrowRight size={15} />
          </motion.button>
        </div>
      </motion.header>

      {/* Simulated Device Frame Container */}
      <div className={`demo-viewport-canvas viewport-${viewportMode}`}>
        <div className="simulated-device-frame">
          {/* Simulated Browser Chrome Bar */}
          <div className="simulated-browser-chrome">
            <div className="chrome-left">
              <span className="dot dot-red" />
              <span className="dot dot-yellow" />
              <span className="dot dot-green" />
            </div>
            <div className="chrome-center">
              <span className="lock-icon">🔒</span>
              <span className="url-text">https://{template.slug}.sorted.club</span>
            </div>
            <div className="chrome-right">
              <span className="demo-watermark-tag">Demo Concept</span>
            </div>
          </div>

          {/* Interactive Mock Website Body */}
          <div className="simulated-site-scrollable">
            {/* =========================================================================
                1. RESTAURANT & CAFÉ DEMO (Saffron & Sage)
                ========================================================================= */}
            {(template.category === 'Restaurants and Cafés' || template.slug === 'saffron-and-sage') && (
              <div className="mock-site restaurant-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">SAFFRON <span>&</span> SAGE</div>
                  <div className="mock-nav-links">
                    <a href="#menu" onClick={(e) => { e.preventDefault(); document.getElementById('mock-menu')?.scrollIntoView({ behavior: 'smooth' }); }}>Menu</a>
                    <a href="#story" onClick={(e) => { e.preventDefault(); document.getElementById('mock-story')?.scrollIntoView({ behavior: 'smooth' }); }}>Philosophy</a>
                    <a href="#gallery" onClick={(e) => { e.preventDefault(); document.getElementById('mock-gallery')?.scrollIntoView({ behavior: 'smooth' }); }}>Ambience</a>
                    <a href="#contact" onClick={(e) => { e.preventDefault(); document.getElementById('mock-contact')?.scrollIntoView({ behavior: 'smooth' }); }}>Location</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Table Reservation')}
                    >
                      Reserve Table
                    </button>
                  </div>
                </nav>

                <section className="mock-hero" style={{ backgroundImage: `linear-gradient(rgba(16, 16, 15, 0.72), rgba(16, 16, 15, 0.72)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow">EST. 2026 • ARTISAN WOOD-FIRED BISTRO</span>
                    <h1>Artisan Flavours.<br /><em>Timeless Hospitality.</em></h1>
                    <p>An intimate culinary haven celebrating seasonal ingredients, wild herbs, and slow wood-fired craftsmanship in Indiranagar, Bengaluru.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => openBookingModal('Table Reservation')}
                      >
                        Book a Table <Calendar size={16} />
                      </button>
                      <button
                        type="button"
                        className="mock-secondary-btn"
                        onClick={() => document.getElementById('mock-menu')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Explore Seasonal Menu ↓
                      </button>
                    </div>
                  </div>
                </section>

                {/* Digital Menu Section with Filter Tabs */}
                <section id="mock-menu" className="mock-section menu-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">SEASONAL SELECTIONS</span>
                    <h2>The Autumn Tasting Menu</h2>
                    <p>Crafted fresh daily with locally sourced organic farm ingredients and wild heritage herbs.</p>
                  </div>

                  <div className="menu-category-tabs">
                    {template.demoData?.menuCategories?.map((tab) => (
                      <button
                        type="button"
                        key={tab}
                        className={`menu-tab ${restaurantMenuTab === tab ? 'active' : ''}`}
                        onClick={() => setRestaurantMenuTab(tab)}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className="menu-items-grid">
                    {template.demoData?.menuItems
                      ?.filter((item) => !restaurantMenuTab || item.category === restaurantMenuTab)
                      ?.map((item, idx) => (
                        <div key={idx} className="menu-card">
                          <div className="menu-card-top">
                            <h4>{item.name}</h4>
                            <span className="menu-price">{item.price}</span>
                          </div>
                          <p>{item.desc}</p>
                          <div className="menu-card-bottom">
                            <span className="menu-item-tag">{item.tag}</span>
                            <button
                              type="button"
                              className="menu-order-cta"
                              onClick={() => openBookingModal(`Reserve table & Pre-order ${item.name}`)}
                            >
                              Reserve Dish →
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Chef Story Section */}
                <section id="mock-story" className="mock-section story-section">
                  <div className="story-grid">
                    <div className="story-text">
                      <span className="mock-eyebrow">OUR CULINARY ROOTS</span>
                      <h2>From Root to Flame</h2>
                      <p>
                        Every plate at Saffron & Sage tells a story of sustainable terroir. We partner directly with 14 organic micro-farms within a 50km radius to bring heirloom grains and freshly pressed oils straight to our wood-fired hearth.
                      </p>
                      <div className="story-stats">
                        {template.demoData?.stats?.map((st, i) => (
                          <div key={i} className="stat-item">
                            <strong>{st.val}</strong>
                            <span>{st.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="story-img-box" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80)` }} />
                  </div>
                </section>

                {/* Ambience Gallery */}
                <section id="mock-gallery" className="mock-section ambience-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">SANCTUARY OF FLAVOUR</span>
                    <h2>Dining Ambience &amp; Spaces</h2>
                  </div>

                  <div className="ambience-gallery-grid">
                    {template.demoData?.ambienceGallery?.map((amb, i) => (
                      <div key={i} className="ambience-card">
                        <div className="ambience-img" style={{ backgroundImage: `url(${amb.img})` }} />
                        <div className="ambience-info">
                          <h4>{amb.title}</h4>
                          <p>{amb.subtitle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Location & Hours Section */}
                <footer id="mock-contact" className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>SAFFRON &amp; SAGE BISTRO</h3>
                      <p><MapPin size={14} style={{ display: 'inline', marginRight: '6px' }} />{template.demoData?.address}</p>
                      <p><strong>Reservations:</strong> {template.demoData?.phone}</p>
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          className="mock-primary-btn"
                          onClick={() => openBookingModal('Table Reservation')}
                        >
                          Book Table Online
                        </button>
                      </div>
                    </div>
                    <div>
                      <h4>Operating Hours</h4>
                      <p>{template.demoData?.openHours}</p>
                      <p>Valet parking available at heritage gate.</p>
                      <p style={{ marginTop: '8px', color: '#94a3b8' }}>
                        <small>Direct WhatsApp Booking: +91 9643820888</small>
                      </p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Saffron & Sage Bistro. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                2. COACHING INSTITUTE DEMO (Apex Learning)
                ========================================================================= */}
            {(template.category === 'Coaching Institutes' || template.slug === 'apex-institute') && (
              <div className="mock-site coaching-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">APEX <span>LEARNING HUB</span></div>
                  <div className="mock-nav-links">
                    <a href="#courses">Courses</a>
                    <a href="#methodology">Methodology</a>
                    <a href="#faculty">Faculty</a>
                    <a href="#schedules">Batch Table</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Admission Counseling & Test')}
                    >
                      Apply for 2026 Cohort
                    </button>
                  </div>
                </nav>

                <section className="mock-hero coaching-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.88)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#60a5fa' }}>ADMISSIONS OPEN FOR 2026 - 2027</span>
                    <h1>Disciplined Mentorship.<br /><em>Unmatched Results.</em></h1>
                    <p>Structured classroom programs, AI-powered diagnostic test series, and top-tier mentorship for engineering & medical entrance exams.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => openBookingModal('Syllabus & Fee Guide Download')}
                      >
                        Download 2026 Syllabus & Fee Guide ↓
                      </button>
                      <button
                        type="button"
                        className="mock-secondary-btn"
                        onClick={() => openBookingModal('Diagnostic Scholarship Test')}
                      >
                        Register for Scholarship Test
                      </button>
                    </div>
                  </div>
                </section>

                {/* Courses Grid */}
                <section id="courses" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">ACADEMIC PROGRAMS</span>
                    <h2>Featured Cohorts for 2026 - 2027</h2>
                    <p>Limited batch sizes of 25 students for personalized 1-on-1 doubt clearing.</p>
                  </div>

                  <div className="courses-grid">
                    {template.demoData?.courses?.map((course, idx) => (
                      <div key={idx} className="course-card">
                        <div className="course-badge">{course.badge}</div>
                        <h3>{course.name}</h3>
                        <div className="course-meta">
                          <span>🎯 <strong>Target:</strong> {course.target}</span>
                          <span>⏳ <strong>Duration:</strong> {course.duration}</span>
                          <span>📅 <strong>Schedule:</strong> {course.timing}</span>
                          <span style={{ color: '#ef4444', fontWeight: 600 }}>⚡ {course.seats}</span>
                        </div>
                        <div className="course-fee-row">
                          <span className="course-fee">{course.fee}</span>
                          <button
                            type="button"
                            className="mock-primary-btn"
                            onClick={() => openBookingModal(`Enrollment in ${course.name}`)}
                          >
                            Request Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 4-Step Methodology */}
                <section id="methodology" className="mock-section methodology-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">PROVEN PEDAGOGY</span>
                    <h2>The Apex 4-Step Learning Framework</h2>
                  </div>

                  <div className="methodology-grid">
                    {template.demoData?.methodology?.map((m, idx) => (
                      <div key={idx} className="method-card">
                        <div className="method-step">{m.step}</div>
                        <h4>{m.title}</h4>
                        <p>{m.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Faculty Showcase */}
                <section id="faculty" className="mock-section faculty-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">DISTINGUISHED EDUCATORS</span>
                    <h2>Learn from Proven Academic Leaders</h2>
                  </div>

                  <div className="faculty-grid">
                    {template.demoData?.faculty?.map((fac, idx) => (
                      <div key={idx} className="faculty-card">
                        <div className="faculty-avatar-box">
                          <User size={32} color="#2563eb" />
                        </div>
                        <h4>{fac.name}</h4>
                        <div className="fac-role">{fac.role}</div>
                        <div className="fac-degree">{fac.degree} • {fac.exp}</div>
                        <p className="fac-highlights">“{fac.highlights}”</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sample Student Results Showcase */}
                <section className="mock-section results-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">PROVEN TRACK RECORD</span>
                    <h2>Recent Milestone Achievements</h2>
                    <p style={{ color: '#94a3b8', fontSize: '12px' }}>* All results shown below are verified sample data points for presentation purposes.</p>
                  </div>

                  <div className="results-grid">
                    {template.demoData?.sampleResults?.map((res, idx) => (
                      <div key={idx} className="result-card">
                        <span className="result-badge-pill">{res.note}</span>
                        <div className="result-rank">{res.rank}</div>
                        <div className="result-exam">{res.exam}</div>
                        <p className="result-student">{res.student}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>APEX LEARNING HUB</h3>
                      <p>Tower A, Tech Knowledge Park, Outer Ring Rd, Bengaluru</p>
                      <p><strong>Counselor Helpline:</strong> +91 9643820888</p>
                    </div>
                    <div>
                      <h4>Admissions Office Hours</h4>
                      <p>Monday – Saturday: 8:30 AM – 8:00 PM</p>
                      <p>Sunday: 9:00 AM – 4:00 PM (Mock Test Desk)</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Apex Learning Hub. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                3. SALON & SPA DEMO (Lumina Sanctuary)
                ========================================================================= */}
            {(template.category === 'Salons and Spas' || template.slug === 'lumina-wellness') && (
              <div className="mock-site spa-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">LUMINA <span>SANCTUARY</span></div>
                  <div className="mock-nav-links">
                    <a href="#treatments">Rituals</a>
                    <a href="#specialists">Specialists</a>
                    <a href="#ambience">Sanctuary</a>
                    <a href="#memberships">VIP Pass</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Spa Treatment Appointment')}
                    >
                      Book Treatment
                    </button>
                  </div>
                </nav>

                <section className="mock-hero spa-hero" style={{ backgroundImage: `linear-gradient(rgba(24, 15, 30, 0.78), rgba(24, 15, 30, 0.78)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#d8b4fe' }}>HOLISTIC BOTANICAL WELLNESS</span>
                    <h1>Reclaim Balance.<br /><em>Restore Radiance.</em></h1>
                    <p>Therapeutic botanical massages, advanced oxygen facials, and calming head-spa rituals in an architectural sanctuary.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => openBookingModal('Spa Treatment Appointment')}
                      >
                        Reserve Your Ritual <Sparkles size={16} />
                      </button>
                      <button
                        type="button"
                        className="mock-secondary-btn"
                        onClick={() => document.getElementById('treatments')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        View Treatment Menu
                      </button>
                    </div>
                  </div>
                </section>

                {/* Treatment Menu with Categories */}
                <section id="treatments" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">SIGNATURE EXPERIENCES</span>
                    <h2>Curated Treatment Menu</h2>
                    <p>Botanical cold-pressed elixirs and clinical skin sculpting.</p>
                  </div>

                  <div className="menu-category-tabs">
                    {template.demoData?.treatmentCategories?.map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        className={`menu-tab ${spaCategoryTab === cat ? 'active' : ''}`}
                        onClick={() => setSpaCategoryTab(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="treatments-grid">
                    {template.demoData?.treatments
                      ?.filter((t) => !spaCategoryTab || t.category === spaCategoryTab)
                      ?.map((t, idx) => (
                        <div key={idx} className="treatment-card">
                          <div className="treatment-top">
                            <span className="t-tag">{t.tag}</span>
                            <span className="t-time"><Clock size={12} /> {t.time}</span>
                          </div>
                          <h3>{t.title}</h3>
                          <p className="t-desc">{t.desc}</p>
                          <div className="t-footer">
                            <span className="t-price">{t.price}</span>
                            <button
                              type="button"
                              className="mock-primary-btn"
                              onClick={() => openBookingModal(`Booking: ${t.title}`)}
                            >
                              Book Slot
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Master Specialists */}
                <section id="specialists" className="mock-section specialists-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">MASTER PRACTITIONERS</span>
                    <h2>Expert Aestheticians &amp; Therapists</h2>
                  </div>

                  <div className="specialists-grid">
                    {template.demoData?.specialists?.map((spec, i) => (
                      <div key={i} className="specialist-card">
                        <div className="spec-avatar-circle">
                          <User size={28} color="#c084fc" />
                        </div>
                        <h4>{spec.name}</h4>
                        <div className="spec-role">{spec.role}</div>
                        <div className="spec-focus">Focus: {spec.focus}</div>
                        <div className="spec-exp">{spec.exp} Dedicated Practice</div>
                        <button
                          type="button"
                          className="mock-secondary-btn full-width"
                          style={{ marginTop: '12px' }}
                          onClick={() => {
                            setBookingFormData((prev) => ({ ...prev, specialist: spec.name }));
                            openBookingModal(`Appointment with ${spec.name}`);
                          }}
                        >
                          Book with {spec.name.split(' ')[0]}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Sanctuary Ambience Gallery */}
                <section id="ambience" className="mock-section ambience-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">IMMERSIVE SPACES</span>
                    <h2>The Sanctuary Atmosphere</h2>
                  </div>

                  <div className="ambience-gallery-grid">
                    {template.demoData?.ambienceGallery?.map((amb, i) => (
                      <div key={i} className="ambience-card">
                        <div className="ambience-img" style={{ backgroundImage: `url(${amb.img})` }} />
                        <div className="ambience-info">
                          <h4>{amb.title}</h4>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* VIP Membership Passes */}
                <section id="memberships" className="mock-section memberships-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">SANCTUARY VIP TIERS</span>
                    <h2>Monthly Wellness Memberships</h2>
                  </div>

                  <div className="memberships-grid">
                    {template.demoData?.memberships?.map((m, i) => (
                      <div key={i} className="membership-card">
                        <h3>{m.name}</h3>
                        <div className="membership-price">{m.price}</div>
                        <p>{m.desc}</p>
                        <button
                          type="button"
                          className="mock-primary-btn full-width"
                          onClick={() => openBookingModal(`VIP Membership: ${m.name}`)}
                        >
                          Join Sanctuary Membership
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>LUMINA SANCTUARY</h3>
                      <p>18 Crescent Promenade, Lavelle Road, Bengaluru</p>
                      <p><strong>Concierge:</strong> +91 9643820888</p>
                    </div>
                    <div>
                      <h4>Sanctuary Policy</h4>
                      <p>Please arrive 15 minutes prior to your treatment for tea ceremony.</p>
                      <p>All natural botanical products, zero synthetic parabens.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Lumina Sanctuary. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                4. REAL ESTATE DEMO (Haven & Prime)
                ========================================================================= */}
            {(template.category === 'Real Estate' || template.slug === 'haven-prime') && (
              <div className="mock-site realestate-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">HAVEN <span>&amp;</span> PRIME</div>
                  <div className="mock-nav-links">
                    <a href="#properties">Developments</a>
                    <a href="#radar">Amenity Radar</a>
                    <a href="#advisors">Advisory</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Private Site Tour Consultation')}
                    >
                      Schedule Private Tour
                    </button>
                  </div>
                </nav>

                <section className="mock-hero re-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.75), rgba(15, 23, 42, 0.75)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#fbbf24' }}>EXCLUSIVE RESIDENTIAL PORTFOLIO</span>
                    <h1>Distinguished Living.<br /><em>Iconic Addresses.</em></h1>
                    <p>Curating a private collection of luxury sea-facing penthouses, gated estate villas, and golf course residences.</p>

                    {/* Integrated Search / Filter Bar */}
                    <div className="re-search-filter-bar">
                      <div className="re-filter-group">
                        <label>Configuration</label>
                        <select value={reBedFilter} onChange={(e) => setReBedFilter(e.target.value)}>
                          <option value="All">All Configurations</option>
                          <option value="3 BHK">3 BHK Deck</option>
                          <option value="4 BHK">4 BHK Penthouse</option>
                          <option value="5 BHK">5 BHK Villa</option>
                        </select>
                      </div>
                      <div className="re-filter-group">
                        <label>Location</label>
                        <select defaultValue="All">
                          <option value="All">All Prime Regions</option>
                          <option value="Mumbai">Worli, Mumbai</option>
                          <option value="Goa">Assagao, Goa</option>
                          <option value="Gurgaon">Golf Course Rd, Gurgaon</option>
                          <option value="Alibaug">Alibaug Coastal</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        className="mock-primary-btn"
                        onClick={() => document.getElementById('properties')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Explore Listings ↓
                      </button>
                    </div>
                  </div>
                </section>

                {/* Properties Grid */}
                <section id="properties" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">PORTFOLIO HIGHLIGHTS</span>
                    <h2>Featured Prime Developments</h2>
                    <p>RERA registered, freehold title verified estates with private concierge.</p>
                  </div>

                  <div className="properties-grid">
                    {template.demoData?.properties
                      ?.filter((prop) => reBedFilter === 'All' || prop.beds.includes(reBedFilter))
                      ?.map((prop, idx) => (
                        <div key={idx} className="prop-card">
                          <div className="prop-img-box" style={{ backgroundImage: `url(${prop.img})` }}>
                            <span className="prop-badge">{prop.tag}</span>
                          </div>
                          <div className="prop-card-body">
                            <h3>{prop.title}</h3>
                            <p className="prop-loc"><MapPin size={14} /> {prop.location}</p>
                            <div className="prop-specs">
                              <span>🛏️ {prop.beds}</span>
                              <span>•</span>
                              <span>📐 {prop.area}</span>
                            </div>
                            <p className="prop-highlights">{prop.highlights}</p>
                            <div className="prop-footer">
                              <span className="prop-price">{prop.price}</span>
                              <button
                                type="button"
                                className="mock-primary-btn"
                                onClick={() => openBookingModal(`Private Viewing: ${prop.title}`)}
                              >
                                Schedule Tour
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Neighborhood Amenity Radar */}
                <section id="radar" className="mock-section radar-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">STRATEGIC PROXIMITY</span>
                    <h2>Neighborhood Amenity Radar</h2>
                  </div>

                  <div className="radar-grid">
                    {template.demoData?.amenitiesRadar?.map((item, i) => (
                      <div key={i} className="radar-card">
                        <div className="radar-time">{item.time}</div>
                        <h4>{item.label}</h4>
                        <p>{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* RERA Advisors */}
                <section id="advisors" className="mock-section advisors-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">LICENSED REALTORS</span>
                    <h2>Private Wealth Real Estate Advisory</h2>
                  </div>

                  <div className="advisors-grid">
                    {template.demoData?.advisors?.map((adv, i) => (
                      <div key={i} className="advisor-card">
                        <h4>{adv.name}</h4>
                        <div className="adv-role">{adv.role}</div>
                        <div className="adv-rera">RERA Reg: {adv.rera} • {adv.exp}</div>
                        <button
                          type="button"
                          className="mock-secondary-btn full-width"
                          style={{ marginTop: '10px' }}
                          onClick={() => openBookingModal(`Advisory Briefing with ${adv.name}`)}
                        >
                          Book Confidential Call
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>HAVEN &amp; PRIME LUXURY ESTATES</h3>
                      <p>Level 24, Sea View Towers, Worli, Mumbai</p>
                      <p><strong>Private Desk:</strong> +91 9643820888</p>
                    </div>
                    <div>
                      <h4>RERA Compliance</h4>
                      <p>All represented developments are registered under state RERA authorities.</p>
                      <p>Title deeds verified by senior property advocates.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Haven & Prime Luxury Estates. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                5. E-COMMERCE DEMO (Nordic Craft Studio)
                ========================================================================= */}
            {(template.category === 'E-commerce' || template.slug === 'nordic-craft') && (
              <div className="mock-site ecom-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">NORDIC <span>CRAFT</span></div>
                  <div className="mock-nav-links">
                    <a href="#products">Collection</a>
                    <a href="#materials">Craftsmanship</a>
                    <button
                      type="button"
                      className="mock-cart-btn"
                      onClick={() => setCartDrawerOpen(true)}
                      aria-label="Open cart drawer"
                    >
                      <ShoppingBag size={18} />
                      <span className="cart-count">
                        {cartItems.reduce((acc, item) => acc + item.qty, 0)}
                      </span>
                    </button>
                  </div>
                </nav>

                <section className="mock-hero ecom-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.65), rgba(15, 23, 42, 0.65)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#2dd4bf' }}>AUTUMN 2026 COLLECTION</span>
                    <h1>Intentional Living.<br /><em>Handcrafted Essentials.</em></h1>
                    <p>Sustainable ceramics, Belgian woven linen, and timeless homeware designed to endure generations.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Shop Collection <ShoppingBag size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                {/* Free shipping banner */}
                <div className="ecom-promo-bar">
                  <span>✨ Complimentary Express Shipping &amp; Insurance on Orders Over ₹3,000</span>
                </div>

                {/* Filterable Products Grid */}
                <section id="products" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">CURATED ARTIFACTS</span>
                    <h2>The Autumn Homeware Release</h2>
                  </div>

                  <div className="menu-category-tabs">
                    {['All', 'Coffee & Kitchen', 'Living & Decor', 'Ceramics', 'Aromatics'].map((cat) => (
                      <button
                        type="button"
                        key={cat}
                        className={`menu-tab ${ecomCategoryTab === cat ? 'active' : ''}`}
                        onClick={() => setEcomCategoryTab(cat)}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  <div className="products-grid">
                    {template.demoData?.products
                      ?.filter((p) => ecomCategoryTab === 'All' || p.category === ecomCategoryTab)
                      ?.map((prod) => (
                        <div key={prod.id} className="prod-card">
                          <div className="prod-img-box" style={{ backgroundImage: `url(${prod.img})` }}>
                            <span className="prod-tag">{prod.tag}</span>
                          </div>
                          <div className="prod-card-body">
                            <h3>{prod.name}</h3>
                            <p className="prod-desc">{prod.desc}</p>
                            <div className="prod-meta">
                              <span className="prod-rating">{prod.rating}</span>
                              <span className="prod-price">{prod.price}</span>
                            </div>
                            <button
                              type="button"
                              className="mock-primary-btn full-width"
                              onClick={() => addToCart(prod)}
                            >
                              <ShoppingBag size={14} /> Add to Bag
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </section>

                {/* Sustainable Craft Story */}
                <section id="materials" className="mock-section story-section">
                  <div className="story-grid">
                    <div className="story-text">
                      <span className="mock-eyebrow">ETHICAL PRODUCTION</span>
                      <h2>Rooted in Natural Earth Materials</h2>
                      <p>
                        Every piece in the Nordic Craft collection is hand-finished by independent artisan cooperatives using wild stoneware clays, chemical-free vegetable dyes, and FSC-certified timber.
                      </p>
                      <div className="story-stats">
                        <div className="stat-item">
                          <strong>100%</strong>
                          <span>Plastic-Free</span>
                        </div>
                        <div className="stat-item">
                          <strong>FSC</strong>
                          <span>Certified Woods</span>
                        </div>
                        <div className="stat-item">
                          <strong>Lifetime</strong>
                          <span>Quality Guarantee</span>
                        </div>
                      </div>
                    </div>
                    <div className="story-img-box" style={{ backgroundImage: `url(https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&q=80)` }} />
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>NORDIC CRAFT STUDIO</h3>
                      <p>Flagship Studio: 12 Indiranagar, Bengaluru</p>
                      <p><strong>Support:</strong> care@nordiccraft.sample</p>
                    </div>
                    <div>
                      <h4>Customer Service</h4>
                      <p>Worldwide DHL Express Shipping &amp; 30-Day Hassle-Free Returns.</p>
                      <p>Orders dispatched within 24 business hours.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Nordic Craft Studio. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                6. LOCAL SERVICE CONTRACTOR DEMO (ProFix Masters)
                ========================================================================= */}
            {(template.category === 'Local Service Businesses' || template.slug === 'profix-masters') && (
              <div className="mock-site contractor-theme">
                <div className="emergency-dispatch-banner">
                  <span>🚨 24/7 EMERGENCY DISPATCH ACTIVE: Master technician at your door in &lt; 60 mins</span>
                  <a href="tel:+919643820888" className="emergency-call-link">
                    <Phone size={14} /> Call Dispatch (+91 9643820888)
                  </a>
                </div>

                <nav className="mock-nav">
                  <div className="mock-brand">PROFIX <span>MASTERS</span></div>
                  <div className="mock-nav-links">
                    <a href="#services">Services &amp; Rates</a>
                    <a href="#guarantee">5-Point Guarantee</a>
                    <a href="#coverage">Coverage Radius</a>
                    <button
                      type="button"
                      className="mock-primary-btn danger-accent"
                      onClick={() => openBookingModal('Emergency Technician Dispatch')}
                    >
                      Book Dispatch
                    </button>
                  </div>
                </nav>

                <section className="mock-hero contractor-hero" style={{ backgroundImage: `linear-gradient(rgba(17, 24, 39, 0.88), rgba(17, 24, 39, 0.88)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#f87171' }}>LICENSED • INSURED • 100% UPFRONT PRICING</span>
                    <h1>Same-Day HVAC, Electrical &amp; Plumbing.<br /><em>Fixed Right the First Time.</em></h1>
                    <p>No overtime fees. Upfront transparent pricing. Police-verified background-checked master technicians.</p>

                    {/* Interactive Zip Code Checker */}
                    <div className="zip-checker-box">
                      <div className="zip-checker-label">Check Instant Same-Day Dispatch Radius:</div>
                      <form onSubmit={handleCheckZip} className="zip-form">
                        <input
                          type="text"
                          placeholder="Enter your 6-digit Postal Code (e.g. 560038, 110001)"
                          value={zipInput}
                          onChange={(e) => setZipInput(e.target.value)}
                        />
                        <button type="submit" className="mock-primary-btn danger-accent">
                          Check Dispatch Radius
                        </button>
                      </form>
                      {zipResult && (
                        <div className={`zip-status-box ${zipResult.available ? 'success' : 'warn'}`}>
                          {zipResult.message}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* 6 Flat-Rate Repair Services */}
                <section id="services" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">UPFRONT FLAT-RATE PRICING</span>
                    <h2>Core Repair &amp; Maintenance Services</h2>
                    <p>Transparent rates approved before work begins. No unexpected surprises.</p>
                  </div>

                  <div className="services-list-grid">
                    {template.demoData?.services?.map((srv, idx) => (
                      <div key={idx} className="srv-card">
                        <div className="srv-top">
                          <span className="srv-badge">{srv.badge}</span>
                          <span className="srv-warranty">{srv.warranty}</span>
                        </div>
                        <h4>{srv.title}</h4>
                        <p>{srv.desc}</p>
                        <div className="srv-footer">
                          <span className="srv-price">{srv.price}</span>
                          <button
                            type="button"
                            className="mock-primary-btn danger-accent"
                            onClick={() => openBookingModal(`Service Request: ${srv.title}`)}
                          >
                            Book Technician
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 5-Point Guarantee */}
                <section id="guarantee" className="mock-section guarantee-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">THE PROFIX PROMISE</span>
                    <h2>Our 5-Point Homeowner Guarantee</h2>
                  </div>

                  <div className="guarantee-grid">
                    {template.demoData?.guarantees?.map((g, idx) => (
                      <div key={idx} className="guarantee-item">
                        <div className="guarantee-num">0{idx + 1}</div>
                        <h4>{g.title}</h4>
                        <p>{g.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>PROFIX MASTERS</h3>
                      <p>Central Dispatch Hub: Koramangala &amp; Indiranagar, Bengaluru</p>
                      <p><strong>Emergency Hotline:</strong> +91 9643820888</p>
                    </div>
                    <div>
                      <h4>24/7 Dispatch Terms</h4>
                      <p>Flat-rate pricing is locked upon technician diagnostic inspection.</p>
                      <p>All work backed by a 90-day comprehensive parts & labor warranty.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 ProFix Masters. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                7. FREELANCER / PERSONAL BRAND DEMO (Elena Vance)
                ========================================================================= */}
            {(template.category === 'Freelancers and Personal Brands' || template.slug === 'elena-vance') && (
              <div className="mock-site personal-brand-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">ELENA <span>VANCE</span></div>
                  <div className="mock-nav-links">
                    <a href="#services">Advisory</a>
                    <a href="#cases">Case Studies</a>
                    <a href="#stack">Methodology</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('30-Minute Strategy Briefing')}
                    >
                      Book Strategy Call
                    </button>
                  </div>
                </nav>

                <section className="mock-hero brand-hero">
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow">FRACTIONAL BRAND STRATEGIST &amp; ADVISOR</span>
                    <h1>I Help Category-Defining Founders Clarify Their Story &amp; Scale.</h1>
                    <p>Advising high-growth technology, venture-backed fintech, and luxury consumer founders on narrative design, category creation, and market expansion.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => openBookingModal('30-Minute Strategy Briefing')}
                      >
                        Schedule 30-Min Briefing <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        className="mock-secondary-btn"
                        onClick={() => document.getElementById('cases')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Explore Case Studies ↓
                      </button>
                    </div>
                  </div>
                </section>

                {/* 4 Advisory Services */}
                <section id="services" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">ADVISORY ENGAGEMENTS</span>
                    <h2>How We Partner</h2>
                    <p>High-leverage strategic sprints designed for ambitious founders and C-suite teams.</p>
                  </div>

                  <div className="advisory-services-grid">
                    {template.demoData?.services?.map((srv, idx) => (
                      <div key={idx} className="advisory-card">
                        <h3>{srv.title}</h3>
                        <p><strong>Deliverables:</strong> {srv.deliverable}</p>
                        <div className="advisory-meta">
                          <span>⏳ {srv.timeline}</span>
                          <span className="advisory-price">{srv.investment}</span>
                        </div>
                        <button
                          type="button"
                          className="mock-primary-btn full-width"
                          style={{ marginTop: '14px' }}
                          onClick={() => openBookingModal(`Inquiry: ${srv.title}`)}
                        >
                          Book Briefing for this Scope
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* 3 Detailed Sample Case Studies */}
                <section id="cases" className="mock-section case-studies-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">PROVEN CLIENT IMPACT</span>
                    <h2>Featured Strategic Case Studies</h2>
                  </div>

                  <div className="case-studies-list">
                    {template.demoData?.caseStudies?.map((cs) => (
                      <div key={cs.id} className="case-study-card">
                        <div className="cs-header">
                          <span className="cs-badge">{cs.badge}</span>
                          <span className="cs-concept-tag">{cs.tag}</span>
                        </div>
                        <h3>{cs.client}</h3>
                        <div className="cs-block">
                          <strong>The Strategic Challenge:</strong>
                          <p>{cs.problem}</p>
                        </div>
                        <div className="cs-block">
                          <strong>The Narrative Repositioning:</strong>
                          <p>{cs.strategy}</p>
                        </div>
                        <div className="cs-impact-box">
                          <strong>Measurable Business Impact:</strong>
                          <p>{cs.impact}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Skills Stack */}
                <section id="stack" className="mock-section stack-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">CORE COMPETENCIES</span>
                    <h2>Advisory Methodology &amp; Stack</h2>
                  </div>

                  <div className="skills-pill-cloud">
                    {template.demoData?.skillsStack?.map((skill, idx) => (
                      <div key={idx} className="skill-pill">
                        <CheckCircle2 size={16} color="#10100f" />
                        <span>{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>ELENA VANCE</h3>
                      <p>Strategic Brand &amp; Executive Advisory</p>
                      <p>Bengaluru • London • San Francisco</p>
                    </div>
                    <div>
                      <h4>Direct Calendar</h4>
                      <p>Limited to 2 concurrent quarterly advisory retainers to ensure deep focus.</p>
                      <p><strong>Direct Inquiries:</strong> thesortedclub@gmail.com</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Elena Vance Advisory. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                8. STARTUP SAAS LANDING PAGE DEMO (FlowGrid AI)
                ========================================================================= */}
            {(template.category === 'Startup Landing Pages' || template.slug === 'flowgrid-ai') && (
              <div className="mock-site saas-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">FLOWGRID <span>AI</span></div>
                  <div className="mock-nav-links">
                    <a href="#features">Features</a>
                    <a href="#pipeline">Architecture</a>
                    <a href="#code">Developer API</a>
                    <a href="#pricing">Pricing</a>
                    <a href="#faq">FAQs</a>
                    <button
                      type="button"
                      className="mock-primary-btn cyan-accent"
                      onClick={() => openBookingModal('SaaS 14-Day Free Trial')}
                    >
                      Start Free Trial
                    </button>
                  </div>
                </nav>

                <section className="mock-hero saas-hero">
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#22d3ee' }}>DEVELOPER-FIRST AI ORCHESTRATION</span>
                    <h1>Automate Complex Workflows.<br /><em>Zero Boilerplate.</em></h1>
                    <p>The high-throughput workflow engine for AI agents, multi-step webhooks, and real-time database sync.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn cyan-accent large"
                        onClick={() => openBookingModal('SaaS 14-Day Free Trial')}
                      >
                        Start Building Free (14-Day Trial) <ArrowRight size={16} />
                      </button>
                      <button
                        type="button"
                        className="mock-secondary-btn"
                        onClick={() => document.getElementById('code')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Explore Interactive API ↓
                      </button>
                    </div>
                  </div>
                </section>

                {/* 3 Interactive Feature Tabs */}
                <section id="features" className="mock-section saas-features-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">ENGINEERED FOR SCALE</span>
                    <h2>Deterministic Orchestration Engine</h2>
                  </div>

                  <div className="saas-feature-tab-controls">
                    {template.demoData?.featureTabs?.map((tab) => (
                      <button
                        type="button"
                        key={tab.id}
                        className={`saas-feature-tab-btn ${saasActiveTabId === tab.id ? 'active' : ''}`}
                        onClick={() => setSaasActiveTabId(tab.id)}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const activeTab = template.demoData?.featureTabs?.find((t) => t.id === saasActiveTabId) || template.demoData?.featureTabs?.[0];
                    if (!activeTab) return null;
                    return (
                      <div className="saas-tab-content-card">
                        <div className="tab-left">
                          <h3>{activeTab.headline}</h3>
                          <p>{activeTab.desc}</p>
                          <ul className="tab-points">
                            {activeTab.points?.map((pt, i) => (
                              <li key={i}>
                                <CheckCircle2 size={16} color="#06b6d4" />
                                <span>{pt}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="tab-right">
                          <div className="terminal-preview-box">
                            <div className="terminal-bar">
                              <span className="dot dot-red" />
                              <span className="dot dot-yellow" />
                              <span className="dot dot-green" />
                              <span className="terminal-title">flowgrid-pipeline.ts</span>
                            </div>
                            <pre className="terminal-code">
                              <code>{activeTab.codePreview}</code>
                            </pre>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </section>

                {/* 3-Step Pipeline Architecture */}
                <section id="pipeline" className="mock-section pipeline-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">HOW IT WORKS</span>
                    <h2>End-to-End Pipeline Execution in &lt; 50ms</h2>
                  </div>

                  <div className="pipeline-steps-grid">
                    {template.demoData?.pipelineSteps?.map((ps, idx) => (
                      <div key={idx} className="pipeline-step-card">
                        <div className="pipeline-step-num">{ps.step}</div>
                        <h4>{ps.title}</h4>
                        <p>{ps.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Live Code Playground */}
                <section id="code" className="mock-section code-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">DEVELOPER EXPERIENCE</span>
                    <h2>Production-Ready SDK in 3 Lines</h2>
                  </div>

                  <div className="code-playground-box">
                    <div className="code-lang-header">
                      <div className="code-lang-tabs">
                        {['python', 'node', 'curl'].map((lang) => (
                          <button
                            type="button"
                            key={lang}
                            className={`lang-tab ${saasCodeLang === lang ? 'active' : ''}`}
                            onClick={() => setSaasCodeLang(lang)}
                          >
                            {lang.toUpperCase()}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="copy-code-btn"
                        onClick={handleCopyCode}
                        title="Copy code snippet to clipboard"
                      >
                        {copiedCode ? (
                          <>
                            <Check size={14} color="#22c55e" /> Copied!
                          </>
                        ) : (
                          <>
                            <Copy size={14} /> Copy Snippet
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="code-display">
                      <code>{codeSnippets[saasCodeLang]}</code>
                    </pre>
                  </div>
                </section>

                {/* Tiered SaaS Pricing with Monthly / Annual Toggle */}
                <section id="pricing" className="mock-section saas-pricing-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">TRANSPARENT PRICING</span>
                    <h2>Choose the Plan Built for Your Scale</h2>
                    <div className="billing-toggle-row">
                      <span className={!saasBillingAnnual ? 'active' : ''}>Monthly Billing</span>
                      <button
                        type="button"
                        className={`toggle-pill ${saasBillingAnnual ? 'annual' : ''}`}
                        onClick={() => setSaasBillingAnnual(!saasBillingAnnual)}
                        aria-label="Toggle annual billing discount"
                      >
                        <span className="toggle-thumb" />
                      </button>
                      <span className={saasBillingAnnual ? 'active' : ''}>
                        Annual Billing <small className="discount-pill">Save 20%</small>
                      </span>
                    </div>
                  </div>

                  <div className="saas-pricing-grid">
                    {template.demoData?.pricingPlans?.map((plan, idx) => (
                      <div key={idx} className={`saas-price-card ${plan.popular ? 'popular' : ''}`}>
                        {plan.popular && <div className="popular-badge">Most Popular</div>}
                        <h3>{plan.name}</h3>
                        <p className="plan-desc">{plan.desc}</p>
                        <div className="plan-price">
                          {saasBillingAnnual ? plan.priceAnnual : plan.priceMonthly}
                        </div>
                        <ul className="plan-features">
                          {plan.features?.map((f, i) => (
                            <li key={i}>
                              <CheckCircle2 size={14} color="#06b6d4" />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                        <button
                          type="button"
                          className={`mock-primary-btn full-width ${plan.popular ? 'cyan-accent' : ''}`}
                          onClick={() => openBookingModal(`Free Trial for ${plan.name}`)}
                        >
                          Start Free Trial with {plan.name}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* SaaS FAQs */}
                <section id="faq" className="mock-section saas-faq-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">FREQUENT QUESTIONS</span>
                    <h2>Technical &amp; Deployment Questions</h2>
                  </div>

                  <div className="saas-faq-list">
                    {template.demoData?.faqs?.map((faq, idx) => {
                      const isOpen = saasOpenFaq === idx;
                      return (
                        <div key={idx} className={`saas-faq-item ${isOpen ? 'open' : ''}`}>
                          <button
                            type="button"
                            className="saas-faq-q"
                            onClick={() => setSaasOpenFaq(isOpen ? null : idx)}
                          >
                            <span>{faq.q}</span>
                            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                          {isOpen && <div className="saas-faq-a">{faq.a}</div>}
                        </div>
                      );
                    })}
                  </div>
                </section>

                {/* Footer */}
                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>FLOWGRID AI</h3>
                      <p>The Developer-First AI Orchestration Layer</p>
                      <p><strong>Status:</strong> All Systems Operational (99.99%)</p>
                    </div>
                    <div>
                      <h4>Developer Resources</h4>
                      <p>API Documentation • GitHub SDKs • Discord Community</p>
                      <p>SOC2 Type II Certified &amp; GDPR Compliant.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 FlowGrid AI. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                9. BOOKING WEBSITES / RETREATS (Zenith Retreats)
                ========================================================================= */}
            {(template.category === 'Booking Websites' || template.slug === 'zenith-retreats') && (
              <div className="mock-site retreat-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">ZENITH <span>RETREATS</span></div>
                  <div className="mock-nav-links">
                    <a href="#rooms">Accommodations</a>
                    <a href="#itinerary">Daily Itinerary</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Retreat Spot Reservation')}
                    >
                      Reserve Spot
                    </button>
                  </div>
                </nav>

                <section className="mock-hero retreat-hero" style={{ backgroundImage: `linear-gradient(rgba(15, 23, 42, 0.68), rgba(15, 23, 42, 0.68)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow" style={{ color: '#86efac' }}>7-DAY HIMALAYAN IMMERSION</span>
                    <h1>Reconnect with Stillness.<br /><em>Reclaim Your Mind.</em></h1>
                    <p>Daily guided meditation, farm-to-table organic cuisine, and mountain ridge walks in cedar forests in Rishikesh Valley.</p>
                    <div className="mock-hero-actions">
                      <button
                        type="button"
                        className="mock-primary-btn large"
                        onClick={() => openBookingModal('Retreat Spot Reservation')}
                      >
                        Reserve Your Spot <Calendar size={16} />
                      </button>
                    </div>
                  </div>
                </section>

                <section id="rooms" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">SANCTUARY SUITES</span>
                    <h2>Choose Your Accommodation</h2>
                  </div>

                  <div className="rooms-grid">
                    {template.demoData?.rooms?.map((room, idx) => (
                      <div key={idx} className="room-card">
                        <span className="room-tag">{room.tag}</span>
                        <h3>{room.name}</h3>
                        <p>{room.desc}</p>
                        <div className="room-footer">
                          <div>
                            <div className="room-price">{room.price}</div>
                            <small>{room.capacity}</small>
                          </div>
                          <button
                            type="button"
                            className="mock-primary-btn"
                            onClick={() => openBookingModal(`Booking: ${room.name}`)}
                          >
                            Reserve Room
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section id="itinerary" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">DAILY RHYTHM</span>
                    <h2>Sample Daily Itinerary</h2>
                  </div>

                  <div className="itinerary-timeline">
                    {template.demoData?.itinerary?.map((it, idx) => (
                      <div key={idx} className="itinerary-item">
                        <div className="it-time">{it.time}</div>
                        <div className="it-details">
                          <h4>{it.activity}</h4>
                          <span className="it-loc"><MapPin size={12} /> {it.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>ZENITH WELLNESS RETREATS</h3>
                      <p>Valley of the Rishis, Uttarakhand, Himalayas</p>
                    </div>
                    <div>
                      <h4>Travel Concierge</h4>
                      <p>Transfers arranged from Dehradun Airport (DED).</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Zenith Retreats. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}

            {/* =========================================================================
                10. PORTFOLIO WEBSITES (Atelier Noir)
                ========================================================================= */}
            {(template.category === 'Portfolio Websites' || template.slug === 'atelier-noir') && (
              <div className="mock-site portfolio-theme">
                <nav className="mock-nav">
                  <div className="mock-brand">ATELIER <span>NOIR</span></div>
                  <div className="mock-nav-links">
                    <a href="#works">Selected Works</a>
                    <a href="#studio">Philosophy</a>
                    <button
                      type="button"
                      className="mock-primary-btn"
                      onClick={() => openBookingModal('Architectural Commission Inquiry')}
                    >
                      Commission Project
                    </button>
                  </div>
                </nav>

                <section className="mock-hero portfolio-hero" style={{ backgroundImage: `linear-gradient(rgba(10, 10, 10, 0.8), rgba(10, 10, 10, 0.8)), url(${template.heroImage})` }}>
                  <div className="mock-hero-content">
                    <span className="mock-eyebrow">ARCHITECTURE &amp; SPATIAL PRACTICE</span>
                    <h1>Sculpting Space.<br /><em>Defining Modernity.</em></h1>
                    <p>Monolithic residences, cultural pavilions, and sensory brand spaces across Tokyo, Berlin, and Mumbai.</p>
                  </div>
                </section>

                <section id="works" className="mock-section">
                  <div className="mock-section-head">
                    <span className="mock-eyebrow">ARCHIVE</span>
                    <h2>Selected Architectural Works</h2>
                  </div>

                  <div className="works-grid">
                    {template.demoData?.projects?.map((proj, idx) => (
                      <div key={idx} className="work-card">
                        <div className="work-img" style={{ backgroundImage: `url(${proj.img})` }}>
                          <span className="work-tag">{proj.tag}</span>
                        </div>
                        <div className="work-info">
                          <span className="work-cat">{proj.category} • {proj.year}</span>
                          <h3>{proj.title}</h3>
                          <p>{proj.desc}</p>
                          <div className="work-loc"><MapPin size={14} /> {proj.location}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <footer className="mock-footer">
                  <div className="mock-footer-grid">
                    <div>
                      <h3>ATELIER NOIR</h3>
                      <p>Tokyo • Berlin • Mumbai</p>
                    </div>
                    <div>
                      <h4>Commissions</h4>
                      <p>Taking select architectural and interior commissions for 2026/2027.</p>
                    </div>
                  </div>
                  <div className="mock-footer-bottom">
                    <small>© 2026 Atelier Noir. Demo Concept crafted by The Sorted Club.</small>
                  </div>
                </footer>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Slide-out Shopping Cart Drawer (E-Commerce Demo) */}
      {cartDrawerOpen && (
        <div className="mock-cart-backdrop" onClick={() => setCartDrawerOpen(false)}>
          <div className="mock-cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h3>Shopping Bag ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</h3>
              <button
                type="button"
                className="cart-close-btn"
                onClick={() => setCartDrawerOpen(false)}
                aria-label="Close cart"
              >
                <X size={18} />
              </button>
            </div>

            {/* Free shipping progress calculation */}
            <div className="cart-shipping-bar-box">
              <div className="shipping-bar-text">
                {freeShippingRemaining > 0 ? (
                  <span>Add <strong>₹{freeShippingRemaining.toLocaleString()}</strong> more for Free Express Shipping!</span>
                ) : (
                  <span style={{ color: '#0f766e', fontWeight: 600 }}>🎉 You have unlocked Free Express Shipping!</span>
                )}
              </div>
              <div className="shipping-bar-track">
                <div
                  className="shipping-bar-fill"
                  style={{ width: `${Math.min(100, (cartSubtotal / freeShippingThreshold) * 100)}%` }}
                />
              </div>
            </div>

            <div className="cart-items-list">
              {cartItems.length === 0 ? (
                <div className="empty-cart-msg">Your shopping bag is currently empty.</div>
              ) : (
                cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-info">
                      <h4>{item.name}</h4>
                      <span>₹{item.price.toLocaleString()}</span>
                    </div>
                    <div className="cart-qty-stepper">
                      <button type="button" onClick={() => updateCartQty(item.id, -1)} aria-label="Decrease quantity">
                        <Minus size={12} />
                      </button>
                      <span>{item.qty}</span>
                      <button type="button" onClick={() => updateCartQty(item.id, 1)} aria-label="Increase quantity">
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      type="button"
                      className="cart-item-remove-btn"
                      onClick={() => removeCartItem(item.id)}
                      title="Remove item"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="cart-footer">
              <div className="cart-subtotal-row">
                <span>Subtotal</span>
                <strong>₹{cartSubtotal.toLocaleString()}</strong>
              </div>
              <p className="shipping-note">Free express shipping & insurance included</p>
              <button
                type="button"
                className="mock-primary-btn full-width"
                disabled={cartItems.length === 0}
                onClick={() => {
                  setCartDrawerOpen(false);
                  openBookingModal('Checkout Order (Test Run)');
                }}
              >
                Proceed to Checkout (₹{cartSubtotal.toLocaleString()})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Demo Action Modal */}
      {bookingModalOpen && (
        <div className="mock-booking-backdrop" onClick={() => setBookingModalOpen(false)}>
          <div className="mock-booking-modal" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="modal-close-btn"
              onClick={() => setBookingModalOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {bookingSuccess ? (
              <div className="mock-booking-success">
                <CheckCircle2 size={44} color="#22c55e" />
                <h3 style={{ fontSize: '20px', marginTop: '12px', marginBottom: '8px' }}>Simulated Request Confirmed!</h3>
                <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
                  This is a live interactive demonstration of the <strong>{template.name}</strong> customer booking funnel.
                </p>
                <div className="demo-confirmation-summary">
                  <div><strong>Action:</strong> {bookingType}</div>
                  <div><strong>Name:</strong> {bookingFormData.name}</div>
                  <div><strong>Email:</strong> {bookingFormData.email}</div>
                  <div><strong>Phone:</strong> {bookingFormData.phone}</div>
                  <div><strong>Date / Time:</strong> {bookingFormData.date} at {bookingFormData.time}</div>
                  {bookingFormData.notes && <div><strong>Notes:</strong> {bookingFormData.notes}</div>}
                </div>
                <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="primary full-width"
                    onClick={() => {
                      setBookingModalOpen(false);
                      onOpenInquiry({ template });
                    }}
                  >
                    Build this for My Business <ArrowRight size={15} />
                  </button>
                  <button
                    type="button"
                    className="btn-secondary full-width"
                    onClick={() => setBookingModalOpen(false)}
                  >
                    Close Demo Modal
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoBookingSubmit} className="mock-booking-form">
                <div className="eyebrow" style={{ color: 'var(--muted)' }}>DEMO INTERACTION</div>
                <h3 style={{ fontSize: '18px', margin: '4px 0 8px' }}>{bookingType}</h3>
                <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '16px' }}>
                  Simulate how your customers will interact with your production website.
                </p>

                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={bookingFormData.name}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    value={bookingFormData.email}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone / WhatsApp Number</label>
                  <input
                    type="tel"
                    value={bookingFormData.phone}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Preferred Date</label>
                    <input
                      type="date"
                      value={bookingFormData.date}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, date: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Preferred Time</label>
                    <input
                      type="time"
                      value={bookingFormData.time}
                      onChange={(e) => setBookingFormData({ ...bookingFormData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Specific Requests / Notes</label>
                  <textarea
                    rows={2}
                    value={bookingFormData.notes}
                    onChange={(e) => setBookingFormData({ ...bookingFormData, notes: e.target.value })}
                    placeholder="e.g. Dietary preferences, party size, or questions"
                  />
                </div>

                <button type="submit" className="primary full-width" style={{ marginTop: '14px' }}>
                  Confirm Simulated Booking <ArrowRight size={15} />
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
