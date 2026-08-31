"use client";

import React from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { TOKENS } from "@/tokens";

// ---------------------------------------------------------------------------
// Motion System Wrappers
// ---------------------------------------------------------------------------
// A collection of framer-motion layout elements configured with GitWrapped's
// calm, cinematic, bounce-free motion principles (500ms duration, easeOut).
// ---------------------------------------------------------------------------

interface BaseMotionProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number; // in seconds
  readonly duration?: number; // in seconds
}

const defaultTransition = (delay = 0, duration = 0.5, reduced = false) => ({
  duration: reduced ? 0.15 : duration,
  delay: reduced ? 0 : delay,
  ease: TOKENS.easing.easeOut,
});

export function Fade({ children, className, delay = 0, duration = 0.5 }: BaseMotionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeUp({ children, className, delay = 0, duration = 0.5 }: BaseMotionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function FadeDown({ children, className, delay = 0, duration = 0.5 }: BaseMotionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -16 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function Scale({ children, className, delay = 0, duration = 0.5 }: BaseMotionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function BlurReveal({ children, className, delay = 0, duration = 0.7 }: BaseMotionProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, filter: "blur(8px)" }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, filter: "blur(0px)" }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface SlideRevealProps extends BaseMotionProps {
  readonly direction?: "left" | "right";
}

export function SlideReveal({ children, className, direction = "left", delay = 0, duration = 0.5 }: SlideRevealProps) {
  const reduced = useReducedMotion();
  const xOffset = direction === "left" ? -24 : 24;
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: xOffset }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, x: 0 }}
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function ViewportReveal({ children, className, delay = 0, duration = 0.5 }: BaseMotionProps) {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10%" });
  const reduced = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
      animate={
        isInView
          ? reduced
            ? { opacity: 1 }
            : { opacity: 1, y: 0 }
          : reduced
            ? { opacity: 0 }
            : { opacity: 0, y: 12 }
      }
      transition={defaultTransition(delay, duration, Boolean(reduced))}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Chart drawing animator
// ---------------------------------------------------------------------------
interface ChartRevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly delay?: number;
}

export function ChartReveal({ children, className, delay = 0 }: ChartRevealProps) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? { opacity: 0 } : { scaleY: 0, originY: 1 }}
      animate={reduced ? { opacity: 1 } : { scaleY: 1 }}
      transition={{
        duration: reduced ? 0.15 : 0.6,
        delay: reduced ? 0 : delay,
        ease: TOKENS.easing.easeOut,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
