// ---------------------------------------------------------------------------
// GraphQL Query: User Pull Requests
// ---------------------------------------------------------------------------
// Fetches all pull requests authored by a user, paginated newest-first.
//
// Design decisions:
// - No server-side date filter exists in GitHub's GraphQL API for PRs.
//   We order by CREATED_AT DESC and let the service layer apply the year
//   window with an early-exit optimisation (stop when we hit the prior year).
// - `additions` and `deletions` give a lines-changed metric that enables
//   the "Lines Written" and "Biggest PR" analytics without a separate query.
// - `reviewRequests.totalCount` exposes how collaborative a PR was.
// - `comments.totalCount` gives engagement signal per PR.
// - `baseRepository` is nullable because the target repo could have been
//   deleted after the PR was opened.
// - We include `merged` state and `mergedAt` so analytics can distinguish
//   merged vs. closed-without-merge accurately.
//
// GitHub GraphQL limitation:
// - Cannot filter `pullRequests` by date range directly.
// - Cannot filter by external repos (PRs the user opened on others' repos).
//   All PRs in this query are authored by the user regardless of ownership.
// ---------------------------------------------------------------------------

/**
 * Fetches all pull requests authored by a GitHub user, newest-first.
 * The service layer applies year-scoped windowing on the result set.
 *
 * Analytics enabled:
 * - Total PRs opened / merged / closed in the year
 * - Merge rate (merged / total)
 * - Largest PR by additions+deletions
 * - Most reviewed PR
 * - External contribution detection (PRs to non-owned repos)
 * - PR velocity (PRs per month)
 */
export const GET_USER_PULL_REQUESTS = /* GraphQL */ `
  query GetUserPullRequests($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      pullRequests(
        first: $first
        after: $after
        orderBy: { field: CREATED_AT, direction: DESC }
      ) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          id
          title
          state
          createdAt
          mergedAt
          closedAt
          url
          additions
          deletions
          changedFiles
          comments {
            totalCount
          }
          reviewRequests {
            totalCount
          }
          baseRepository {
            nameWithOwner
            isPrivate
          }
          labels(first: 10) {
            nodes {
              name
              color
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

/** Variables accepted by {@link GET_USER_PULL_REQUESTS}. */
export interface GetUserPullRequestsVariables {
  readonly login: string;
  /** Number of pull requests per page. Maximum: 100. */
  readonly first: number;
  /** Pagination cursor from `pageInfo.endCursor`. Omit for the first page. */
  readonly after?: string;
}

/** Raw shape of a single pull request node in {@link GetUserPullRequestsData}. */
export interface PullRequestNode {
  readonly id: string;
  readonly title: string;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly createdAt: string;
  readonly mergedAt: string | null;
  readonly closedAt: string | null;
  readonly url: string;
  /** Number of line additions. */
  readonly additions: number;
  /** Number of line deletions. */
  readonly deletions: number;
  /** Number of files changed. */
  readonly changedFiles: number;
  readonly comments: { readonly totalCount: number };
  readonly reviewRequests: { readonly totalCount: number };
  /**
   * The repository this PR targets.
   * Null if the target repository has been deleted.
   */
  readonly baseRepository: {
    readonly nameWithOwner: string;
    readonly isPrivate: boolean;
  } | null;
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly name: string;
      readonly color: string;
    }>;
  };
}

/**
 * Raw response shape for {@link GET_USER_PULL_REQUESTS}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserPullRequestsData {
  readonly user: {
    readonly pullRequests: {
      readonly pageInfo: {
        readonly hasNextPage: boolean;
        readonly endCursor: string | null;
      };
      readonly nodes: ReadonlyArray<PullRequestNode>;
    };
  } | null;
}
