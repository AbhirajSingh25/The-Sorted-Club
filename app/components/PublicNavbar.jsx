import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [headerBottom, setHeaderBottom] = useState(68);
  const navRef = useRef(null);

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

  // Lock scroll cleanly via documentElement when mobile menu is open without breaking sticky position
  useEffect(() => {
    if (mobileMenuOpen) {
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom > 0 ? rect.bottom : 68);
      }
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.documentElement.style.overflow = '';
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

  const navContent = children ? (
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
  );

  return (
    <>
      <motion.nav
        ref={navRef}
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

        {/* Desktop inline nav links */}
        <div className="navlinks desktop-navlinks">
          {navContent}
        </div>
      </motion.nav>

      {/* Viewport-level Mobile Navigation Drawer & Backdrop via React Portal */}
      {typeof document !== 'undefined' && mobileMenuOpen && createPortal(
        <>
          <div
            className="mobile-nav-backdrop"
            onClick={closeMenu}
            onTouchMove={(e) => e.preventDefault()}
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 9998
            }}
          />
          <div
            id="public-mobile-navlinks"
            className="navlinks open"
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            style={{
              position: 'fixed',
              top: `${headerBottom}px`,
              left: 0,
              right: 0,
              maxHeight: `calc(100dvh - ${headerBottom}px)`,
              zIndex: 9999
            }}
          >
            {navContent}
          </div>
        </>,
        document.body
      )}
    </>
  );
}
