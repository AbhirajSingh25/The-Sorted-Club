import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const [headerBottom, setHeaderBottom] = useState(72);
  const navRef = useRef(null);
  const menuButtonRef = useRef(null);
  const drawerRef = useRef(null);
  const scrollYRef = useRef(0);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [currentPath]);

  // Synchronize header bottom position on resize or scroll while open
  const updateHeaderBottom = useCallback(() => {
    if (navRef.current) {
      const rect = navRef.current.getBoundingClientRect();
      setHeaderBottom(rect.bottom > 0 ? rect.bottom : 72);
    }
  }, []);

  // Keyboard accessibility: Close mobile drawer on Escape key & manage focus
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen]);

  // Scroll lock and exact scroll position restoration
  useEffect(() => {
    if (mobileMenuOpen) {
      const currentScroll = window.scrollY;
      scrollYRef.current = currentScroll;
      updateHeaderBottom();

      // Lock document scrolling
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      // Keep scroll position stable
      if (window.scrollY !== currentScroll) {
        window.scrollTo(0, currentScroll);
      }

      window.addEventListener('resize', updateHeaderBottom);
      window.addEventListener('scroll', updateHeaderBottom, { passive: true });
    } else {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';

      // Cleanly restore scroll position if shifted
      if (typeof window !== 'undefined' && scrollYRef.current > 0) {
        if (Math.abs(window.scrollY - scrollYRef.current) > 1) {
          window.scrollTo(0, scrollYRef.current);
        }
      }

      window.removeEventListener('resize', updateHeaderBottom);
      window.removeEventListener('scroll', updateHeaderBottom);
    }

    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      window.removeEventListener('resize', updateHeaderBottom);
      window.removeEventListener('scroll', updateHeaderBottom);
    };
  }, [mobileMenuOpen, updateHeaderBottom]);

  const toggleMobileMenu = () => {
    if (!mobileMenuOpen) {
      scrollYRef.current = window.scrollY;
      if (navRef.current) {
        const rect = navRef.current.getBoundingClientRect();
        setHeaderBottom(rect.bottom > 0 ? rect.bottom : 72);
      }
      setMobileMenuOpen(true);
    } else {
      closeMenu();
    }
  };

  const closeMenu = () => {
    setMobileMenuOpen(false);
    if (menuButtonRef.current) {
      menuButtonRef.current.focus();
    }
  };

  const handleNavClick = (path, e) => {
    if (e) e.preventDefault();
    closeMenu();

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
          ref={menuButtonRef}
          type="button"
          className="menu-button"
          onClick={toggleMobileMenu}
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
            ref={drawerRef}
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
