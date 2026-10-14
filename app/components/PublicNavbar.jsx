import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { TRANSITIONS } from '../utils/motion';

export default function PublicNavbar({
  onNavigate,
  onOpenInquiry,
  currentPath = '/',
  children
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Keyboard accessibility: Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Lock body scroll when mobile menu is open to prevent background scrolling
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileMenuOpen]);

  const handleNavClick = (path, e) => {
    if (e) e.preventDefault();
    setMobileMenuOpen(false);
    if (path.startsWith('#')) {
      const el = document.querySelector(path);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState({}, '', path);
      } else {
        onNavigate(`/${path}`);
      }
    } else {
      onNavigate(path);
    }
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <motion.nav
      className="landing-nav public-nav"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={TRANSITIONS.editorial}
    >
      <div
        className="brand"
        style={{ cursor: 'pointer' }}
        onClick={() => handleNavClick('/')}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavClick('/');
          }
        }}
      >
        THE SORTED <span>CLUB</span>
      </div>

      <button
        type="button"
        className="menu-button"
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={mobileMenuOpen}
        aria-controls="public-mobile-navlinks"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        id="public-mobile-navlinks"
        className={`navlinks ${mobileMenuOpen ? 'open' : ''}`}
      >
        {children ? (
          typeof children === 'function' ? children({ closeMenu, handleNavClick }) : children
        ) : (
          <>
            <a
              href="/services"
              className={currentPath.startsWith('/services') ? 'active' : ''}
              onClick={(e) => handleNavClick('/services', e)}
            >
              Services
            </a>
            <a
              href="/templates"
              className={currentPath.startsWith('/templates') ? 'active' : ''}
              onClick={(e) => handleNavClick('/templates', e)}
            >
              Templates
            </a>
            <a
              href="/pricing"
              className={currentPath.startsWith('/pricing') ? 'active' : ''}
              onClick={(e) => handleNavClick('/pricing', e)}
            >
              Pricing
            </a>
            <a
              href="#founder"
              onClick={(e) => handleNavClick('#founder', e)}
            >
              About
            </a>
            <motion.button
              type="button"
              className="navcta"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={TRANSITIONS.buttonSpring}
              onClick={() => {
                closeMenu();
                onOpenInquiry?.({ service: 'Website / Build' });
              }}
            >
              Get in Touch <ArrowRight size={16} />
            </motion.button>
          </>
        )}
      </div>
    </motion.nav>
  );
}
