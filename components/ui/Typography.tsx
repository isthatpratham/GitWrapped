import React from "react";
import { clsx } from "clsx";

// ---------------------------------------------------------------------------
// Typography Components
// ---------------------------------------------------------------------------
// A collection of strongly-typed typography primitives utilizing the
// Montserrat font. Each supports custom tags and responsive styles.
// ---------------------------------------------------------------------------

interface TypographyProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: React.ElementType;
}

export function Display({ children, className, as: Component = "h1" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-none text-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Hero({ children, className, as: Component = "h1" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-display text-4xl md:text-6xl font-bold tracking-tight leading-tight text-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Heading({ children, className, as: Component = "h2" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-display text-2xl md:text-4xl font-bold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Title({ children, className, as: Component = "h3" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-display text-xl md:text-2xl font-semibold tracking-tight text-foreground",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Subtitle({ children, className, as: Component = "p" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-sans text-base md:text-lg text-muted-foreground font-medium",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Body({ children, className, as: Component = "p" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-sans text-sm md:text-base text-foreground/90 leading-relaxed font-normal",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Caption({ children, className, as: Component = "span" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-sans text-xs text-muted-foreground tracking-wide font-normal",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Label({ children, className, as: Component = "label" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-sans text-xs md:text-sm font-semibold tracking-wider uppercase text-foreground/75",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Metric({ children, className, as: Component = "div" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-display text-6xl md:text-8xl font-black tracking-tighter text-foreground tabular-nums",
        className
      )}
    >
      {children}
    </Component>
  );
}

export function Code({ children, className, as: Component = "code" }: TypographyProps) {
  return (
    <Component
      className={clsx(
        "font-mono text-xs md:text-sm bg-surface-elevated px-1.5 py-0.5 rounded border border-border text-primary font-medium",
        className
      )}
    >
      {children}
    </Component>
  );
}
