// ---------------------------------------------------------------------------
// Domain Model: Analytics
// ---------------------------------------------------------------------------
// Defines the output contracts of the Analytics Engine.
// The Story Engine consumes these interfaces exclusively.
//
// IMPORTANT: This file defines SHAPES only — no calculations live here.
// Calculations are the Analytics Engine's responsibility.
//
// Design principle:
// - Every field here represents a COMPUTED insight, not raw data.
// - Raw data lives in domain/models/{user,repository,contribution,...}.ts
// - The live Analytics Engine snapshot consumed by the Story Engine is
//   `AnalyticsResult` in `services/analytics/analytics.types.ts`.
//   `AnnualAnalytics` below is a legacy shape retained for type reuse
//   (streaks, language entries). Do not add new consumers of it.
// ---------------------------------------------------------------------------

import type { LanguageUsage } from "./language";
import type { Repository } from "./repository";
import type { PullRequest, Issue } from "./activity";
import type { Organization } from "./organization";

// ---------------------------------------------------------------------------
// Streak Analytics
// ---------------------------------------------------------------------------

/**
 * The result of a contribution streak analysis.
 * A "streak" is a contiguous sequence of days with at least one contribution.
 */
export interface StreakAnalytics {
  /** Number of days in the longest streak during the recap period. */
  readonly longestStreakDays: number;
  /** ISO 8601 start date of the longest streak. */
  readonly longestStreakStartDate: string;
  /** ISO 8601 end date of the longest streak. */
  readonly longestStreakEndDate: string;
  /**
   * Number of days in the current active streak at the time of recap.
   * Zero if the user has not contributed today or yesterday.
   */
  readonly currentStreakDays: number;
  /** ISO 8601 start date of the current streak. Null if no active streak. */
  readonly currentStreakStartDate: string | null;
  /** Total number of days with at least one contribution in the year. */
  readonly totalActiveDays: number;
}

// ---------------------------------------------------------------------------
// Contribution Analytics
// ---------------------------------------------------------------------------

/**
 * The most active day of the week, zero-indexed (0 = Sunday, 6 = Saturday).
 */
export interface DayOfWeekActivity {
  /** Day index: 0 (Sunday) through 6 (Saturday). */
  readonly dayIndex: number;
  /** Day name, e.g. "Thursday". */
  readonly dayName: string;
  /** Average contributions on this day of the week. */
  readonly averageContributions: number;
}

/**
 * The most active hour of the day, 0–23 (UTC).
 */
export interface HourOfDayActivity {
  /** Hour in 24-hour UTC time (0–23). */
  readonly hour: number;
  /** Total contributions in this hour across the year. */
  readonly totalContributions: number;
}

/**
 * Contribution totals and patterns for the recap period.
 */
export interface ContributionAnalytics {
  /** Total contributions (all types combined) in the year. */
  readonly totalContributions: number;
  /** Commits authored. */
  readonly commitCount: number;
  /** Pull requests opened. */
  readonly pullRequestCount: number;
  /** Issues opened. */
  readonly issueCount: number;
  /** Code reviews submitted. */
  readonly reviewCount: number;
  /** The best single contribution day. */
  readonly bestDay: {
    readonly date: string;
    readonly count: number;
  };
  /** Streak analysis results. */
  readonly streak: StreakAnalytics;
  /** Most active day of the week (averaged across the year). */
  readonly mostActiveDayOfWeek: DayOfWeekActivity;
  /**
   * Total lines of code written (additions across all PRs and commits).
   */
  readonly linesWritten: number;
}

// ---------------------------------------------------------------------------
// Repository Analytics
// ---------------------------------------------------------------------------

/**
 * Repository analytics insights for the recap period.
 */
export interface RepositoryAnalytics {
  /** Total owned (non-fork) public repositories. */
  readonly totalRepositories: number;
  /** Repository with the most GitHub stars. */
  readonly mostStarred: Repository | null;
  /** Repository with the most forks. */
  readonly mostForked: Repository | null;
  /** Repository with the most commits in the recap year. */
  readonly mostActiveThisYear: Repository | null;
  /** Total stars across all owned repositories. */
  readonly totalStars: number;
  /** Total forks across all owned repositories. */
  readonly totalForks: number;
  /** Repositories created in the recap year. */
  readonly newRepositoriesThisYear: ReadonlyArray<Repository>;
}

// ---------------------------------------------------------------------------
// Language Analytics
// ---------------------------------------------------------------------------

/**
 * A language entry with its computed percentage of total usage.
 */
export interface LanguageAnalyticsEntry {
  /** Raw usage data from the domain model. */
  readonly usage: LanguageUsage;
  /** Percentage of total portfolio bytes (0–100, two decimal places). */
  readonly percentage: number;
}

/**
 * Language breakdown analytics for the recap period.
 */
export interface LanguageAnalytics {
  /** The language with the most bytes written. */
  readonly topLanguage: LanguageAnalyticsEntry | null;
  /** All languages ordered by usage percentage descending. */
  readonly breakdown: ReadonlyArray<LanguageAnalyticsEntry>;
  /** Number of distinct languages used across all repositories. */
  readonly uniqueLanguageCount: number;
}

// ---------------------------------------------------------------------------
// Pull Request Analytics
// ---------------------------------------------------------------------------

/**
 * Pull request analytics for the recap period.
 */
export interface PullRequestAnalytics {
  /** Total PRs opened in the year. */
  readonly opened: number;
  /** PRs that were merged. */
  readonly merged: number;
  /** PRs that were closed without merging. */
  readonly closed: number;
  /**
   * Merge rate as a value 0–1.
   * 0 when no PRs were opened.
   */
  readonly mergeRate: number;
  /** The PR with the most lines changed (additions + deletions). */
  readonly biggestPullRequest: PullRequest | null;
  /** Total lines added across all merged PRs in the year. */
  readonly totalLinesAdded: number;
  /** Total lines deleted across all merged PRs in the year. */
  readonly totalLinesDeleted: number;
}

// ---------------------------------------------------------------------------
// Issue Analytics
// ---------------------------------------------------------------------------

/**
 * Issue analytics for the recap period.
 */
export interface IssueAnalytics {
  /** Total issues opened in the year. */
  readonly opened: number;
  /** Issues that were closed. */
  readonly closed: number;
  /**
   * Close rate as a value 0–1.
   * 0 when no issues were opened.
   */
  readonly closeRate: number;
  /** The issue with the most emoji reactions. */
  readonly mostReactedIssue: Issue | null;
}

// ---------------------------------------------------------------------------
// Achievement Analytics
// ---------------------------------------------------------------------------

/** An individual achievement the user has unlocked. */
export interface Achievement {
  /** Unique machine-readable identifier, e.g. "star-collector". */
  readonly id: string;
  /** Human-readable achievement title, e.g. "Star Collector". */
  readonly title: string;
  /** Short description explaining why this was unlocked. */
  readonly description: string;
  /**
   * Tier of this achievement.
   * Higher tiers indicate more impressive thresholds.
   */
  readonly tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
}

/**
 * All achievements unlocked by the user in this recap.
 */
export interface AchievementAnalytics {
  readonly achievements: ReadonlyArray<Achievement>;
  readonly count: number;
}

// ---------------------------------------------------------------------------
// Community Analytics
// ---------------------------------------------------------------------------

/**
 * Community involvement signals for the recap period.
 */
export interface CommunityAnalytics {
  /** Public organisations the user is a member of. */
  readonly organizations: ReadonlyArray<Organization>;
  /** Number of developers following the user. */
  readonly followerCount: number;
  /** Whether the user sponsors any open-source developers. */
  readonly isASponsor: boolean;
  /** Whether the user is sponsored by others. */
  readonly hasSponsor: boolean;
}

// ---------------------------------------------------------------------------
// Top-level analytics output
// ---------------------------------------------------------------------------

/**
 * The complete analytics payload produced by the Analytics Engine for one
 * user in one year. This is the sole input to the Story Engine.
 *
 * The Story Engine must never receive raw domain models — only this struct.
 */
export interface AnnualAnalytics {
  /** The year this analytics payload represents. */
  readonly year: number;
  /** ISO 8601 timestamp when this analytics was computed. */
  readonly computedAt: string;
  /** User identity for the recap. */
  readonly user: {
    readonly handle: string;
    readonly displayName: string | null;
    readonly avatarUrl: string;
    readonly accountCreatedAt: string;
  };
  readonly contributions: ContributionAnalytics;
  readonly repositories: RepositoryAnalytics;
  readonly languages: LanguageAnalytics;
  readonly pullRequests: PullRequestAnalytics;
  readonly issues: IssueAnalytics;
  readonly achievements: AchievementAnalytics;
  readonly community: CommunityAnalytics;
}
