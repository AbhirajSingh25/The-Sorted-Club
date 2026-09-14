// app/utils/motion.js
// Curated motion variants, spring configs, and transitions for The Sorted Club

export const TRANSITIONS = {
  // Editorial smooth cubic bezier
  editorial: {
    duration: 0.65,
    ease: [0.16, 1, 0.3, 1]
  },
  // Snappy responsive ease for micro-interactions
  snappy: {
    duration: 0.35,
    ease: [0.25, 1, 0.5, 1]
  },
  // Fast crisp transition for route changes
  pageRoute: {
    duration: 0.26,
    ease: [0.16, 1, 0.3, 1]
  },
  // Tactile physics spring for buttons & chips
  buttonSpring: {
    type: 'spring',
    stiffness: 450,
    damping: 25,
    mass: 0.8
  },
  // Smooth spring for card hovering
  cardSpring: {
    type: 'spring',
    stiffness: 300,
    damping: 24,
    mass: 0.9
  },
  // Gentle floating spring
  softSpring: {
    type: 'spring',
    stiffness: 120,
    damping: 18
  }
};

// Container stagger variants
export const staggerContainer = (staggerChildren = 0.08, delayChildren = 0.05) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

// Element entrance variants
export const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.editorial
  }
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.editorial
  }
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.editorial
  }
};

export const slideInFromLeft = {
  hidden: { opacity: 0, x: -30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.editorial
  }
};

export const slideInFromRight = {
  hidden: { opacity: 0, x: 30 },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.editorial
  }
};

// Hero specific line mask reveal
export const heroLineReveal = {
  hidden: { opacity: 0, y: 40, clipPath: 'inset(0% 0% 100% 0%)' },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: 'inset(0% 0% 0% 0%)',
    transition: {
      duration: 0.85,
      ease: [0.16, 1, 0.3, 1]
    }
  }
};

// Modal backdrop & content variants
export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.18, ease: 'easeIn' }
  }
};

export const modalContainerVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.32,
      ease: [0.16, 1, 0.3, 1]
    }
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 12,
    transition: {
      duration: 0.2,
      ease: [0.25, 1, 0.5, 1]
    }
  }
};

// Accordion toggle variant for FAQ items
export const accordionVariants = {
  collapsed: {
    opacity: 0,
    height: 0,
    transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] }
  },
  expanded: {
    opacity: 1,
    height: 'auto',
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] }
  }
};

// Route transition variants
export const routeVariants = {
  initial: {
    opacity: 0,
    y: 8
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.pageRoute
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.16,
      ease: 'easeIn'
    }
  }
};
