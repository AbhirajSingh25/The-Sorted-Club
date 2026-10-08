import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

export default function MobileSplashScreen({ onComplete }) {
  const [stage, setStage] = useState('entering'); // 'entering' | 'holding' | 'exiting' | 'done'

  useEffect(() => {
    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    // Sequence timing
    // 0-600ms: logo and brand reveal
    // 950ms: start exit fade
    // 1200ms: finish and cleanup
    const holdTimer = setTimeout(() => {
      setStage('exiting');
    }, 950);

    const completeTimer = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 1220);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <motion.div
      className="mobile-splash-screen"
      initial={{ opacity: 1 }}
      animate={{ opacity: stage === 'exiting' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <div className="mobile-splash-content">
        {/* Exact supplied brand logo */}
        <motion.div
          className="mobile-splash-logo-wrap"
          initial={{ opacity: 0, y: 12, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
        >
          <img
            src="/app-logo.png"
            alt="The Sorted Club Logo"
            className="mobile-splash-logo-img"
          />
        </motion.div>

        {/* Brand identity titles */}
        <motion.div
          className="mobile-splash-text-wrap"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
        >
          <div className="mobile-splash-brand-title">THE SORTED CLUB</div>
          <div className="mobile-splash-brand-tagline">YOUR BUSINESS. SORTED.</div>
        </motion.div>
      </div>
    </motion.div>
  );
}
