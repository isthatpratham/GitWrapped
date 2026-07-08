// ---------------------------------------------------------------------------
// Domain Model: Activity
// ---------------------------------------------------------------------------
// Represents discrete coding activities: pull requests, issues, and commits.
// These are the individual events that constitute a user's annual coding story.
//
// GraphQL concepts removed:
// - `baseRepository.nameWithOwner` → `targetRepositoryPath`
// - `repository.nameWithOwner` → `repositoryPath`
// - `state: "MERGED"` → isValid flag + `PullRequestStatus` enum
// - `changedFilesIfAvailable` → `changedFileCount` (null stays null)
// - `oid` → `sha`
// - `messageHeadline` → `summary`
// - `committedDate` → `authoredAt`
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Labels
// ---------------------------------------------------------------------------

/**
 * A label applied to a pull request or issue.
 */
export interface ActivityLabel {
  readonly name: string;
  /** Hex color, e.g. "e4e669". Note: GitHub omits the # prefix. */
  readonly color: string;
}

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------

/** The lifecycle status of a pull request. */
export type PullRequestStatus = "OPEN" | "CLOSED" | "MERGED";

/**
 * A pull request authored by the user.
 *
 * The Analytics Engine uses this to compute:
 * - Total PRs opened / merged / closed
 * - Merge rate
 * - Biggest PR by code volume
 * - External contribution detection
 */
export interface PullRequest {
  /** Stable unique identifier. */
  readonly id: string;
  /** PR title as written by the author. */
  readonly title: string;
  /** Current lifecycle status. */
  readonly status: PullRequestStatus;
  /** ISO 8601 timestamp when this PR was opened. */
  readonly openedAt: string;
  /**
   * ISO 8601 timestamp when this PR was merged.
   * Null when status is not MERGED.
   */
  readonly mergedAt: string | null;
  /**
   * ISO 8601 timestamp when this PR was closed.
   * Null when status is OPEN.
   */
  readonly closedAt: string | null;
  /** URL of this PR on GitHub. */
  readonly url: string;
  /** Number of lines added in this PR. */
  readonly linesAdded: number;
  /** Number of lines deleted in this PR. */
  readonly linesDeleted: number;
  /** Number of files changed in this PR. */
  readonly changedFileCount: number;
  /** Total number of comments on this PR. */
  readonly commentCount: number;
  /** Total number of review requests on this PR. */
  readonly reviewRequestCount: number;
  /**
   * Full repository path this PR targets, e.g. "vercel/next.js".
   * Null when the target repository has been deleted.
   */
  readonly targetRepositoryPath: string | null;
  /**
   * Whether the target repository is private.
   * False when `targetRepositoryPath` is null (deleted repo).
   */
  readonly targetRepositoryIsPrivate: boolean;
  /** Labels applied to this PR. */
  readonly labels: ReadonlyArray<ActivityLabel>;
}

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------

/** The lifecycle status of an issue. */
export type IssueStatus = "OPEN" | "CLOSED";

/**
 * An issue authored by the user.
 *
 * The Analytics Engine uses this to compute:
 * - Total issues opened / closed
 * - Issue close rate
 * - Most impactful issue (by reactions)
 */
export interface Issue {
  /** Stable unique identifier. */
  readonly id: string;
  /** Issue title as written by the author. */
  readonly title: string;
  /** Current lifecycle status. */
  readonly status: IssueStatus;
  /** ISO 8601 timestamp when this issue was opened. */
  readonly openedAt: string;
  /**
   * ISO 8601 timestamp when this issue was closed.
   * Null when status is OPEN.
   */
  readonly closedAt: string | null;
  /** URL of this issue on GitHub. */
  readonly url: string;
  /** Total number of comments on this issue. */
  readonly commentCount: number;
  /** Total number of emoji reactions on this issue. */
  readonly reactionCount: number;
  /** Labels applied to this issue. */
  readonly labels: ReadonlyArray<ActivityLabel>;
  /**
   * Full repository path this issue belongs to, e.g. "torvalds/linux".
   */
  readonly repositoryPath: string;
  /** Whether the repository is private. */
  readonly repositoryIsPrivate: boolean;
}

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------

/**
 * A single commit authored by the user.
 *
 * The Analytics Engine uses this to compute:
 * - Time-of-day coding pattern
 * - Day-of-week coding pattern
 * - Commit size distribution
 * - Biggest commit
 */
export interface Commit {
  /** Full SHA-1 hash, e.g. "a1b2c3d4...". */
  readonly sha: string;
  /** First line of the commit message (summary). */
  readonly summary: string;
  /** Full commit message body. */
  readonly fullMessage: string;
  /** ISO 8601 timestamp when this commit was authored. */
  readonly authoredAt: string;
  /** Number of lines added. */
  readonly linesAdded: number;
  /** Number of lines deleted. */
  readonly linesDeleted: number;
  /**
   * Number of files changed.
   * Null for very large commits where GitHub does not compute this value.
   */
  readonly changedFileCount: number | null;
}
