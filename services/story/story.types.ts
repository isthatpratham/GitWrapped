import type { DataAvailability } from "@/domain/models";

export type StoryTheme = "minimal" | "focus" | "highlight" | "celebration" | "reflection" | "summary";

export type MotionPreset =
  | "fadeUp"
  | "fade"
  | "heroReveal"
  | "chartReveal"
  | "counterReveal"
  | "timelineReveal"
  | "summaryReveal";

export type SlideTransition = "crossfade" | "fade" | "slide" | "shared";

/**
 * Narrative chapters. These are story structure, not dashboard sections.
 */
export type StoryChapter =
  | "OPENING"
  | "YOUR_YEAR"
  | "YOUR_RHYTHM"
  | "YOUR_BUILD"
  | "MILESTONES"
  | "REFLECTION"
  | "FINALE";

export type StorySlideType =
  | "Welcome"
  | "Overview"
  | "Contributions"
  | "Consistency"
  | "Productivity"
  | "Languages"
  | "Repositories"
  | "Organizations"
  | "Achievements"
  | "Timeline"
  | "Highlights"
  | "Summary"
  | "Closing";

export interface StoryEvidence {
  readonly label: string;
  readonly value: string;
}

/**
 * Core slide schema consumed by the existing Story Player.
 * New intelligence fields are additive so current rendering keeps working.
 */
export interface StorySlide {
  readonly id: string;
  readonly type: StorySlideType;
  readonly chapter: StoryChapter;
  readonly title: string;
  readonly subtitle: string | null;
  readonly headline: string;
  readonly description: string;
  readonly heroValue: string | number | null;
  readonly icon: string | null;
  readonly priority: number;
  readonly duration: number;
  readonly theme: StoryTheme;
  readonly motion: MotionPreset;
  readonly transition: SlideTransition;
  readonly analyticsReference: string;
  readonly insightId: string | null;
  readonly availability: DataAvailability;
  readonly evidence: readonly StoryEvidence[];
  readonly shareable: boolean;
  readonly metadata: Record<string, unknown>;
}

export interface StoryChapterBlock {
  readonly id: StoryChapter;
  readonly title: string;
  readonly slideIds: readonly string[];
}

export interface StoryDeveloper {
  readonly handle: string;
  readonly displayName: string | null;
  readonly avatarUrl: string;
}

export interface StoryMetadata {
  readonly username: string;
  readonly avatarUrl?: string;
  readonly year: number;
  readonly generatedAt: string;
  readonly version: string;
}

export interface StoryOverview {
  readonly totalSlides: number;
  readonly totalDurationMs: number;
  readonly primaryTheme: StoryTheme;
}

export interface StoryProgression {
  readonly autoPlay: boolean;
  readonly defaultSlideDurationMs: number;
}

export interface StoryNavigation {
  readonly keyboardShortcuts: boolean;
  readonly touchSwipe: boolean;
  readonly scrollSnapping: boolean;
}

export interface StorySharing {
  readonly shareUrl: string;
  readonly defaultShareText: string;
  readonly hashTags: readonly string[];
}

export type DeveloperRhythm =
  | "Night Builder"
  | "Consistent Builder"
  | "Sprint Builder"
  | "Explorer"
  | "Specialist"
  | "Open Source Builder"
  | "Comeback Builder";

/**
 * Canonical Story Engine output. Independent of React.
 */
export interface Story {
  readonly year: number;
  readonly developer: StoryDeveloper;
  readonly chapters: readonly StoryChapterBlock[];
  readonly metadata: StoryMetadata;
  readonly overview: StoryOverview;
  readonly slides: readonly StorySlide[];
  readonly rhythm: DeveloperRhythm | null;
  readonly progression: StoryProgression;
  readonly navigation: StoryNavigation;
  readonly sharing: StorySharing;
}
