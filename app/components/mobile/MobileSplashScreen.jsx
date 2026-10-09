import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Premium Mobile Brand Splash Screen
 * Exact 2.7s editorial brand sequence:
 * 0.00–0.35s: Background resolves into warm paper color
 * 0.25–0.95s: Refined mask reveal of THE SORTED CLUB wordmark
 * 0.80–1.45s: Final accent dot settles into place
 * 1.20–1.90s: Tagline "YOUR BUSINESS. SORTED." reveals with upward drift
 * 1.90–2.35s: Hold complete brand composition
 * 2.35–2.75s: Smooth crossfade transition into admin shell
 */
export default function MobileSplashScreen({ onComplete }) {
  const [stage, setStage] = useState('entering'); // 'entering' | 'holding' | 'exiting' | 'done'

  useEffect(() => {
    // Accessibility check: immediately complete if reduced motion requested
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      if (onComplete) onComplete();
      return;
    }

    // Sequence timeline
    const exitTimer = setTimeout(() => {
      setStage('exiting');
    }, 2350);

    const finishTimer = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 2750);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(finishTimer);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  return (
    <motion.div
      className="mobile-splash-screen"
      initial={{ opacity: 0.96 }}
      animate={{ opacity: stage === 'exiting' ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden="true"
    >
      <div className="mobile-splash-content">
        {/* Editorial Wordmark Reveal */}
        <div className="mobile-splash-wordmark-container">
          <motion.div
            className="mobile-splash-wordmark-wrap"
            initial={{ opacity: 0, y: 22, clipPath: 'inset(100% 0% 0% 0%)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)' }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1],
              delay: 0.25
            }}
          >
            <span className="mobile-splash-brand-main">THE SORTED </span>
            <span className="mobile-splash-brand-club">CLUB</span>
            {/* Animated Dot Accent */}
            <motion.span
              className="mobile-splash-dot"
              initial={{ opacity: 0, scale: 0.3, y: 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.45,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.85
              }}
            >
              .
            </motion.span>
          </motion.div>
        </div>

        {/* Editorial Tagline Reveal */}
        <motion.div
          className="mobile-splash-tagline-wrap"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.55,
            ease: [0.16, 1, 0.3, 1],
            delay: 1.22
          }}
        >
          <span className="mobile-splash-tagline">YOUR BUSINESS. SORTED.</span>
        </motion.div>
      </div>
    </motion.div>
  );
}
