// ---------------------------------------------------------------------------
// Domain Model: User
// ---------------------------------------------------------------------------
// Represents a GitWrapped user — a person whose annual coding recap
// is being generated. This is intentionally independent of GitHub's
// GraphQL field naming (e.g., `login` becomes `handle`, `createdAt`
// becomes `accountCreatedAt`).
//
// The domain model uses GitWrapped's business language.
// The Analytics Engine and Story Engine depend exclusively on this shape.
// If GitHub renames a field, only the mapper changes — not analytics, not UI.
// ---------------------------------------------------------------------------

/**
 * A user profile as understood by GitWrapped's domain.
 * All fields are normalised and validated by the mapper before reaching
 * the Analytics Engine.
 *
 * @example
 * const user: UserProfile = {
 *   handle: "torvalds",
 *   displayName: "Linus Torvalds",
 *   avatarUrl: "https://avatars.githubusercontent.com/u/1024025",
 *   bio: "Just a guy",
 *   company: "Linux Foundation",
 *   location: "Portland, OR",
 *   websiteUrl: "https://kernel.org",
 *   twitterHandle: null,
 *   accountCreatedAt: "1996-06-01T00:00:00Z",
 *   publicRepositoryCount: 6,
 *   followerCount: 220000,
 *   followingCount: 0,
 * };
 */
export interface UserProfile {
  /** The user's GitHub handle. Unique. Case-insensitive on GitHub's side. */
  readonly handle: string;
  /**
   * The user's chosen display name.
   * Null when the user has not set a name.
   */
  readonly displayName: string | null;
  /** Fully qualified URL to the user's avatar image. */
  readonly avatarUrl: string;
  /** User's bio text. Null when not set. */
  readonly bio: string | null;
  /** Company or organisation affiliation. Null when not set. */
  readonly company: string | null;
  /** User's stated location. Null when not set. */
  readonly location: string | null;
  /** User's personal website URL. Null when not set. */
  readonly websiteUrl: string | null;
  /** Twitter/X username without the @ prefix. Null when not set. */
  readonly twitterHandle: string | null;
  /** ISO 8601 timestamp when the GitHub account was created. */
  readonly accountCreatedAt: string;
  /** Number of public repositories owned by this user (excluding forks). */
  readonly publicRepositoryCount: number;
  /** Total number of accounts following this user. */
  readonly followerCount: number;
  /** Total number of accounts this user is following. */
  readonly followingCount: number;
}
