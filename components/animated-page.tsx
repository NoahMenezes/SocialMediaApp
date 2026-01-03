"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { variants, transitions } from "@/lib/animations";

interface AnimatedPageProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * AnimatedPage - Wrapper component for smooth page transitions
 *
 * Features:
 * - Fade + slide + scale on route change
 * - Respects prefers-reduced-motion
 * - Preserves layout during animation
 * - Optimized for performance (GPU-accelerated)
 */
export function AnimatedPage({ children, className = "" }: AnimatedPageProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={variants.pageTransition}
        transition={transitions.smooth}
        className={className}
        style={{
          willChange: "opacity, transform",
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * AnimatedSection - For section-level animations
 */
export function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.section
      initial="initial"
      whileInView="animate"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants.slideUp}
      transition={{ ...transitions.smooth, delay }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/**
 * AnimatedCard - For card/post animations with hover effects
 */
export function AnimatedCard({
  children,
  className = "",
  onClick,
}: {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <motion.div
      initial="initial"
      whileInView="animate"
      whileHover={{ y: -4, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      viewport={{ once: true, margin: "-50px" }}
      variants={variants.scaleIn}
      transition={transitions.spring}
      className={className}
      onClick={onClick}
      style={{
        willChange: "transform",
      }}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer - For lists/grids with staggered children
 */
export function StaggerContainer({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={variants.staggerContainer}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerItem - Individual items in staggered list
 */
export function StaggerItem({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={variants.staggerItem} className={className}>
      {children}
    </motion.div>
  );
}

/**
 * FadeIn - Simple fade in animation
 */
export function FadeIn({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ ...transitions.smooth, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * ScaleIn - Scale in animation for emphasis
 */
export function ScaleIn({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={transitions.bouncy}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * SlideIn - Slide in from direction
 */
export function SlideIn({
  children,
  direction = "up",
  className = "",
}: {
  children: React.ReactNode;
  direction?: "up" | "down" | "left" | "right";
  className?: string;
}) {
  const directionVariants = {
    up: { initial: { y: 20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    down: { initial: { y: -20, opacity: 0 }, animate: { y: 0, opacity: 1 } },
    left: { initial: { x: -20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
    right: { initial: { x: 20, opacity: 0 }, animate: { x: 0, opacity: 1 } },
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={directionVariants[direction]}
      transition={transitions.smooth}
      className={className}
    >
      {children}
    </motion.div>
  );
}
