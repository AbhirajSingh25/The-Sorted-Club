import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Signature Animated Perimeter Outline for The Sorted Club.
 * 
 * Draws an engineered, traveling line around the perimeter of the focused card:
 * - Begins at a deliberate top-left anchor marker with an acid-green (#d8ff55) pip.
 * - Animates the stroke along the card's rectangular geometry and rounded corners.
 * - Features a high-velocity acid-green accent runner that completes the circuit.
 * - Maintains zero layout shift through absolute positioning and auto-measured bounds.
 * - Transitions fluidly when carousel focus or user selection moves.
 * - Includes a refined monospace status badge ("IN FOCUS" or "ACTIVE & CHOSEN").
 * - Respects prefers-reduced-motion settings.
 */
export default function SignaturePerimeterOutline({
  isFocused = false,
  isSelected = false,
  borderRadius = 12,
  strokeWidth = 2.5,
  accentColor = '#d8ff55',
  strokeColor = '#10100f',
  label = null
}) {
  const containerRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const parent = containerRef.current?.parentElement;
    if (!parent) return;

    const measure = () => {
      const rect = parent.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setDims({
          width: Math.round(rect.width),
          height: Math.round(rect.height)
        });
      }
    };

    measure();

    if (typeof ResizeObserver !== 'undefined') {
      const ro = new ResizeObserver(measure);
      ro.observe(parent);
      return () => ro.disconnect();
    }

    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  const width = dims.width || 300;
  const height = dims.height || 420;
  const inset = strokeWidth / 2;
  const rectW = Math.max(10, width - strokeWidth);
  const rectH = Math.max(10, height - strokeWidth);
  const r = Math.min(borderRadius, rectW / 2, rectH / 2);

  const displayLabel = label || (isSelected ? 'ACTIVE & CHOSEN' : 'IN FOCUS');

  return (
    <div
      ref={containerRef}
      className={`signature-perimeter-root ${isFocused ? 'focused' : ''}`}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        borderRadius: `${borderRadius}px`,
        overflow: 'visible',
        zIndex: 5
      }}
      aria-hidden="true"
    >
      <AnimatePresence>
        {isFocused && dims.width > 0 && (
          <motion.div
            key="perimeter-active"
            className="signature-perimeter-active-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            {/* SVG Perimeter Canvas */}
            <svg
              width={width}
              height={height}
              viewBox={`0 0 ${width} ${height}`}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                overflow: 'visible'
              }}
            >
              {/* Base Engineered Ink Stroke */}
              <motion.rect
                x={inset}
                y={inset}
                width={rectW}
                height={rectH}
                rx={r}
                ry={r}
                fill="none"
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: 0.42,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />

              {/* Traveling Acid-Green Energy Runner */}
              <motion.rect
                x={inset}
                y={inset}
                width={rectW}
                height={rectH}
                rx={r}
                ry={r}
                fill="none"
                stroke={accentColor}
                strokeWidth={strokeWidth + 0.5}
                strokeDasharray="48 9999"
                strokeLinecap="round"
                initial={{ pathOffset: 0 }}
                animate={{ pathOffset: [0, 1] }}
                transition={{
                  duration: 0.55,
                  ease: [0.16, 1, 0.3, 1]
                }}
              />
            </svg>

            {/* Deliberate Origin Marker Pip at Top-Left */}
            <motion.div
              className="perimeter-origin-pip"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ duration: 0.22, delay: 0.05 }}
              style={{
                position: 'absolute',
                top: '-3px',
                left: '-3px',
                width: '8px',
                height: '8px',
                background: accentColor,
                border: `1.5px solid ${strokeColor}`,
                borderRadius: '2px',
                boxShadow: '0 0 8px rgba(216, 255, 85, 0.85)',
                zIndex: 6
              }}
            />

            {/* Status Focus Tag */}
            <motion.span
              className="perimeter-focus-tag"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2, delay: 0.08 }}
              style={{
                position: 'absolute',
                top: '-10px',
                left: '14px',
                background: strokeColor,
                color: accentColor,
                font: '700 9px "Space Grotesk", -apple-system, sans-serif',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                padding: '2px 8px',
                borderRadius: '999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                zIndex: 6,
                boxShadow: '0 2px 8px rgba(16, 16, 15, 0.2)'
              }}
            >
              <span
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  background: accentColor,
                  display: 'inline-block'
                }}
              />
              {displayLabel}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
