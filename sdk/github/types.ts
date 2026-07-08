// ---------------------------------------------------------------------------
// GitHub SDK — Shared TypeScript Interfaces
// ---------------------------------------------------------------------------
// This file contains raw API response shapes and SDK-level types.
// These are NOT analytics types and NOT story types.
// They represent what the GitHub API returns, faithfully typed.
//
// Naming conventions:
// - Raw response types (from the API)   → prefixed with nothing, they ARE the contract
// - Input types (function parameters)   → suffixed with Input or Options
// - Result types (function returns)     → suffixed with Result
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// GraphQL plumbing
// ---------------------------------------------------------------------------

/**
 * Shape of the outermost JSON body from any GitHub GraphQL response.
 * `data` is generic — each query provides its own concrete type argument.
 */
export interface GraphQLResponse<TData> {
  readonly data?: TData;
  readonly errors?: ReadonlyArray<{
    readonly message: string;
    readonly type?: string;
    readonly path?: ReadonlyArray<string | number>;
    readonly locations?: ReadonlyArray<{ readonly line: number; readonly column: number }>;
  }>;
}

/**
 * Options accepted by the low-level `executeQuery` function.
 */
export interface GraphQLRequestOptions {
  /** The raw GraphQL query string. */
  readonly query: string;
  /** GraphQL variables. Strongly type these at the call-site. */
  readonly variables?: Record<string, unknown>;
  /** Operation name for logging and error messages. */
  readonly operationName: string;
}

// ---------------------------------------------------------------------------
// GitHub User
// ---------------------------------------------------------------------------

/**
 * Core GitHub user profile fields returned by the API.
 * Matches the GraphQL `User` object fields we query.
 */
export interface GitHubUserProfile {
  /** GitHub handle, e.g. "torvalds". */
  readonly login: string;
  /** Display name. May be null if the user hasn't set one. */
  readonly name: string | null;
  /** Full URL to the user's avatar image. */
  readonly avatarUrl: string;
  /** User's bio text. May be null. */
  readonly bio: string | null;
  /** ISO 8601 date the account was created. */
  readonly createdAt: string;
  /** Total number of public repositories owned by the user. */
  readonly publicRepos: number;
  /** Total number of followers. */
  readonly followers: number;
  /** Total number of accounts the user is following. */
  readonly following: number;
  /** User's public website URL. May be null. */
  readonly websiteUrl: string | null;
  /** User's Twitter/X username. May be null. */
  readonly twitterUsername: string | null;
  /** User's company affiliation. May be null. */
  readonly company: string | null;
  /** User's location. May be null. */
  readonly location: string | null;
}

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------

/**
 * A single day in the GitHub contribution calendar.
 */
export interface ContributionDay {
  /** ISO 8601 date string, e.g. "2024-03-15". */
  readonly date: string;
  /** Number of contributions on this day. */
  readonly contributionCount: number;
  /** GitHub's contribution level (NONE | FIRST_QUARTILE | SECOND_QUARTILE | THIRD_QUARTILE | FOURTH_QUARTILE). */
  readonly contributionLevel:
    | "NONE"
    | "FIRST_QUARTILE"
    | "SECOND_QUARTILE"
    | "THIRD_QUARTILE"
    | "FOURTH_QUARTILE";
  /** Hex color string assigned by GitHub for this level. */
  readonly color: string;
}

/**
 * A single week row in the contribution calendar.
 */
export interface ContributionWeek {
  /** The first day of this calendar week. */
  readonly firstDay: string;
  readonly contributionDays: ReadonlyArray<ContributionDay>;
}

/**
 * The full GitHub contribution calendar for a user in a given year.
 */
export interface ContributionCalendar {
  /** Total contributions across all tracked days. */
  readonly totalContributions: number;
  readonly weeks: ReadonlyArray<ContributionWeek>;
}

/**
 * All contribution-related data for a user, as returned by the API.
 */
export interface GitHubRepositoryCommitActivity {
  readonly repositoryPath: string;
  readonly commitCount: number;
  readonly primaryLanguage: {
    readonly name: string;
    readonly color: string | null;
  } | null;
}

export interface GitHubPeakContributionDay {
  readonly date: string;
  readonly commitCount: number;
  readonly repositoryPath: string | null;
}

export interface ContributionCollection {
  readonly contributionCalendar: ContributionCalendar;
  /** Total commits the user authored in the period. */
  readonly totalCommitContributions: number;
  /** Total pull requests opened in the period. */
  readonly totalPullRequestContributions: number;
  /** Total issues opened in the period. */
  readonly totalIssueContributions: number;
  /** Total pull request reviews submitted in the period. */
  readonly totalPullRequestReviewContributions: number;
  /** Total repositories the user contributed to. */
  readonly totalRepositoriesWithContributedCommits: number;
  /**
   * Restricted contribution count. Non-zero only when the user has
   * opted to show private contributions.
   */
  readonly restrictedContributionsCount: number;
  /** Per-repository commit activity counts. */
  readonly repositoryActivity: ReadonlyArray<GitHubRepositoryCommitActivity>;
  /** The single peak contribution day. */
  readonly peakDay: GitHubPeakContributionDay | null;
}

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------

/**
 * Primary language of a repository, as GitHub represents it.
 */
export interface RepositoryLanguage {
  readonly name: string;
  /** Hex color for the language, e.g. "#f1e05a" for JavaScript. */
  readonly color: string | null;
}

/**
 * A single repository the user owns or has contributed to.
 */
export interface GitHubRepository {
  readonly id: string;
  readonly name: string;
  /** Full owner/repo name, e.g. "vercel/next.js". */
  readonly nameWithOwner: string;
  readonly description: string | null;
  /** ISO 8601 creation date. */
  readonly createdAt: string;
  /** ISO 8601 date of the most recent push. */
  readonly pushedAt: string | null;
  /** ISO 8601 date of the most recent update (includes metadata changes). */
  readonly updatedAt: string;
  readonly stargazerCount: number;
  readonly forkCount: number;
  readonly watcherCount: number;
  readonly openIssueCount: number;
  readonly openPullRequestCount: number;
  readonly isPrivate: boolean;
  readonly isFork: boolean;
  readonly isArchived: boolean;
  /** The primary language GitHub detected for this repository. */
  readonly primaryLanguage: RepositoryLanguage | null;
  /** All languages detected in this repository, ordered by size (bytes). */
  readonly languages: RepositoryLanguages;
  /** Total disk usage in kilobytes. */
  readonly diskUsage: number | null;
  /** URL of the repository on GitHub. */
  readonly url: string;
  readonly defaultBranch: string | null;
  readonly homepageUrl: string | null;
  readonly visibility: string;
  readonly topics: ReadonlyArray<string>;
}

/**
 * A language entry within a repository's `languages` connection.
 * The `size` is in bytes of code written in that language.
 */
export interface RepositoryLanguageEdge {
  /** Bytes of code written in this language within the repository. */
  readonly size: number;
  readonly node: RepositoryLanguage;
}

/**
 * Aggregated language data for a repository.
 */
export interface RepositoryLanguages {
  /** Total bytes across all languages in this repository. */
  readonly totalSize: number;
  readonly edges: ReadonlyArray<RepositoryLanguageEdge>;
}

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

export type PullRequestState = "OPEN" | "CLOSED" | "MERGED";

/** Label applied to a pull request or issue. */
export interface GitHubLabel {
  readonly name: string;
  readonly color: string;
}

/**
 * A single pull request authored by the user.
 * Enriched with code change metrics and engagement signals.
 */
export interface GitHubPullRequest {
  readonly id: string;
  readonly title: string;
  readonly state: PullRequestState;
  readonly createdAt: string;
  readonly mergedAt: string | null;
  readonly closedAt: string | null;
  readonly url: string;
  /** Number of lines added. */
  readonly additions: number;
  /** Number of lines deleted. */
  readonly deletions: number;
  /** Number of files changed in this PR. */
  readonly changedFiles: number;
  /** Total number of comments on this PR. */
  readonly commentCount: number;
  /** Total number of review requests on this PR. */
  readonly reviewRequestCount: number;
  /**
   * The repository this PR targets.
   * Null if the repository was deleted after the PR was opened.
   */
  readonly baseRepository: {
    readonly nameWithOwner: string;
    readonly isPrivate: boolean;
  } | null;
  readonly labels: ReadonlyArray<GitHubLabel>;
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

export type IssueState = "OPEN" | "CLOSED";

/**
 * A single issue authored by the user.
 * Enriched with engagement metrics for analytics.
 */
export interface GitHubIssue {
  readonly id: string;
  readonly title: string;
  readonly state: IssueState;
  readonly createdAt: string;
  readonly closedAt: string | null;
  readonly url: string;
  /** Total number of comments on this issue. */
  readonly commentCount: number;
  /** Total number of emoji reactions on this issue. */
  readonly reactionCount: number;
  /** Labels applied to this issue. */
  readonly labels: ReadonlyArray<GitHubLabel>;
  /** The repository this issue belongs to. */
  readonly repository: {
    readonly nameWithOwner: string;
    readonly isPrivate: boolean;
  };
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

/**
 * Standard GitHub pagination info for a GraphQL connection.
 */
export interface PageInfo {
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;
  readonly startCursor: string | null;
  readonly endCursor: string | null;
}

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------

/**
 * A single commit authored by the user on a specific repository.
 */
export interface GitHubCommit {
  /** Full SHA-1 hash. */
  readonly oid: string;
  /** First line of the commit message. */
  readonly messageHeadline: string;
  /** Full commit message including body. */
  readonly message: string;
  /** ISO 8601 timestamp when the commit was authored. */
  readonly committedDate: string;
  /** Number of lines added. */
  readonly additions: number;
  /** Number of lines deleted. */
  readonly deletions: number;
  /**
   * Number of files changed.
   * May be null for very large commits.
   */
  readonly changedFiles: number | null;
}

// ---------------------------------------------------------------------------
// Organizations
// ---------------------------------------------------------------------------

/**
 * A GitHub organization the user is a public member of.
 */
export interface GitHubOrganization {
  /** Organisation login handle (slug). */
  readonly login: string;
  readonly name: string | null;
  /** Full URL to the organisation's avatar image. */
  readonly avatarUrl: string;
  readonly description: string | null;
  readonly url: string;
  readonly websiteUrl: string | null;
  readonly memberCount: number;
  readonly repositoryCount: number;
}

// ---------------------------------------------------------------------------
// Achievement Signals
// ---------------------------------------------------------------------------

/**
 * Raw count signals used by the Analytics Engine to compute achievements.
 * These are all-time counts, not year-scoped, unless noted.
 * The Analytics Engine applies thresholds to determine unlocked achievements.
 */
export interface GitHubAchievementSignals {
  readonly login: string;
  readonly followers: number;
  readonly following: number;
  /** Owned, non-fork, public repository count. */
  readonly publicRepositoryCount: number;
  readonly starredRepositoryCount: number;
  readonly publicGistCount: number;
  readonly packageCount: number;
  readonly sponsoringCount: number;
  readonly sponsorCount: number;
  /** All-time merged pull request count. */
  readonly totalMergedPullRequests: number;
  /** All-time issue count. */
  readonly totalIssues: number;
}

// ---------------------------------------------------------------------------
// Rate Limit
// ---------------------------------------------------------------------------

/**
 * GitHub API rate limit info embedded in every GraphQL response.
 */
export interface GitHubRateLimit {
  /** Maximum number of requests allowed in the current window. */
  readonly limit: number;
  /** Remaining requests in the current window. */
  readonly remaining: number;
  /** Number of requests consumed in the current window. */
  readonly used: number;
  /** ISO 8601 timestamp when the window resets. */
  readonly resetAt: string;
  /** Cost of the most recent operation (GraphQL only). */
  readonly cost: number;
}

// ---------------------------------------------------------------------------
// Service result types
// ---------------------------------------------------------------------------

/**
 * The complete raw data payload returned by the GitHub service
 * for a user's annual recap. This is the contract between the SDK
 * and the Analytics Engine — it must never include computed values.
 *
 * New fields added here must reflect raw API data only.
 * Computed values (streaks, percentages, rankings) belong in the Analytics Engine.
 */
export interface GitHubAnnualData {
  readonly user: GitHubUserProfile;
  readonly contributions: ContributionCollection;
  readonly repositories: ReadonlyArray<GitHubRepository>;
  readonly pullRequests: ReadonlyArray<GitHubPullRequest>;
  readonly issues: ReadonlyArray<GitHubIssue>;
  readonly organizations: ReadonlyArray<GitHubOrganization>;
  readonly achievementSignals: GitHubAchievementSignals;
  /** The year this data represents. */
  readonly year: number;
  /** ISO 8601 timestamp when this data was fetched. */
  readonly fetchedAt: string;
}

// ---------------------------------------------------------------------------
// Service input types
// ---------------------------------------------------------------------------

/**
 * Options for fetching a user's annual GitHub data.
 */
export interface FetchAnnualDataOptions {
  readonly username: string;
  readonly year: number;
}
