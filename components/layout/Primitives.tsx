import React from "react";
import { clsx } from "clsx";

// ---------------------------------------------------------------------------
// Layout Components
// ---------------------------------------------------------------------------
// A set of reusable layout structural primitives for constructing clean,
// desktop-first grids, flex stacks, and viewport frames.
// ---------------------------------------------------------------------------

interface BaseLayoutProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly as?: React.ElementType;
}

export function PageContainer({ children, className, as: Component = "main" }: BaseLayoutProps) {
  return (
    <Component className={clsx("w-full min-h-screen bg-background text-foreground overflow-y-auto px-4 md:px-8 py-6", className)}>
      {children}
    </Component>
  );
}

export function Viewport({ children, className, as: Component = "section" }: BaseLayoutProps) {
  return (
    <Component className={clsx("w-full h-screen max-h-screen overflow-hidden flex flex-col justify-between bg-background relative", className)}>
      {children}
    </Component>
  );
}

export function Container({ children, className, as: Component = "div" }: BaseLayoutProps) {
  return (
    <Component className={clsx("w-full max-w-6xl mx-auto px-4 md:px-8", className)}>
      {children}
    </Component>
  );
}

export function Section({ children, className, as: Component = "section" }: BaseLayoutProps) {
  return (
    <Component className={clsx("py-12 md:py-20", className)}>
      {children}
    </Component>
  );
}

interface StackProps extends BaseLayoutProps {
  readonly space?: 1 | 2 | 3 | 4 | 5 | 6 | 8 | 10 | 12 | 16;
}

export function Stack({ children, className, space = 4, as: Component = "div" }: StackProps) {
  const gapMap = {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    5: "gap-5",
    6: "gap-6",
    8: "gap-8",
    10: "gap-10",
    12: "gap-12",
    16: "gap-16",
  };

  return (
    <Component className={clsx("flex flex-col", gapMap[space], className)}>
      {children}
    </Component>
  );
}

interface FlexProps extends BaseLayoutProps {
  readonly align?: "start" | "center" | "end" | "stretch";
  readonly justify?: "start" | "center" | "end" | "between" | "around";
  readonly wrap?: boolean;
}

export function Flex({
  children,
  className,
  align = "center",
  justify = "start",
  wrap = false,
  as: Component = "div",
}: FlexProps) {
  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
  };

  return (
    <Component
      className={clsx(
        "flex",
        alignClasses[align],
        justifyClasses[justify],
        wrap && "flex-wrap",
        className
      )}
    >
      {children}
    </Component>
  );
}

interface GridProps extends BaseLayoutProps {
  readonly cols?: 1 | 2 | 3 | 4 | 6 | 12;
  readonly gap?: 1 | 2 | 3 | 4 | 6 | 8;
}

export function Grid({ children, className, cols = 3, gap = 4, as: Component = "div" }: GridProps) {
  const colsMap = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 md:grid-cols-4",
    6: "grid-cols-2 md:grid-cols-3 lg:grid-cols-6",
    12: "grid-cols-4 md:grid-cols-6 lg:grid-cols-12",
  };

  const gapMap = {
    1: "gap-1",
    2: "gap-2",
    3: "gap-3",
    4: "gap-4",
    6: "gap-6",
    8: "gap-8",
  };

  return (
    <Component className={clsx("grid", colsMap[cols], gapMap[gap], className)}>
      {children}
    </Component>
  );
}

export function Divider({ className }: { readonly className?: string }) {
  return <hr className={clsx("border-divider my-4 w-full", className)} />;
}
