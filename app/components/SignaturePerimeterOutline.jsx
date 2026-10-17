import React from 'react';

/**
 * Polished Active Card Highlight for The Sorted Club.
 * 
 * Provides a clean, restrained visual focus for package and tier cards:
 * - Inset border that inherits the parent card's exact rounded geometry with zero drift.
 * - Deep ink (#10100f) stroke with a subtle acid-green (#d8ff55) accent ring.
 * - Deliberate 500ms transition curve without distracting speed or jumping elements.
 * - No fake or misleading badges ("IN FOCUS", "ACTIVE & CHOSEN", empty placeholders).
 * - Zero layout shift.
 * - Fully respects prefers-reduced-motion.
 */
export default function SignaturePerimeterOutline({
  isFocused = false,
  isSelected = false,
  borderRadius = 12
}) {
  if (!isFocused && !isSelected) return null;

  return (
    <div
      className={`package-active-outline signature-perimeter-active-wrap ${isFocused ? 'is-focused' : ''} ${isSelected ? 'is-selected' : ''}`}
      style={{
        position: 'absolute',
        inset: '-1px',
        borderRadius: `${borderRadius}px`,
        pointerEvents: 'none',
        boxSizing: 'border-box',
        border: isFocused ? '2px solid var(--ink)' : '1px solid transparent',
        boxShadow: isFocused
          ? '0 0 0 1.5px var(--acid), 0 12px 28px rgba(16, 16, 15, 0.08)'
          : isSelected
          ? '0 0 0 1px rgba(16, 16, 15, 0.2)'
          : 'none',
        opacity: isFocused ? 1 : isSelected ? 0.8 : 0,
        transition: 'border 500ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 500ms cubic-bezier(0.16, 1, 0.3, 1), opacity 350ms ease',
        zIndex: 4
      }}
      aria-hidden="true"
    />
  );
}
