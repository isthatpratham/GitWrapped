// ---------------------------------------------------------------------------
// Design Tokens — TypeScript Definition
// ---------------------------------------------------------------------------
// Centralized source of truth for all spacing multipliers, border radiuses,
// z-indexes, breakpoints, and animation settings.
// ---------------------------------------------------------------------------

export const TOKENS = {
  typography: {
    fontSans: '"Montserrat", -apple-system, BlinkMacSystemFont, sans-serif',
    fontDisplay: '"Montserrat", sans-serif',
    fontMono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    sizes: {
      xs: "0.75rem",     // 12px
      sm: "0.875rem",    // 14px
      base: "1rem",      // 16px
      lg: "1.125rem",    // 18px
      xl: "1.25rem",     // 20px
      h3: "1.5rem",      // 24px
      h2: "1.875rem",    // 30px
      h1: "2.25rem",     // 36px
      hero: "3.75rem",    // 60px
      display: "4.5rem",  // 72px
    },
  },
  spacing: {
    1: "0.25rem", // 4px
    2: "0.5rem",  // 8px
    3: "0.75rem", // 12px
    4: "1rem",    // 16px
    5: "1.25rem", // 20px
    6: "1.5rem",  // 24px
    8: "2rem",    // 32px
    10: "2.5rem", // 40px
    12: "3rem",   /* 48px */
    16: "4rem",   /* 64px */
    20: "5rem",   /* 80px */
    24: "6rem",   /* 96px */
  },
  radius: {
    xs: "2px",
    sm: "4px",
    md: "6px",
    lg: "8px",
    xl: "12px",
    full: "9999px",
  },
  zIndex: {
    base: 0,
    raised: 10,
    overlay: 100,
    modal: 500,
    tooltip: 1000,
  },
  duration: {
    instant: 0,
    fast: 200,
    standard: 300,
    slow: 500,
    cinematic: 700,
  },
  easing: {
    easeInOut: [0.4, 0, 0.2, 1] as [number, number, number, number],
    easeOut: [0.16, 1, 0.3, 1] as [number, number, number, number],
    easeIn: [0.3, 0, 0.8, 0.15] as [number, number, number, number],
  },
  breakpoints: {
    sm: "640px",
    md: "768px",
    lg: "1024px",
    xl: "1280px",
    "2xl": "1536px",
  },
} as const;
