// ---------------------------------------------------------------------------
// Domain Model: Repository
// ---------------------------------------------------------------------------
// Represents a code repository as GitWrapped understands it.
// No GraphQL field names, no connection/edge/node terminology.
// The Analytics Engine uses this shape to compute stars, language breakdowns,
// topic frequency, and repository timeline analytics.
// ---------------------------------------------------------------------------

/**
 * The primary coding language for a repository.
 */
export interface RepositoryLanguage {
  /** Language name, e.g. "TypeScript", "Python", "Rust". */
  readonly name: string;
  /**
   * Hex color code assigned to this language by GitHub, e.g. "#3178c6".
   * Null for languages GitHub has not assigned a color.
   */
  readonly color: string | null;
}

/**
 * One language entry in a repository's language breakdown.
 * Represents how many bytes of code in this repository are written in
 * a specific language.
 */
export interface RepositoryLanguageUsage {
  /** Language metadata. */
  readonly language: RepositoryLanguage;
  /** Bytes of code written in this language within the repository. */
  readonly bytes: number;
}

/**
 * A tag/topic applied to a repository (e.g., "machine-learning", "cli-tool").
 */
export interface RepositoryTopic {
  readonly name: string;
}

/** Visibility of a repository. */
export type RepositoryVisibility = "PUBLIC" | "PRIVATE" | "INTERNAL";

/**
 * A repository as understood by GitWrapped's domain.
 *
 * GraphQL concepts removed:
 * - `nameWithOwner` → split into `ownerName` + `name`
 * - `stargazerCount` → `starCount`
 * - `languages.edges[].size` → `languageUsage[].bytes`
 * - `isFork`, `isArchived`, `isPrivate` → `isFork`, `isArchived`, `visibility`
 * - `diskUsage` → `diskUsageKilobytes`
 * - `watchers.totalCount` → `watcherCount`
 */
export interface Repository {
  /** Stable unique identifier. */
  readonly id: string;
  /** Repository slug name, e.g. "next.js". */
  readonly name: string;
  /** Owner's handle (user or org login), e.g. "vercel". */
  readonly ownerName: string;
  /** Optional description set by the owner. */
  readonly description: string | null;
  /** ISO 8601 timestamp when the repository was created. */
  readonly createdAt: string;
  /**
   * ISO 8601 timestamp of the most recent git push.
   * Null for repositories that have never received a push.
   */
  readonly lastPushedAt: string | null;
  /** ISO 8601 timestamp of the most recent metadata update. */
  readonly lastUpdatedAt: string;
  /** Total number of GitHub stars. */
  readonly starCount: number;
  /** Total number of forks. */
  readonly forkCount: number;
  /** Total number of watchers. */
  readonly watcherCount: number;
  /** Total open issues. */
  readonly openIssueCount: number;
  /** Total open pull requests. */
  readonly openPullRequestCount: number;
  /** Whether this repository was forked from another. */
  readonly isFork: boolean;
  /** Whether this repository has been archived (read-only). */
  readonly isArchived: boolean;
  /** Repository visibility level. */
  readonly visibility: RepositoryVisibility;
  /** The default branch name, e.g. "main". Null for empty repositories. */
  readonly defaultBranch: string | null;
  /** Optional homepage URL set by the owner. */
  readonly homepageUrl: string | null;
  /** URL of the repository on GitHub. */
  readonly url: string;
  /**
   * Disk space consumed by the repository.
   * Null when GitHub has not computed usage.
   */
  readonly diskUsageKilobytes: number | null;
  /**
   * The primary language GitHub detected for this repository.
   * Null for repositories with no detectable code.
   */
  readonly primaryLanguage: RepositoryLanguage | null;
  /**
   * Language breakdown by byte count, ordered from largest to smallest.
   * Empty array for repositories with no detectable code.
   */
  readonly languageUsage: ReadonlyArray<RepositoryLanguageUsage>;
  /**
   * Total bytes across all languages in the repository.
   * Used to compute language percentages per-repo.
   */
  readonly totalLanguageBytes: number;
  /**
   * Topics/tags applied to this repository.
   * Empty array when no topics are set.
   */
  readonly topics: ReadonlyArray<RepositoryTopic>;
}
