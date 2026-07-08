// ---------------------------------------------------------------------------
// GraphQL Query: User Achievement Signals
// ---------------------------------------------------------------------------
// Fetches raw data signals used by the Analytics Engine to compute
// achievement thresholds. This query does NOT compute achievements.
// Achievement calculation is the exclusive responsibility of the Analytics Engine.
//
// Design decisions:
// - We consolidate all achievement-signal fields into a single query to
//   minimise total API requests. GitHub charges per query against rate limits,
//   so batching is preferred when fields are logically related.
// - Sponsorship data (`sponsoring`, `sponsors`) enables the "Open Source
//   Supporter" and "Community Hero" achievement categories.
// - `gistCount` feeds the "Note Taker" achievement.
// - `starredRepositories.totalCount` enables the "Explorer" achievement.
// - `packages.totalCount` enables the "Publisher" achievement for users
//   who publish to GitHub Packages.
//
// What this query does NOT fetch (and why):
// - Individual achievement thresholds: those are defined in the Analytics Engine.
// - Badge rendering data: that belongs in the Story Engine / UI layer.
// - Private contribution counts: only surfaced in contributionsCollection.
//
// GitHub GraphQL limitation:
// - GitHub's own achievement system (profile badges like "Starstruck",
//   "Pair Extraordinaire") is not exposed via the GraphQL API as a queryable
//   field. The `achievements` node does not exist on the User type.
//   Our "achievements" are computed entirely from raw stats by the Analytics Engine.
// ---------------------------------------------------------------------------

/**
 * Fetches raw data signals used to compute user achievements.
 * No achievement logic is performed here — raw counts are returned only.
 *
 * Analytics enabled (by the Analytics Engine, not this query):
 * - "Star Collector" — total stars across owned repos
 * - "Open Source Supporter" — sponsoring count
 * - "Community Hero" — sponsors count
 * - "Prolific Author" — repository count
 * - "Note Taker" — gist count
 * - "Explorer" — starred repository count
 * - "Publisher" — packages count
 * - "Social Butterfly" — followers + following combined
 */
export const GET_USER_ACHIEVEMENT_SIGNALS = /* GraphQL */ `
  query GetUserAchievementSignals($login: String!) {
    user(login: $login) {
      login

      followers {
        totalCount
      }
      following {
        totalCount
      }

      repositories(
        privacy: PUBLIC
        ownerAffiliations: OWNER
        isFork: false
      ) {
        totalCount
      }

      starredRepositories {
        totalCount
      }

      gists(privacy: PUBLIC) {
        totalCount
      }

      packages {
        totalCount
      }

      sponsoring {
        totalCount
      }

      sponsors {
        totalCount
      }

      pullRequests(states: MERGED) {
        totalCount
      }

      issues(filterBy: { createdBy: $login }) {
        totalCount
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_ACHIEVEMENT_SIGNALS}. */
export interface GetUserAchievementSignalsVariables {
  readonly login: string;
}

/**
 * Raw response shape for {@link GET_USER_ACHIEVEMENT_SIGNALS}.
 * `user` is null when no account exists for the given login.
 *
 * All fields are raw counts — the Analytics Engine applies thresholds
 * to determine which achievements are unlocked.
 */
export interface GetUserAchievementSignalsData {
  readonly user: {
    readonly login: string;
    readonly followers: { readonly totalCount: number };
    readonly following: { readonly totalCount: number };
    /** Count of owned, non-fork, public repositories. */
    readonly repositories: { readonly totalCount: number };
    /** Total repositories this user has starred. */
    readonly starredRepositories: { readonly totalCount: number };
    /** Total public gists authored by this user. */
    readonly gists: { readonly totalCount: number };
    /** Total packages published to GitHub Packages by this user. */
    readonly packages: { readonly totalCount: number };
    /** Total accounts this user is sponsoring. */
    readonly sponsoring: { readonly totalCount: number };
    /** Total accounts sponsoring this user. */
    readonly sponsors: { readonly totalCount: number };
    /** Total merged pull requests authored by this user (all time). */
    readonly pullRequests: { readonly totalCount: number };
    /** Total issues opened by this user (all time). */
    readonly issues: { readonly totalCount: number };
  } | null;
}
