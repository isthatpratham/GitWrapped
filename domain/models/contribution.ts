// ---------------------------------------------------------------------------
// Domain Model: Contribution
// ---------------------------------------------------------------------------
// Represents a user's coding activity as GitWrapped understands it.
//
// GraphQL concepts removed:
// - `contributionsCollection` → `ContributionHistory`
// - `contributionDays` → `days`
// - `firstDay` → `weekStartDate`
// - `totalCommitContributions` → `commitCount`
// - `totalPullRequestContributions` → `pullRequestCount`
// - `totalIssueContributions` → `issueCount`
// - `totalPullRequestReviewContributions` → `reviewCount`
// - `totalRepositoriesWithContributedCommits` → `activeRepositoryCount`
// - `restrictedContributionsCount` → `privateContributionCount`
// - `commitContributionsByRepository[].contributions.totalCount` → `commitCount`
// ---------------------------------------------------------------------------

/**
 * GitHub's five-tier contribution intensity level.
 * Maps directly to the heatmap shading in the contribution calendar.
 */
export type ContributionIntensity =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

/**
 * A single day in the contribution calendar heatmap.
 */
export interface ContributionDay {
  /** ISO 8601 date string, e.g. "2024-07-04". */
  readonly date: string;
  /** Number of contributions recorded on this day. */
  readonly count: number;
  /**
   * GitHub's intensity tier for this day.
   * Used for heatmap colour rendering.
   */
  readonly intensity: ContributionIntensity;
  /**
   * Hex color string assigned by GitHub for this intensity level.
   * Suitable for direct use in CSS/SVG rendering.
   */
  readonly color: string;
}

/**
 * One week row in the contribution calendar.
 * A week always starts on Sunday (GitHub's convention).
 */
export interface ContributionWeek {
  /** ISO 8601 date of the first day (Sunday) of this week. */
  readonly weekStartDate: string;
  /** Contribution data for each day in this week (up to 7 entries). */
  readonly days: ReadonlyArray<ContributionDay>;
}

/**
 * The full contribution calendar heatmap for a given year.
 * Contains all weeks and days needed to render the annual activity grid.
 */
export interface ContributionCalendar {
  /** Total contributions across all days in the calendar. */
  readonly totalCount: number;
  /** Ordered list of weeks, from Jan to Dec. */
  readonly weeks: ReadonlyArray<ContributionWeek>;
}

/**
 * Commit activity broken down per repository.
 * Used by analytics to identify the user's most-committed repository.
 */
export interface RepositoryCommitActivity {
  /** Full repository path, e.g. "vercel/next.js". */
  readonly repositoryPath: string;
  /** Number of commits the user made to this repository in the period. */
  readonly commitCount: number;
  /** Primary language of the repository, if known. */
  readonly primaryLanguage: {
    readonly name: string;
    readonly color: string | null;
  } | null;
}

/**
 * The user's peak contribution day in the recap period.
 */
export interface PeakContributionDay {
  /** ISO 8601 date of this peak day, e.g. "2024-03-14". */
  readonly date: string;
  /** Number of commits made on this day. */
  readonly commitCount: number;
  /** Repository that received these commits, if known. */
  readonly repositoryPath: string | null;
}

/**
 * The complete contribution history for a user in a specific year.
 * This is the primary input to the Analytics Engine's streak, heatmap,
 * and activity calculations.
 *
 * Replaces the SDK's `ContributionCollection` and `ContributionCalendar`
 * with domain-appropriate naming.
 */
export interface ContributionHistory {
  /** Full heatmap calendar with per-day data. */
  readonly calendar: ContributionCalendar;
  /** Total commits authored in the recap period. */
  readonly commitCount: number;
  /** Total pull requests opened in the recap period. */
  readonly pullRequestCount: number;
  /** Total issues opened in the recap period. */
  readonly issueCount: number;
  /** Total code reviews submitted in the recap period. */
  readonly reviewCount: number;
  /**
   * Number of distinct repositories the user committed to in the period.
   */
  readonly activeRepositoryCount: number;
  /**
   * Number of private contributions included in the totals above.
   * Non-zero only when the user has enabled "include private contributions"
   * in their GitHub profile settings.
   */
  readonly privateContributionCount: number;
  /**
   * Commit activity broken down by repository.
   * Contains the top repositories by commit count (up to 10).
   */
  readonly repositoryActivity: ReadonlyArray<RepositoryCommitActivity>;
  /**
   * The single day with the most commits in the recap period.
   * Null when no public contribution data is available.
   */
  readonly peakDay: PeakContributionDay | null;
}
