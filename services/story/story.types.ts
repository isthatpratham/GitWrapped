// ---------------------------------------------------------------------------
// Story Engine — Types
// ---------------------------------------------------------------------------
// Defines the slide schema and output contracts of the Story Engine.
// All properties are strictly typed and read-only.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics/analytics.types";

/**
 * Slide Themes supported by the UI Presentation Layer.
 */
export type StoryTheme = "minimal" | "focus" | "highlight" | "celebration" | "reflection" | "summary";

/**
 * Motion presets defined in MOTION_SYSTEM.md.
 */
export type MotionPreset =
  | "fadeUp"
  | "fade"
  | "heroReveal"
  | "chartReveal"
  | "counterReveal"
  | "timelineReveal"
  | "summaryReveal";

/**
 * Slide transitions supported by the UI.
 */
export type SlideTransition = "crossfade" | "fade" | "slide" | "shared";

/**
 * Core Slide Schema. Every slide in the story deck must satisfy this interface.
 * Contains structured metadata and presentation payloads, with no JSX/HTML/React.
 */
export interface StorySlide {
  readonly id: string;
  readonly type: string; // "Welcome" | "Overview" | "Contributions" | "Consistency" | "Productivity" | "Languages" | "Repositories" | "Organizations" | "Achievements" | "Timeline" | "Highlights" | "Summary" | "Closing"
  readonly title: string;
  readonly subtitle: string | null;
  readonly headline: string;
  readonly description: string;
  readonly icon: string | null;
  readonly priority: number;
  readonly duration: number; // in milliseconds
  readonly theme: StoryTheme;
  readonly motion: MotionPreset;
  readonly transition: SlideTransition;
  /** References the specific key path in Analytics data that generated this slide. */
  readonly analyticsReference: string;
  readonly shareable: boolean;
  readonly metadata: Record<string, unknown>;
}

/**
 * Metadata about the overall generated story.
 */
export interface StoryMetadata {
  readonly username: string;
  readonly avatarUrl?: string;
  readonly year: number;
  readonly generatedAt: string;
  readonly version: string;
}

/**
 * Brief overview statistics for pre-loading or sidebar displays.
 */
export interface StoryOverview {
  readonly totalSlides: number;
  readonly totalDurationMs: number;
  readonly primaryTheme: StoryTheme;
}

/**
 * Narrative progression settings.
 */
export interface StoryProgression {
  readonly autoPlay: boolean;
  readonly defaultSlideDurationMs: number;
}

/**
 * Unified Navigation options passed to the presentation controls.
 */
export interface StoryNavigation {
  readonly keyboardShortcuts: boolean;
  readonly touchSwipe: boolean;
  readonly scrollSnapping: boolean;
}

/**
 * Options to populate the sharing menu card.
 */
export interface StorySharing {
  readonly shareUrl: string;
  readonly defaultShareText: string;
  readonly hashTags: readonly string[];
}

/**
 * The final output of the Story Engine.
 * Replaces any direct coupling to API or Analytics payloads.
 */
export interface Story {
  readonly metadata: StoryMetadata;
  readonly overview: StoryOverview;
  readonly slides: readonly StorySlide[];
  readonly progression: StoryProgression;
  readonly navigation: StoryNavigation;
  readonly sharing: StorySharing;
}
