// ---------------------------------------------------------------------------
// GraphQL Query: User Repositories
// ---------------------------------------------------------------------------
// Fetches the user's complete owned, non-fork, public repository list
// with per-repository language data and metadata.
//
// Design decisions:
// - `isFork: false` excludes forked repositories because the analytics
//   engine measures the user's original work, not contributions via forks.
// - `languages(first: 10)` fetches the top 10 languages per repo by byte
//   size. 10 covers all realistic cases; it is also GitHub's recommended
//   limit for this field.
// - `orderBy: { field: PUSHED_AT, direction: DESC }` means page 1 always
//   contains the most recently active repositories — the natural candidates
//   for "Favorite Repository" and "Most Active Repo" analytics.
// - `watchers`, `openIssues`, and `openPullRequests` are connection counts
//   embedded as nested objects. They are fetched here to avoid separate
//   per-repository queries at analysis time.
// - `repositoryTopics` is included to enable "Top Technologies" story slides.
//
// Pagination:
// - The service layer paginates using `after` cursor until `hasNextPage`
//   is false, guaranteeing a complete repository list regardless of count.
//
// GitHub GraphQL limitation:
// - Repositories cannot be filtered by date range in the query.
//   The Analytics Engine filters by `createdAt` and `pushedAt` in memory.
// - `isFork` filter cannot be combined with `ownerAffiliations: COLLABORATOR`,
//   so we only fetch owned repos and handle collaborations separately.
// ---------------------------------------------------------------------------

/**
 * Fetches all owned, non-fork, public repositories for a GitHub user.
 * Supports cursor-based pagination.
 *
 * Analytics enabled:
 * - Star ranking (stargazerCount)
 * - Most forked repository
 * - Total open-source impact (Σ stars across all repos)
 * - Language breakdown across the portfolio
 * - Repository creation timeline
 * - Most recently active repository
 * - Topic/technology frequency analysis
 */
export const GET_USER_REPOSITORIES = /* GraphQL */ `
  query GetUserRepositories($login: String!, $first: Int!, $after: String) {
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
          id
          name
          nameWithOwner
          description
          createdAt
          pushedAt
          updatedAt
          stargazerCount
          forkCount
          isPrivate
          isFork
          isArchived
          diskUsage
          url
          homepageUrl
          defaultBranchRef {
            name
          }
          visibility
          primaryLanguage {
            name
            color
          }
          languages(first: 10, orderBy: { field: SIZE, direction: DESC }) {
            totalSize
            edges {
              size
              node {
                name
                color
              }
            }
          }
          watchers {
            totalCount
          }
          openIssues: issues(states: OPEN) {
            totalCount
          }
          openPullRequests: pullRequests(states: OPEN) {
            totalCount
          }
          repositoryTopics(first: 10) {
            nodes {
              topic {
                name
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

/** Variables accepted by {@link GET_USER_REPOSITORIES}. */
export interface GetUserRepositoriesVariables {
  readonly login: string;
  /**
   * Number of repositories per page.
   * Maximum allowed by GitHub's API: 100.
   */
  readonly first: number;
  /**
   * Pagination cursor from `pageInfo.endCursor` of the previous response.
   * Omit for the first page.
   */
  readonly after?: string;
}

/** Raw shape of a single repository node in {@link GetUserRepositoriesData}. */
export interface RepositoryNode {
  readonly id: string;
  readonly name: string;
  readonly nameWithOwner: string;
  readonly description: string | null;
  readonly createdAt: string;
  readonly pushedAt: string | null;
  readonly updatedAt: string;
  readonly stargazerCount: number;
  readonly forkCount: number;
  readonly isPrivate: boolean;
  readonly isFork: boolean;
  readonly isArchived: boolean;
  /** Total disk usage in kilobytes. */
  readonly diskUsage: number | null;
  readonly url: string;
  readonly homepageUrl: string | null;
  readonly defaultBranchRef: { readonly name: string } | null;
  /** Visibility: PUBLIC, PRIVATE, or INTERNAL. */
  readonly visibility: string;
  readonly primaryLanguage: {
    readonly name: string;
    readonly color: string | null;
  } | null;
  readonly languages: {
    /** Total bytes across all languages in this repository. */
    readonly totalSize: number;
    readonly edges: ReadonlyArray<{
      /** Bytes of code written in this language. */
      readonly size: number;
      readonly node: {
        readonly name: string;
        readonly color: string | null;
      };
    }>;
  };
  readonly watchers: { readonly totalCount: number };
  readonly openIssues: { readonly totalCount: number };
  readonly openPullRequests: { readonly totalCount: number };
  readonly repositoryTopics: {
    readonly nodes: ReadonlyArray<{
      readonly topic: { readonly name: string };
    }>;
  };
}

/**
 * Raw response shape for {@link GET_USER_REPOSITORIES}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserRepositoriesData {
  readonly user: {
    readonly repositories: {
      readonly pageInfo: {
        readonly hasNextPage: boolean;
        readonly endCursor: string | null;
      };
      readonly nodes: ReadonlyArray<RepositoryNode>;
    };
  } | null;
}
