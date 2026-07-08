// ---------------------------------------------------------------------------
// GraphQL Query: Language Usage
// ---------------------------------------------------------------------------
// Aggregates language data across all of a user's public repositories.
//
// Design decisions:
// - This is a dedicated query because language analytics is a first-class
//   story slide ("Your Languages This Year") that warrants its own fetch
//   lifecycle and cache entry.
// - Unlike `GET_USER_REPOSITORIES` which fetches languages per-repo for
//   all repos in a paginated loop, this query is optimised to fetch
//   language metadata more efficiently for the pure analytics use case.
// - We still paginate over repositories because languages can only be
//   retrieved as a sub-field of `Repository`, not as a top-level aggregate.
//   The Analytics Engine sums bytes-per-language across all repos in memory.
// - `first: 20` for languages per repo covers all realistic cases.
//   Repositories with more than 20 distinct languages are exceedingly rare.
//
// Why a separate query from GET_USER_REPOSITORIES?
// - Language analytics may need to be re-fetched independently if the user
//   adds new repositories during a session.
// - Separating the query makes it trivial to cache language data with a
//   different stale-time than repository metadata.
// - The analytics engine can request ONLY language data without the overhead
//   of watchers, issues, topics, etc.
//
// GitHub GraphQL limitation:
// - There is no top-level `languageStats` on the User type.
//   Language bytes must be summed across individual repository queries.
// - Language detection is based on byte count, not file count or LOC.
// ---------------------------------------------------------------------------

/**
 * Fetches language byte data for all public repositories owned by a user.
 * Designed for the Analytics Engine to compute portfolio-level language stats.
 *
 * Analytics enabled:
 * - Most used language by total bytes
 * - Language percentage breakdown across the portfolio
 * - Number of repositories using each language
 * - Language evolution (when combined with `createdAt` per repo)
 * - "Polyglot score" — number of distinct languages used
 */
export const GET_USER_LANGUAGE_STATS = /* GraphQL */ `
  query GetUserLanguageStats($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      repositories(
        first: $first
        after: $after
        privacy: PUBLIC
        ownerAffiliations: OWNER
        isFork: false
        orderBy: { field: PUSHED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          name
          nameWithOwner
          createdAt
          pushedAt
          isArchived
          primaryLanguage {
            name
            color
          }
          languages(first: 20, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_LANGUAGE_STATS}. */
export interface GetUserLanguageStatsVariables {
  readonly login: string;
  /** Number of repositories per page. Maximum: 100. */
  readonly first: number;
  /** Pagination cursor from `pageInfo.endCursor`. Omit for the first page. */
  readonly after?: string;
}

/** Raw shape of a single repository node in {@link GetUserLanguageStatsData}. */
export interface LanguageStatsRepositoryNode {
  readonly name: string;
  readonly nameWithOwner: string;
  readonly createdAt: string;
  readonly pushedAt: string | null;
  readonly isArchived: boolean;
  readonly primaryLanguage: {
    readonly name: string;
    readonly color: string | null;
  } | null;
  readonly languages: {
    /** Total bytes across all languages in this repository. */
    readonly totalSize: number;
    readonly edges: ReadonlyArray<{
      /** Bytes of code written in this language within this repository. */
      readonly size: number;
      readonly node: {
        readonly name: string;
        readonly color: string | null;
      };
    }>;
  };
}

/**
 * Raw response shape for {@link GET_USER_LANGUAGE_STATS}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserLanguageStatsData {
  readonly user: {
    readonly repositories: {
      readonly pageInfo: {
        readonly hasNextPage: boolean;
        readonly endCursor: string | null;
      };
      readonly nodes: ReadonlyArray<LanguageStatsRepositoryNode>;
    };
  } | null;
}
