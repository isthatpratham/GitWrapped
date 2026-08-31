"use client";

import React from "react";
import { clsx } from "clsx";
import { ChevronLeft, ChevronRight, X, Play, Pause } from "@/components/icons";
import { Avatar } from "@/components/ui/Avatar";
import { Caption } from "@/components/ui/Typography";

// ---------------------------------------------------------------------------
// Component: StoryFrame
// ---------------------------------------------------------------------------
// Locks the story recap into a premium 9:16 mobile aspect ratio frame.
// Centers on desktop with fine borders and dark backdrop.
// ---------------------------------------------------------------------------

export interface StoryFrameProps {
  readonly children: React.ReactNode;
  readonly className?: string;
}

export function StoryFrame({ children, className }: StoryFrameProps) {
  return (
    <div
      className={clsx(
        "relative w-full h-full min-h-0 md:h-[840px] md:w-[480px] md:rounded-xl md:border md:border-border bg-background md:shadow-2xl overflow-hidden flex flex-col justify-between select-none",
        className
      )}
    >
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StoryProgress
// ---------------------------------------------------------------------------
// Displays segmented progress bars corresponding to slide index and elapsed time.
// ---------------------------------------------------------------------------

export interface StoryProgressProps {
  readonly groups: ReadonlyArray<{
    readonly chapter: string;
    readonly title: string;
    readonly segments: ReadonlyArray<{ readonly index: number; readonly fill: number }>;
  }>;
  readonly label: string;
  readonly onSegmentClick?: (index: number) => void;
}

export function StoryProgress({ groups, label, onSegmentClick }: StoryProgressProps) {
  return (
    <div className="w-full px-4 pt-3 pb-1 z-raised">
      <div className="flex gap-2" role="group" aria-label={label}>
        {groups.map((group) => (
          <div
            key={group.chapter}
            className="flex flex-1 gap-0.5 min-w-0"
            role="group"
            aria-label={group.title}
          >
            {group.segments.map((segment) => (
              <button
                key={segment.index}
                type="button"
                onClick={() => onSegmentClick?.(segment.index)}
                aria-label={`${group.title}, slide ${segment.index + 1}`}
                aria-current={segment.fill > 0 && segment.fill < 100 ? "true" : undefined}
                className="h-1 flex-1 min-w-1 bg-white/15 rounded-full overflow-hidden cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                <span
                  className="block h-full bg-primary rounded-full"
                  style={{ width: `${segment.fill}%` }}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StoryHeader
// ---------------------------------------------------------------------------

export interface StoryHeaderProps {
  readonly avatarUrl?: string | null;
  readonly username: string;
  readonly subtitle?: string;
  readonly isPaused?: boolean;
  readonly onPauseToggle?: () => void;
  readonly onClose?: () => void;
}

export function StoryHeader({
  avatarUrl,
  username,
  subtitle = "GitWrapped",
  isPaused = false,
  onPauseToggle,
  onClose,
}: StoryHeaderProps) {
  return (
    <div className="w-full flex items-center justify-between px-4 py-2 z-raised border-b border-border/10 bg-gradient-to-b from-black/40 to-transparent">
      <div className="flex items-center gap-2.5">
        <Avatar src={avatarUrl} size="sm" />
        <div className="flex flex-col">
          <span className="font-sans text-sm font-semibold tracking-tight text-foreground">{username}</span>
          <Caption className="text-[10px] text-white/50">{subtitle}</Caption>
        </div>
      </div>

      <div className="flex items-center gap-1">
        {onPauseToggle && (
          <button
            onClick={onPauseToggle}
            className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label={isPaused ? "Play" : "Pause"}
          >
            {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
        )}
        {onClose && (
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StoryNavigation
// ---------------------------------------------------------------------------
// Invisible tap zones on left and right sides to transition back and forth.
// Also displays elegant chevron arrows on hover.
// ---------------------------------------------------------------------------

export interface StoryNavigationProps {
  readonly onNext: () => void;
  readonly onPrev: () => void;
  readonly className?: string;
  readonly disableNext?: boolean;
  readonly disablePrev?: boolean;
}

export function StoryNavigation({
  onNext,
  onPrev,
  className,
  disableNext = false,
  disablePrev = false,
}: StoryNavigationProps) {
  return (
    <div className={clsx("absolute inset-y-0 inset-x-0 flex pointer-events-none z-raised", className)}>
      <button
        type="button"
        onClick={onPrev}
        disabled={disablePrev}
        className="w-1/4 h-full pointer-events-auto cursor-w-resize group flex items-center justify-start pl-4 disabled:cursor-default focus-visible:outline-none"
        aria-label="Previous slide"
      >
        <span className="h-9 w-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          <ChevronLeft className="h-4 w-4" />
        </span>
      </button>
      <div className="flex-1 h-full" />
      <button
        type="button"
        onClick={onNext}
        disabled={disableNext}
        className="w-1/4 h-full pointer-events-auto cursor-e-resize group flex items-center justify-end pr-4 disabled:cursor-default focus-visible:outline-none"
        aria-label="Next slide"
      >
        <span className="h-9 w-9 rounded-full bg-black/40 border border-white/10 flex items-center justify-center text-white/70 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity">
          <ChevronRight className="h-4 w-4" />
        </span>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StoryBackground
// ---------------------------------------------------------------------------
// Renders dynamic, premium backgrounds corresponding to active themes.
// ---------------------------------------------------------------------------

export function StoryBackground({ theme }: { readonly theme: string }) {
  // Theme gradients defined as standard class names
  const gradients: Record<string, string> = {
    minimal: "from-neutral-950 via-neutral-950 to-neutral-900",
    focus: "from-neutral-950 via-slate-950 to-indigo-950/40",
    highlight: "from-neutral-950 via-neutral-950 to-cyan-950/40",
    celebration: "from-neutral-950 via-purple-950/20 to-neutral-950",
    reflection: "from-neutral-950 via-neutral-950 to-rose-950/30",
    summary: "from-neutral-950 via-slate-950 to-neutral-950",
  };

  const activeGradient = gradients[theme] ?? gradients.minimal;

  return (
    <div
      className={clsx(
        "absolute inset-0 bg-gradient-to-b w-full h-full -z-10 transition-all duration-700 ease-out",
        activeGradient
      )}
    >
      {/* Editorial dotted grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:20px_20px]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component: StoryFooter
// ---------------------------------------------------------------------------

export function StoryFooter({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="w-full px-6 py-4 z-raised border-t border-border/10 bg-gradient-to-t from-black/40 to-transparent">
      {children}
    </div>
  );
}
