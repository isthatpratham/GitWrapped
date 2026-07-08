// ---------------------------------------------------------------------------
// Domain Model: Organization
// ---------------------------------------------------------------------------
// Represents a GitHub organisation the user is a public member of.
//
// GraphQL concept removed:
// - `membersWithRole.totalCount` → `memberCount`
// - `repositories.totalCount` → `repositoryCount`
// - `login` → `handle` (consistent with UserProfile.handle)
// ---------------------------------------------------------------------------

/**
 * An organisation the user is a public member of.
 *
 * Used by the Story Engine for the "Organizations" slide and by the
 * Analytics Engine to compute community involvement signals.
 */
export interface Organization {
  /** The organisation's GitHub handle (slug), e.g. "vercel". */
  readonly handle: string;
  /**
   * Display name of the organisation.
   * Null when the organisation has not set a name.
   */
  readonly displayName: string | null;
  /** Fully qualified URL to the organisation's avatar image. */
  readonly avatarUrl: string;
  /** Organisation description. Null when not set. */
  readonly description: string | null;
  /** URL of the organisation's GitHub profile. */
  readonly profileUrl: string;
  /** Organisation website URL. Null when not set. */
  readonly websiteUrl: string | null;
  /** Total number of members with any role in this organisation. */
  readonly memberCount: number;
  /** Total number of repositories owned by this organisation. */
  readonly repositoryCount: number;
}
