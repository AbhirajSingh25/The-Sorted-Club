import React from 'react';

/**
 * Editorial Studio Illustrations for The Sorted Club.
 * Crisp, minimalist black line-art drawings with restrained geometric accents.
 * Consistent stroke weight (1.75px), deep ink (#10100f), and subtle acid-green (#d8ff55) markers.
 */
export default function StudioIllustration({ name, size = 44, className = '' }) {
  const s = size;
  const stroke = '#10100f';
  const accent = '#d8ff55';
  const strokeW = 1.75;

  const renderGraphic = () => {
    switch (name) {
      // -------------------------------------------------------------
      // BUILD
      // -------------------------------------------------------------
      case 'build-local':
        // Browser window with location pin and local storefront door
        return (
          <>
            <rect x="4" y="6" width="36" height="32" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="4" y1="14" x2="40" y2="14" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="9" cy="10" r="1.5" fill={stroke} />
            <circle cx="14" cy="10" r="1.5" fill={stroke} />
            <circle cx="19" cy="10" r="1.5" fill={accent} stroke={stroke} strokeWidth="1" />
            <path d="M22 19 C18 19 15 22 15 25 C15 29 22 34 22 34 C22 34 29 29 29 25 C29 22 26 19 22 19 Z" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="24" r="2" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'build-commerce':
        // Fast digital storefront with clean price tag and cart
        return (
          <>
            <rect x="5" y="8" width="34" height="28" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="5" y1="16" x2="39" y2="16" stroke={stroke} strokeWidth={strokeW} />
            <path d="M12 24 H28 L26 31 H14 Z" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="16" cy="33" r="1.5" fill={stroke} />
            <circle cx="24" cy="33" r="1.5" fill={stroke} />
            <line x1="12" y1="21" x2="16" y2="24" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="31" cy="12" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'build-platform':
        // Web application window with database cylinder & API nodes
        return (
          <>
            <rect x="4" y="6" width="36" height="32" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="4" y1="14" x2="40" y2="14" stroke={stroke} strokeWidth={strokeW} />
            <line x1="15" y1="14" x2="15" y2="38" stroke={stroke} strokeWidth={strokeW} />
            <rect x="19" y="19" width="17" height="6" rx="2" stroke={stroke} strokeWidth={strokeW} />
            <rect x="19" y="28" width="17" height="6" rx="2" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="22" r="1.5" fill={accent} stroke={stroke} strokeWidth="0.8" />
            <circle cx="22" cy="31" r="1.5" fill={accent} stroke={stroke} strokeWidth="0.8" />
          </>
        );

      case 'build-speed':
        // Sluggish page transformed into instant lightning
        return (
          <>
            <circle cx="22" cy="22" r="16" stroke={stroke} strokeWidth={strokeW} />
            <path d="M22 10 V14" stroke={stroke} strokeWidth={strokeW} />
            <path d="M34 22 H30" stroke={stroke} strokeWidth={strokeW} />
            <polygon points="23,12 16,24 22,24 20,32 28,20 22,20" fill={accent} stroke={stroke} strokeWidth={strokeW} strokeLinejoin="miter" />
          </>
        );

      case 'build-mobile-chat':
        // Mobile device with instant WhatsApp response trigger
        return (
          <>
            <rect x="12" y="5" width="20" height="34" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="18" y1="9" x2="26" y2="9" stroke={stroke} strokeWidth={strokeW} />
            <rect x="15" y="15" width="14" height="10" rx="3" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <path d="M19 25 L17 28 L21 26" stroke={stroke} strokeWidth={strokeW} fill={stroke} />
            <circle cx="22" cy="35" r="1.5" fill={stroke} />
          </>
        );

      case 'build-lock-repo':
        // Open padlock with Git branch nodes
        return (
          <>
            <rect x="10" y="18" width="24" height="18" rx="3" stroke={stroke} strokeWidth={strokeW} />
            <path d="M16 18 V12 C16 8.5 19 6 22 6 C25 6 28 8.5 28 12 V14" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="17" cy="25" r="2" fill={accent} stroke={stroke} strokeWidth="1" />
            <circle cx="27" cy="25" r="2" fill={stroke} />
            <path d="M17 25 C17 31 27 31 27 25" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'build-milestone':
        // Fixed sprint calendar with checkmark
        return (
          <>
            <rect x="6" y="8" width="32" height="30" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="6" y1="16" x2="38" y2="16" stroke={stroke} strokeWidth={strokeW} />
            <line x1="13" y1="5" x2="13" y2="9" stroke={stroke} strokeWidth={strokeW} />
            <line x1="31" y1="5" x2="31" y2="9" stroke={stroke} strokeWidth={strokeW} />
            <polyline points="14,26 19,31 30,21" stroke={stroke} strokeWidth={strokeW + 0.5} />
            <circle cx="30" cy="21" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'build-deliver-web':
        // Core Web: Browser frame with responsive columns
        return (
          <>
            <rect x="4" y="7" width="36" height="30" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="4" y1="15" x2="40" y2="15" stroke={stroke} strokeWidth={strokeW} />
            <rect x="8" y="19" width="12" height="14" rx="2" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <rect x="23" y="19" width="13" height="6" rx="2" stroke={stroke} strokeWidth={strokeW} />
            <rect x="23" y="27" width="13" height="6" rx="2" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'build-deliver-app':
        // Custom App: Dashboard modular components
        return (
          <>
            <rect x="5" y="7" width="34" height="30" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="5" y1="14" x2="39" y2="14" stroke={stroke} strokeWidth={strokeW} />
            <rect x="9" y="18" width="11" height="8" rx="2" stroke={stroke} strokeWidth={strokeW} />
            <rect x="24" y="18" width="11" height="8" rx="2" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <line x1="9" y1="30" x2="35" y2="30" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'build-deliver-standards':
        // Standards: Security shield with git branch
        return (
          <>
            <path d="M22 6 L36 11 V22 C36 30 22 38 22 38 C22 38 8 30 8 22 V11 Z" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <polyline points="16,21 20,25 28,17" stroke={stroke} strokeWidth={strokeW + 0.5} />
            <circle cx="28" cy="17" r="2.5" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      // -------------------------------------------------------------
      // GROW
      // -------------------------------------------------------------
      case 'grow-b2b':
        // Editorial authority speaker & signal waves
        return (
          <>
            <rect x="6" y="12" width="22" height="20" rx="3" stroke={stroke} strokeWidth={strokeW} />
            <path d="M28 17 L36 13 V31 L28 27 Z" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <line x1="12" y1="19" x2="22" y2="19" stroke={stroke} strokeWidth={strokeW} />
            <line x1="12" y1="25" x2="19" y2="25" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="39" cy="22" r="2" fill={stroke} />
          </>
        );

      case 'grow-local':
        // Multi-location radar with concentric dominance rings
        return (
          <>
            <circle cx="22" cy="22" r="16" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="22" r="10" stroke={stroke} strokeWidth={strokeW} strokeDasharray="3 3" />
            <circle cx="22" cy="22" r="4" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <path d="M22 6 V12" stroke={stroke} strokeWidth={strokeW} />
            <path d="M38 22 H32" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'grow-d2c':
        // Ascending conversion chart
        return (
          <>
            <line x1="8" y1="36" x2="38" y2="36" stroke={stroke} strokeWidth={strokeW} />
            <line x1="8" y1="8" x2="8" y2="36" stroke={stroke} strokeWidth={strokeW} />
            <polyline points="10,30 18,24 26,26 36,12" stroke={stroke} strokeWidth={strokeW + 0.5} fill="none" />
            <circle cx="36" cy="12" r="3.5" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'grow-search':
        // Search lens locking onto #1 map position
        return (
          <>
            <circle cx="19" cy="19" r="11" stroke={stroke} strokeWidth={strokeW} />
            <line x1="27" y1="27" x2="37" y2="37" stroke={stroke} strokeWidth={strokeW + 0.5} />
            <rect x="14" y="14" width="10" height="10" rx="2" fill={accent} stroke={stroke} strokeWidth="1" />
            <path d="M19 16 V22" stroke={stroke} strokeWidth={strokeW} />
            <path d="M17 18 L19 16" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'grow-stream':
        // Dotted chaotic inputs focusing into one solid channel
        return (
          <>
            <circle cx="8" cy="12" r="2" fill={stroke} />
            <circle cx="8" cy="22" r="2" fill={stroke} />
            <circle cx="8" cy="32" r="2" fill={stroke} />
            <path d="M12 12 Q24 16 28 22" stroke={stroke} strokeWidth={strokeW} />
            <path d="M12 22 H28" stroke={stroke} strokeWidth={strokeW} />
            <path d="M12 32 Q24 28 28 22" stroke={stroke} strokeWidth={strokeW} />
            <line x1="28" y1="22" x2="40" y2="22" stroke={stroke} strokeWidth={strokeW + 1} />
            <polygon points="38,18 42,22 38,26" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'grow-attribution':
        // Currency dollar linking directly to pipeline card
        return (
          <>
            <circle cx="22" cy="22" r="15" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <path d="M22 13 V31" stroke={stroke} strokeWidth={strokeW} />
            <path d="M26 17 C26 15 24 15 22 15 C19 15 18 16.5 18 18.5 C18 22 26 21 26 24.5 C26 27 24 28 22 28 C19 28 17 26.5 17 25" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'grow-calendar':
        // Film clapper with content calendar
        return (
          <>
            <rect x="6" y="12" width="32" height="24" rx="3" stroke={stroke} strokeWidth={strokeW} />
            <polygon points="18,19 28,24 18,29" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <line x1="6" y1="18" x2="38" y2="18" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      // -------------------------------------------------------------
      // AUTOMATE
      // -------------------------------------------------------------
      case 'automate-inbound':
        // Conversational AI bot with instant reply spark
        return (
          <>
            <rect x="8" y="10" width="28" height="22" rx="6" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="16" cy="19" r="2" fill={stroke} />
            <circle cx="28" cy="19" r="2" fill={stroke} />
            <line x1="18" y1="25" x2="26" y2="25" stroke={stroke} strokeWidth={strokeW} />
            <line x1="22" y1="5" x2="22" y2="10" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="5" r="2" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'automate-ops':
        // Connected routing nodes
        return (
          <>
            <circle cx="11" cy="22" r="5" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <circle cx="33" cy="13" r="5" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="33" cy="31" r="5" stroke={stroke} strokeWidth={strokeW} />
            <path d="M16 22 H24 Q28 22 28 17 V15 Q28 13 30 13" stroke={stroke} strokeWidth={strokeW} />
            <path d="M16 22 H24 Q28 22 28 27 V29 Q28 31 30 31" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'automate-founders':
        // Clockwork gears and recurring triggers
        return (
          <>
            <circle cx="19" cy="19" r="10" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="19" cy="19" r="4" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <circle cx="31" cy="29" r="7" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="31" cy="29" r="2.5" fill={stroke} />
          </>
        );

      case 'automate-speed':
        // Hourglass transformed into instant automated pulse
        return (
          <>
            <path d="M12 8 H32 L22 22 L32 36 H12 L22 22 Z" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <circle cx="22" cy="22" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'automate-sync':
        // Two connected sync circular arrows
        return (
          <>
            <path d="M22 8 A13 13 0 0 1 35 21" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <polyline points="33,14 36,21 29,22" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <path d="M22 36 A13 13 0 0 1 9 23" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <polyline points="11,30 8,23 15,22" stroke={stroke} strokeWidth={strokeW} fill={accent} />
          </>
        );

      case 'automate-invoice':
        // Automated digital invoice with check stamp
        return (
          <>
            <rect x="9" y="6" width="26" height="32" rx="3" stroke={stroke} strokeWidth={strokeW} />
            <line x1="14" y1="13" x2="30" y2="13" stroke={stroke} strokeWidth={strokeW} />
            <line x1="14" y1="18" x2="26" y2="18" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="26" cy="27" r="6" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <polyline points="23,27 25,29 29,25" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'automate-guard':
        // Shield protecting workflow circuit
        return (
          <>
            <path d="M22 6 L34 11 V20 C34 27 22 35 22 35 C22 35 10 27 10 20 V11 Z" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="18" r="3" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <line x1="22" y1="21" x2="22" y2="27" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      // -------------------------------------------------------------
      // HIRE
      // -------------------------------------------------------------
      case 'hire-tech':
        // Code scorecard with terminal prompt
        return (
          <>
            <rect x="6" y="8" width="32" height="28" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="6" y1="16" x2="38" y2="16" stroke={stroke} strokeWidth={strokeW} />
            <path d="M12 24 L16 27 L12 30" stroke={stroke} strokeWidth={strokeW} />
            <line x1="18" y1="30" x2="24" y2="30" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="32" cy="26" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'hire-growth':
        // Talent candidate node with check badge
        return (
          <>
            <circle cx="22" cy="15" r="6" stroke={stroke} strokeWidth={strokeW} />
            <path d="M12 33 C12 26 16 24 22 24 C28 24 32 26 32 33" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <circle cx="31" cy="13" r="3.5" fill={accent} stroke={stroke} strokeWidth="1" />
            <polyline points="29,13 31,14.5 33,12" stroke={stroke} strokeWidth="1.2" />
          </>
        );

      case 'hire-bench':
        // Team bench scaling with stable foundation
        return (
          <>
            <circle cx="14" cy="15" r="4" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="30" cy="15" r="4" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="13" r="5" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <path d="M7 32 C7 27 10 25 14 25 C16 25 18 26 19 28" stroke={stroke} strokeWidth={strokeW} />
            <path d="M37 32 C37 27 34 25 30 25 C28 25 26 26 25 28" stroke={stroke} strokeWidth={strokeW} />
            <path d="M16 32 C16 27 18 25 22 25 C26 25 28 27 28 32" stroke={stroke} strokeWidth={strokeW} />
          </>
        );

      case 'hire-filter':
        // Talent filter delivering curated shortlist
        return (
          <>
            <polygon points="8,8 36,8 26,22 26,34 18,30 18,22" stroke={stroke} strokeWidth={strokeW} fill="none" />
            <circle cx="28" cy="10" r="2" fill={accent} />
            <circle cx="22" cy="35" r="2.5" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'hire-benchmark':
        // Verified skill benchmark scorecard
        return (
          <>
            <rect x="8" y="7" width="28" height="32" rx="4" stroke={stroke} strokeWidth={strokeW} />
            <line x1="14" y1="14" x2="30" y2="14" stroke={stroke} strokeWidth={strokeW} />
            <line x1="14" y1="20" x2="26" y2="20" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="28" r="4" fill={accent} stroke={stroke} strokeWidth={strokeW} />
            <polyline points="20,28 21.5,29.5 24,27" stroke={stroke} strokeWidth="1.2" />
          </>
        );

      case 'hire-handshake':
        // Success handshake with zero upfront fee ribbon
        return (
          <>
            <path d="M8 20 L16 14 L23 19 L19 26 L12 26 Z" stroke={stroke} strokeWidth={strokeW} fill={accent} />
            <path d="M36 20 L28 14 L21 19 L25 26 L32 26 Z" stroke={stroke} strokeWidth={strokeW} />
            <line x1="17" y1="26" x2="27" y2="26" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="32" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );

      case 'hire-shield':
        // 90-day replacement warranty shield
        return (
          <>
            <path d="M22 6 L35 11 V20 C35 28 22 36 22 36 C22 36 9 28 9 20 V11 Z" stroke={stroke} strokeWidth={strokeW} />
            <text x="22" y="24" textAnchor="middle" fontFamily="'Space Grotesk', sans-serif" fontWeight="700" fontSize="10" fill={stroke}>90d</text>
            <circle cx="22" cy="12" r="1.5" fill={accent} />
          </>
        );

      default:
        // Studio geometric cross / compass default
        return (
          <>
            <circle cx="22" cy="22" r="15" stroke={stroke} strokeWidth={strokeW} />
            <line x1="22" y1="11" x2="22" y2="33" stroke={stroke} strokeWidth={strokeW} />
            <line x1="11" y1="22" x2="33" y2="22" stroke={stroke} strokeWidth={strokeW} />
            <circle cx="22" cy="22" r="3" fill={accent} stroke={stroke} strokeWidth="1" />
          </>
        );
    }
  };

  return (
    <svg
      width={s}
      height={s}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`studio-illustration ${className}`}
      style={{ display: 'block', flexShrink: 0 }}
      aria-hidden="true"
    >
      {renderGraphic()}
    </svg>
  );
}
