import React from "react";
import { clsx } from "clsx";
import { AlertCircle, RefreshCw } from "@/components/icons";
import { Heading, Subtitle } from "@/components/ui/Typography";
import { Stack } from "@/components/layout/Primitives";

// ---------------------------------------------------------------------------
// Component: Spinner
// ---------------------------------------------------------------------------

export function Spinner({ className }: { readonly className?: string }) {
  return (
    <svg
      className={clsx("animate-spin h-8 w-8 text-primary", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Component: LoadingSkeleton
// ---------------------------------------------------------------------------

interface SkeletonProps {
  readonly className?: string;
  readonly variant?: "text" | "rectangular" | "circular";
}

export function LoadingSkeleton({ className, variant = "rectangular" }: SkeletonProps) {
  const variantClasses = {
    text: "h-4 w-3/4 rounded-sm",
    rectangular: "h-32 w-full rounded-md",
    circular: "h-12 w-12 rounded-full",
  };

  return (
    <div
      className={clsx(
        "bg-surface-elevated animate-pulse border border-border/20",
        variantClasses[variant],
        className
      )}
    />
  );
}

// ---------------------------------------------------------------------------
// Component: EmptyState
// ---------------------------------------------------------------------------

interface EmptyStateProps {
  readonly icon?: React.ReactNode;
  readonly title: string;
  readonly description: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export function EmptyState({ icon, title, description, children, className }: EmptyStateProps) {
  return (
    <div className={clsx("w-full py-16 flex items-center justify-center border border-dashed border-border rounded-lg bg-surface/50", className)}>
      <Stack space={4} className="max-w-md text-center items-center">
        {icon && <div className="text-muted-foreground">{icon}</div>}
        <Heading as="h3" className="text-xl md:text-2xl font-bold">
          {title}
        </Heading>
        <Subtitle className="text-sm">
          {description}
        </Subtitle>
        {children && <div className="mt-2">{children}</div>}
      </Stack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: ErrorState
// ---------------------------------------------------------------------------

interface ErrorStateProps {
  readonly title?: string;
  readonly description: string;
  readonly onRetry?: () => void;
  readonly className?: string;
}

export function ErrorState({ title = "Something went wrong", description, onRetry, className }: ErrorStateProps) {
  return (
    <div className={clsx("w-full py-16 flex items-center justify-center border border-danger/10 rounded-lg bg-danger/5", className)}>
      <Stack space={4} className="max-w-md text-center items-center">
        <AlertCircle className="h-10 w-10 text-danger" />
        <Heading as="h3" className="text-xl md:text-2xl font-bold text-danger">
          {title}
        </Heading>
        <Subtitle className="text-sm text-danger/80">
          {description}
        </Subtitle>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-danger text-white rounded-md font-sans font-semibold text-xs uppercase tracking-wider hover:bg-danger/90 transition-all cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" />
            Retry
          </button>
        )}
      </Stack>
    </div>
  );
}
