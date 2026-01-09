/**
 * Framer Motion animation variants for La Pulperia
 * Use these pre-defined animations for consistent UX across the app
 */

// ===================
// PAGE TRANSITIONS
// ===================

export const pageTransition = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const pageSlideLeft = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
};

export const pageFade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

// ===================
// STAGGER ANIMATIONS
// ===================

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

export const staggerContainerFast = {
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

export const staggerItemFade = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { duration: 0.3 },
  },
};

export const staggerItemScale = {
  initial: { opacity: 0, scale: 0.9 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
};

// ===================
// CARD ANIMATIONS
// ===================

export const cardHover = {
  rest: { scale: 1, y: 0 },
  hover: {
    scale: 1.02,
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
};

export const cardHoverSubtle = {
  rest: { scale: 1 },
  hover: {
    scale: 1.01,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  tap: {
    scale: 0.99,
    transition: { duration: 0.1 },
  },
};

// ===================
// BUTTON ANIMATIONS
// ===================

export const buttonTap = {
  tap: { scale: 0.95 },
};

export const buttonHover = {
  rest: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

// ===================
// LIST ANIMATIONS
// ===================

export const listItem = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: { duration: 0.2 },
  },
};

export const listItemSwipe = {
  initial: { opacity: 0, x: -100 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { type: 'spring', stiffness: 300, damping: 30 },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.2 },
  },
};

// ===================
// MODAL/SHEET ANIMATIONS
// ===================

export const modalOverlay = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};

export const modalContent = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.15 },
  },
};

export const bottomSheet = {
  initial: { y: '100%' },
  animate: {
    y: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    y: '100%',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

export const sideSheet = {
  initial: { x: '100%' },
  animate: {
    x: 0,
    transition: { type: 'spring', damping: 25, stiffness: 300 },
  },
  exit: {
    x: '100%',
    transition: { duration: 0.2, ease: 'easeIn' },
  },
};

// ===================
// NOTIFICATION/TOAST
// ===================

export const toastAnimation = {
  initial: { opacity: 0, y: -20, scale: 0.9 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: { duration: 0.15 },
  },
};

// ===================
// SCROLL ANIMATIONS
// ===================

export const fadeInOnScroll = {
  initial: { opacity: 0, y: 40 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] },
  },
  viewport: { once: true, margin: '-100px' },
};

export const fadeInOnScrollFast = {
  initial: { opacity: 0, y: 20 },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  viewport: { once: true, margin: '-50px' },
};

// ===================
// COUNTER/NUMBER ANIMATION
// ===================

export const numberSpring = {
  type: 'spring',
  damping: 15,
  stiffness: 100,
};

// ===================
// SKELETON/LOADING
// ===================

export const skeletonPulse = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const skeletonShimmer = {
  animate: {
    backgroundPosition: ['200% 0', '-200% 0'],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ===================
// COLLAPSE/EXPAND
// ===================

export const collapse = {
  initial: { height: 0, opacity: 0 },
  animate: {
    height: 'auto',
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
  },
  exit: {
    height: 0,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

// ===================
// SPECIAL EFFECTS
// ===================

export const bounce = {
  animate: {
    y: [0, -10, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      repeatDelay: 2,
    },
  },
};

export const pulse = {
  animate: {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const spin = {
  animate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

// ===================
// UTILITY FUNCTIONS
// ===================

/**
 * Creates a stagger delay based on index
 * @param {number} index - Item index
 * @param {number} baseDelay - Base delay in seconds
 * @returns {number} Calculated delay
 */
export const getStaggerDelay = (index, baseDelay = 0.05) => index * baseDelay;

/**
 * Creates animation variants with custom duration
 * @param {object} variants - Base variants
 * @param {number} duration - Custom duration
 * @returns {object} Modified variants
 */
export const withDuration = (variants, duration) => ({
  ...variants,
  transition: { ...variants.transition, duration },
});

/**
 * Checks if user prefers reduced motion
 * @returns {boolean}
 */
export const prefersReducedMotion = () => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Returns static variants if user prefers reduced motion
 * @param {object} variants - Animation variants
 * @returns {object} Original or static variants
 */
export const respectMotionPreference = (variants) => {
  if (prefersReducedMotion()) {
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }
  return variants;
};
