import React from "react";
import { clsx } from "clsx";

// ---------------------------------------------------------------------------
// Component: Badge & Chip
// ---------------------------------------------------------------------------
// Compact indicators for categories, tags, or status levels.
// ---------------------------------------------------------------------------

interface BadgeProps {
  readonly children: React.ReactNode;
  readonly variant?: "primary" | "secondary" | "success" | "warning" | "danger" | "accent";
  readonly className?: string;
}

export function Badge({ children, variant = "secondary", className }: BadgeProps) {
  const variantStyles = {
    primary: "bg-primary/10 border border-primary/20 text-primary",
    secondary: "bg-surface border border-border text-foreground/80",
    success: "bg-success/10 border border-success/20 text-success",
    warning: "bg-warning/10 border border-warning/20 text-warning",
    danger: "bg-danger/10 border border-danger/20 text-danger",
    accent: "bg-accent/10 border border-accent/20 text-accent",
  };

  return (
    <span
      className={clsx(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold tracking-wider uppercase select-none font-sans",
        variantStyles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Component: Chip
// ---------------------------------------------------------------------------

interface ChipProps {
  readonly label: string;
  readonly active?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
}

export function Chip({ label, active = false, onClick, className }: ChipProps) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide font-sans transition-all border outline-none cursor-pointer focus-visible:ring-1 focus-visible:ring-primary",
        active
          ? "bg-primary border-primary text-primary-foreground"
          : "bg-surface border-border text-muted-foreground hover:text-foreground hover:border-border/80",
        className
      )}
    >
      {label}
    </button>
  );
}
