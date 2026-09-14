import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const [cursorText, setCursorText] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 400, mass: 0.5 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Detect touch / coarse pointer devices
    const checkTouch = () => {
      const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      setIsTouchDevice(isTouch || prefersReduced);
    };

    checkTouch();
    window.addEventListener('resize', checkTouch);

    const handleMouseMove = (e) => {
      if (isTouchDevice) return;
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);

      // Check if hovering over a target with data-cursor
      const target = e.target.closest('[data-cursor]');
      if (target) {
        const text = target.getAttribute('data-cursor') || 'View';
        setCursorText(text);
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', checkTouch);
    };
  }, [isTouchDevice, mouseX, mouseY]);

  if (isTouchDevice) return null;

  return (
    <motion.div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        x: smoothX,
        y: smoothY,
        translateX: '-50%',
        translateY: '-50%',
        pointerEvents: 'none',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: isVisible ? 1 : 0,
        scale: isVisible ? 1 : 0.6,
        transition: 'opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), scale 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        style={{
          background: 'var(--ink, #10100f)',
          color: 'var(--acid, #d8ff55)',
          padding: '6px 14px',
          borderRadius: '999px',
          fontFamily: '"Space Grotesk", sans-serif',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
          border: '1px solid rgba(216, 255, 85, 0.4)',
          whiteSpace: 'nowrap',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}
      >
        <span>{cursorText}</span>
        <span style={{ fontSize: '13px' }}>↗</span>
      </div>
    </motion.div>
  );
}
