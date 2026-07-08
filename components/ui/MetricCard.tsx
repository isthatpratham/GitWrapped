import React from "react";
import { clsx } from "clsx";
import { Label, Subtitle } from "@/components/ui/Typography";
import { Counter } from "@/components/motion/Counter";
import { Stack } from "@/components/layout/Primitives";
import { getNumericSizeClass } from "@/lib/numeric-scale";

// ---------------------------------------------------------------------------
// Component: MetricCard
// ---------------------------------------------------------------------------
// A premium content card showing a single highlighted metric.
// Includes spring counter triggers with responsive numeric scaling.
// ---------------------------------------------------------------------------

interface MetricCardProps {
  readonly label: string;
  readonly value: number;
  readonly suffix?: string;
  readonly description?: string | null;
  readonly className?: string;
  readonly delay?: number;
}

export function MetricCard({
  label,
  value,
  suffix = "",
  description,
  className,
  delay = 0.2,
}: MetricCardProps) {
  // Compute font-size class based on digit count so large numbers
  // (e.g. 12,567 contributions) never overflow the card.
  const sizeClass = getNumericSizeClass(value);

  return (
    <div
      className={clsx(
        "p-6 md:p-8 bg-surface border border-border rounded-lg relative overflow-hidden transition-all hover:border-border/80 group",
        className
      )}
    >
      <Stack space={3}>
        <Label className="text-muted-foreground group-hover:text-foreground/80 transition-colors">
          {label}
        </Label>

        <div className="flex items-baseline gap-1 min-w-0">
          <span
            className={clsx(
              "font-display font-black tracking-tighter text-foreground tabular-nums leading-none",
              sizeClass
            )}
          >
            <Counter value={value} delay={delay} />
          </span>
          {suffix && (
            <span className="font-display text-2xl font-bold text-muted-foreground flex-shrink-0">
              {suffix}
            </span>
          )}
        </div>

        {description && <Subtitle className="text-sm">{description}</Subtitle>}
      </Stack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: Statistic
// ---------------------------------------------------------------------------

interface StatisticProps {
  readonly label: string;
  readonly value: string | number;
  readonly className?: string;
}

export function Statistic({ label, value, className }: StatisticProps) {
  return (
    <div className={clsx("flex flex-col gap-1", className)}>
      <span className="font-sans text-xs md:text-sm font-medium text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">{value}</span>
    </div>
  );
}
