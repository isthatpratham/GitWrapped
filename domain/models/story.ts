// ---------------------------------------------------------------------------
// Domain Model: Story
// ---------------------------------------------------------------------------
// Defines the output contracts of the Story Engine.
// The Presentation Layer (React components) consumes these interfaces.
//
// IMPORTANT: This file defines SHAPES only — no rendering logic here.
// Rendering is the UI layer's responsibility.
//
// The live Story Engine snapshot consumed by the player is `Story`
// from `@/services/story`. This file is a leftover sketch and is not
// the canonical contract.
//
// Design principle:
// - Every slide type has exactly one `kind` discriminant.
// - No slide carries derived data — the Story Engine resolves all that.
// - The UI layer switches on `kind` and renders without business logic.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

/** A number-and-label pair used for stat displays. */
export interface StoryStat {
  readonly label: string;
  readonly value: number | string;
}

/** A highlighted text excerpt with an optional context line. */
export interface StoryHighlight {
  readonly headline: string;
  readonly subtext: string | null;
}

// ---------------------------------------------------------------------------
// Slide kind discriminants
// ---------------------------------------------------------------------------

/**
 * Every possible slide type in a GitWrapped story deck.
 * Adding a new slide type here makes it available to the Story Engine
 * without changing any existing rendering code.
 */
export type SlideKind =
  | "intro"
  | "contribution-heatmap"
  | "streak"
  | "top-language"
  | "language-breakdown"
  | "repositories"
  | "pull-requests"
  | "issues"
  | "community"
  | "achievements"
  | "peak-day"
  | "coding-schedule"
  | "outro";

// ---------------------------------------------------------------------------
// Slide definitions
// ---------------------------------------------------------------------------

/** Common fields present on every slide. */
export interface BaseSlide {
  /** Unique identifier for this slide within the deck. */
  readonly id: string;
  /** Discriminant used by the UI to select the correct renderer. */
  readonly kind: SlideKind;
}

/** The opening slide introducing the user. */
export interface IntroSlide extends BaseSlide {
  readonly kind: "intro";
  readonly handle: string;
  readonly displayName: string | null;
  readonly avatarUrl: string;
  readonly year: number;
  readonly headline: string;
}

/** Full-year contribution calendar heatmap slide. */
export interface ContributionHeatmapSlide extends BaseSlide {
  readonly kind: "contribution-heatmap";
  readonly totalContributions: number;
  readonly headline: string;
  /** All calendar weeks, passed directly to the heatmap renderer. */
  readonly weeks: ReadonlyArray<{
    readonly weekStartDate: string;
    readonly days: ReadonlyArray<{
      readonly date: string;
      readonly count: number;
      readonly color: string;
    }>;
  }>;
}

/** Streak statistics slide. */
export interface StreakSlide extends BaseSlide {
  readonly kind: "streak";
  readonly headline: string;
  readonly longestStreakDays: number;
  readonly currentStreakDays: number;
  readonly totalActiveDays: number;
  readonly longestStreakStartDate: string;
  readonly longestStreakEndDate: string;
}

/** The user's number-one language slide. */
export interface TopLanguageSlide extends BaseSlide {
  readonly kind: "top-language";
  readonly headline: string;
  readonly languageName: string;
  readonly languageColor: string | null;
  readonly percentage: number;
  readonly repositoryCount: number;
}

/** Portfolio-wide language breakdown slide. */
export interface LanguageBreakdownSlide extends BaseSlide {
  readonly kind: "language-breakdown";
  readonly headline: string;
  readonly uniqueLanguageCount: number;
  readonly breakdown: ReadonlyArray<{
    readonly name: string;
    readonly color: string | null;
    readonly percentage: number;
  }>;
}

/** Top repositories slide. */
export interface RepositoriesSlide extends BaseSlide {
  readonly kind: "repositories";
  readonly headline: string;
  readonly totalStars: number;
  readonly totalRepositories: number;
  readonly highlights: ReadonlyArray<{
    readonly name: string;
    readonly starCount: number;
    readonly primaryLanguage: string | null;
    readonly url: string;
  }>;
}

/** Pull request impact slide. */
export interface PullRequestsSlide extends BaseSlide {
  readonly kind: "pull-requests";
  readonly headline: string;
  readonly stats: ReadonlyArray<StoryStat>;
  readonly biggestPullRequestTitle: string | null;
  readonly linesWritten: number;
}

/** Issues authored slide. */
export interface IssuesSlide extends BaseSlide {
  readonly kind: "issues";
  readonly headline: string;
  readonly stats: ReadonlyArray<StoryStat>;
  readonly mostImpactfulIssueTitle: string | null;
}

/** Community and organisations slide. */
export interface CommunitySlide extends BaseSlide {
  readonly kind: "community";
  readonly headline: string;
  readonly followerCount: number;
  readonly organizationCount: number;
  readonly organizations: ReadonlyArray<{
    readonly handle: string;
    readonly displayName: string | null;
    readonly avatarUrl: string;
  }>;
}

/** Achievements unlocked slide. */
export interface AchievementsSlide extends BaseSlide {
  readonly kind: "achievements";
  readonly headline: string;
  readonly count: number;
  readonly achievements: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  }>;
}

/** Peak contribution day slide. */
export interface PeakDaySlide extends BaseSlide {
  readonly kind: "peak-day";
  readonly headline: string;
  readonly date: string;
  readonly commitCount: number;
  readonly repositoryPath: string;
}

/** Coding schedule (day-of-week / hour-of-day) slide. */
export interface CodingScheduleSlide extends BaseSlide {
  readonly kind: "coding-schedule";
  readonly headline: string;
  readonly mostActiveDayName: string;
  readonly mostActiveHour: number | null;
}

/** The closing slide. */
export interface OutroSlide extends BaseSlide {
  readonly kind: "outro";
  readonly headline: string;
  readonly subtext: string;
  readonly year: number;
}

// ---------------------------------------------------------------------------
// Discriminated union of all slides
// ---------------------------------------------------------------------------

/**
 * A slide is any one of the strongly-typed slide variants.
 * The UI layer switches on `slide.kind` to select the renderer.
 *
 * @example
 * function renderSlide(slide: Slide) {
 *   switch (slide.kind) {
 *     case "intro": return <IntroRenderer slide={slide} />;
 *     case "streak": return <StreakRenderer slide={slide} />;
 *     // ...
 *   }
 * }
 */
export type Slide =
  | IntroSlide
  | ContributionHeatmapSlide
  | StreakSlide
  | TopLanguageSlide
  | LanguageBreakdownSlide
  | RepositoriesSlide
  | PullRequestsSlide
  | IssuesSlide
  | CommunitySlide
  | AchievementsSlide
  | PeakDaySlide
  | CodingScheduleSlide
  | OutroSlide;

// ---------------------------------------------------------------------------
// Story Deck
// ---------------------------------------------------------------------------

/** Theme options for rendering slides in the presentation deck. */
export type SlideTheme = "cyberpunk" | "neon" | "minimal" | "retro";

/**
 * A complete story deck — the final output of the Story Engine and the
 * sole input to the UI Presentation Layer.
 *
 * The UI layer must never receive `AnnualAnalytics` directly.
 * It only receives a `StoryDeck`.
 */
export interface StoryDeck {
  /** Unique identifier for this deck (e.g., `"torvalds-2024"`). */
  readonly id: string;
  /** GitHub handle of the user this deck belongs to. */
  readonly handle: string;
  /** Display name of the user this deck belongs to. */
  readonly displayName: string | null;
  /** Avatar URL of the user. */
  readonly avatarUrl: string;
  /** The year this recap covers. */
  readonly year: number;
  /** Theme to apply to the slides. */
  readonly theme: SlideTheme;
  /** ISO 8601 timestamp when this deck was generated. */
  readonly generatedAt: string;
  /** Ordered list of slides to display. */
  readonly slides: ReadonlyArray<Slide>;
}

