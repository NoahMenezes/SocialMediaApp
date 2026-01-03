import type { Transition, Variants } from "framer-motion";

/**
 * Animation System - Production-ready motion design tokens
 *
 * Philosophy:
 * - Smooth, intentional, premium feel
 * - Performance-first (60fps, no layout shift)
 * - Respects prefers-reduced-motion
 * - Consistent timing and easing across the app
 */

// ============================================================================
// TRANSITIONS
// ============================================================================

export const transitions = {
  // Primary spring for interactive elements (buttons, cards)
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,

  // Smooth tween for content (modals, dropdowns)
  smooth: {
    type: "tween",
    ease: [0.4, 0, 0.2, 1], // easeInOut
    duration: 0.25,
  } as Transition,

  // Bouncy spring for feedback (likes, interactions)
  bouncy: {
    type: "spring",
    stiffness: 400,
    damping: 15,
  } as Transition,

  // Fast for micro-interactions
  fast: {
    type: "tween",
    ease: [0.4, 0, 0.2, 1],
    duration: 0.15,
  } as Transition,

  // Slow for dramatic reveals
  slow: {
    type: "tween",
    ease: [0.4, 0, 0.2, 1],
    duration: 0.35,
  } as Transition,

  // Elastic for playful elements
  elastic: {
    type: "spring",
    stiffness: 200,
    damping: 10,
  } as Transition,
};

// ============================================================================
// VARIANTS
// ============================================================================

export const variants = {
  // Basic fade in/out
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  // Slide from bottom (for modals, sheets)
  slideUp: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  } as Variants,

  // Slide from top (for dropdowns)
  slideDown: {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  } as Variants,

  // Scale in (for cards, posts)
  scaleIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  } as Variants,

  // Drawer from right (for side panels)
  slideInRight: {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  } as Variants,

  // Drawer from left (for navigation)
  slideInLeft: {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  } as Variants,

  // For staggered children animations
  staggerContainer: {
    animate: {
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.05,
      },
    },
  } as Variants,

  // Individual stagger items
  staggerItem: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
  } as Variants,

  // Page transitions
  pageTransition: {
    initial: { opacity: 0, y: 20, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -20, scale: 0.98 },
  } as Variants,

  // Backdrop for modals
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  } as Variants,

  // Pop animation for interactive feedback
  pop: {
    initial: { scale: 1 },
    animate: { scale: [1, 1.2, 1] },
  } as Variants,

  // Rotate for loading/refresh
  rotate: {
    animate: {
      rotate: 360,
      transition: {
        duration: 1,
        repeat: Infinity,
        ease: "linear",
      },
    },
  } as Variants,

  // Pulse for notifications
  pulse: {
    animate: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  } as Variants,
};

// ============================================================================
// GESTURE ANIMATIONS (Mobile-first)
// ============================================================================

export const gestureVariants = {
  tap: {
    scale: 0.97,
  },
  hover: {
    scale: 1.02,
    y: -2,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get transition based on user's motion preference
 */
export const getTransition = (transition: Transition): Transition => {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return { duration: 0.01 } as Transition;
  }
  return transition;
};

/**
 * Stagger delay calculator
 */
export const getStaggerDelay = (index: number, baseDelay = 0.1): number => {
  return index * baseDelay;
};

/**
 * Create custom spring config
 */
export const createSpring = (stiffness = 300, damping = 30): Transition => ({
  type: "spring",
  stiffness,
  damping,
});

/**
 * Create custom tween config
 */
export const createTween = (
  duration = 0.25,
  ease: [number, number, number, number] = [0.4, 0, 0.2, 1],
): Transition => ({
  type: "tween",
  duration,
  ease,
});
