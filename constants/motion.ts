import { Variants } from "framer-motion";

// Premium custom cubic-bezier easing curve (easeOutExpo) for high-end cinematic feel
export const EASING = [0.16, 1, 0.3, 1];

export const TRANSITION_DEFAULT = {
  duration: 0.8,
  ease: EASING,
};

export const FADE_IN_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: TRANSITION_DEFAULT },
  exit: { opacity: 0, transition: { duration: 0.4 } },
};

export const SLIDE_UP_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: TRANSITION_DEFAULT },
  exit: { opacity: 0, y: -40, transition: { duration: 0.4 } },
};

export const STAGGER_CONTAINER_VARIANTS: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};
