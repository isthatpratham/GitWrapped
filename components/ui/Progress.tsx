"use client";

import React from "react";
import { clsx } from "clsx";
import { motion } from "framer-motion";

// ---------------------------------------------------------------------------
// Component: Progress
// ---------------------------------------------------------------------------
// A premium linear progress indicator with spring animation fills.
// ---------------------------------------------------------------------------

interface ProgressProps {
  readonly value: number; // 0 to 100
  readonly className?: string;
}

export function Progress({ value, className }: ProgressProps) {
  const clampedValue = Math.max(0, Math.min(value, 100));

  return (
    <div className={clsx("h-1 w-full bg-border rounded-full overflow-hidden relative", className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${clampedValue}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="h-full bg-primary rounded-full"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: ProgressDots
// ---------------------------------------------------------------------------

interface ProgressDotsProps {
  readonly count: number;
  readonly activeIndex: number;
  readonly className?: string;
  readonly onDotClick?: (index: number) => void;
}

export function ProgressDots({ count, activeIndex, className, onDotClick }: ProgressDotsProps) {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          onClick={() => onDotClick && onDotClick(idx)}
          aria-label={`Go to slide ${idx + 1}`}
          className={clsx(
            "h-1.5 rounded-full transition-all cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-primary",
            idx === activeIndex ? "w-4 bg-primary" : "w-1.5 bg-border hover:bg-muted-foreground/50"
          )}
        />
      ))}
    </div>
  );
}
