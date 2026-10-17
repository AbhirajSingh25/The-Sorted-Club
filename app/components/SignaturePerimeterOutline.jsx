import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';

/**
 * Signature Single-Ink Perimeter Draw Outline for The Sorted Club.
 *
 * Requirements:
 * - Single deep-ink (#10100f) stroke (2px).
 * - Exact mathematical SVG loop following the card's rounded corners.
 * - Starts at upper-left corner fillet and completes clockwise back to origin.
 * - Deliberate ~1.35s editorial draw animation with smooth easing.
 * - No green outer glow, no double border, no layout shift.
 * - Triggers when card becomes active/focused, without replaying on tiny scroll or re-renders.
 * - Respects prefers-reduced-motion.
 */
export default function SignaturePerimeterOutline({
  isFocused = false,
  isSelected = false,
  borderRadius = 12
}) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const prevFocusedRef = useRef(false);
  const [animKey, setAnimKey] = useState(0);

  // Trigger animation draw only when focus changes to active
  useEffect(() => {
    if (isFocused && !prevFocusedRef.current) {
      setAnimKey(k => k + 1);
    }
    prevFocusedRef.current = isFocused;
  }, [isFocused]);

  // Keep track of card dimensions accurately across responsive viewports and resizes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const parent = el.parentElement || el;
      const rect = parent.getBoundingClientRect();
      const w = Math.round(rect.width);
      const h = Math.round(rect.height);
      if (w > 0 && h > 0) {
        setDims(prev => (prev.width === w && prev.height === h ? prev : { width: w, height: h }));
      }
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      if (el.parentElement) ro.observe(el.parentElement);
      return () => ro.disconnect();
    } else {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
  }, []);

  if (!isFocused) return null;

  const w = dims.width;
  const h = dims.height;
  const strokeWidth = 2;
  const inset = strokeWidth / 2; // Inset so stroke center aligns exactly inside border boundary
  const pw = Math.max(0, w - 2 * inset);
  const ph = Math.max(0, h - 2 * inset);
  const r = Math.max(0, Math.min(borderRadius - inset, pw / 2, ph / 2));

  // Clockwise rounded rectangle path starting at top-left fillet origin
  // (x0, y0) = (inset + r, inset)
  const x0 = inset + r;
  const y0 = inset;
  const pathD = w > 0 && h > 0
    ? `M ${x0} ${y0} ` +
      `H ${inset + pw - r} ` +
      `A ${r} ${r} 0 0 1 ${inset + pw} ${inset + r} ` +
      `V ${inset + ph - r} ` +
      `A ${r} ${r} 0 0 1 ${inset + pw - r} ${inset + ph} ` +
      `H ${inset + r} ` +
      `A ${r} ${r} 0 0 1 ${inset} ${inset + ph - r} ` +
      `V ${inset + r} ` +
      `A ${r} ${r} 0 0 1 ${x0} ${y0} ` +
      `Z`
    : '';

  const prefersReduced =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <div
      ref={containerRef}
      className={`package-active-outline signature-perimeter-active-wrap is-focused ${isSelected ? 'is-selected' : ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: `${borderRadius}px`,
        pointerEvents: 'none',
        overflow: 'visible',
        zIndex: 4
      }}
      aria-hidden="true"
    >
      {w > 0 && h > 0 && (
        <svg
          width={w}
          height={h}
          viewBox={`0 0 ${w} ${h}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            overflow: 'visible',
            display: 'block'
          }}
        >
          <motion.path
            key={animKey}
            d={pathD}
            fill="none"
            stroke="#10100f"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: prefersReduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: prefersReduced ? 0 : 1.35,
              ease: [0.16, 1, 0.3, 1]
            }}
          />
        </svg>
      )}
    </div>
  );
}
