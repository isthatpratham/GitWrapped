// ---------------------------------------------------------------------------
// GraphQL Query: User Issues
// ---------------------------------------------------------------------------
// Fetches all issues authored by a GitHub user, paginated newest-first.
//
// Design decisions:
// - Separate from pull requests: issues and PRs have different semantic
//   meaning for the story engine. "X issues opened" and "Y PRs merged"
//   are distinct story beats.
// - `comments.totalCount` captures community engagement on the issue.
// - `labels` enable the "Most Used Labels" analytics insight.
// - `reactions.totalCount` gives a signal for "Most Impactful Issue".
// - We exclude `CLOSED` state in the query variable default but expose
//   both OPEN and CLOSED via the `states` variable so the service layer
//   can request either or both.
//
// GitHub GraphQL limitation:
// - Cannot filter issues by date range server-side.
//   The service layer applies year-scoped windowing via early-exit.
// - Issues on private repositories are excluded unless the PAT has
//   `repo` scope (not just `public_repo`). V1 only targets public data.
// ---------------------------------------------------------------------------

/**
 * Fetches all issues authored by a GitHub user, newest-first.
 * The service layer applies year-scoped windowing on the result set.
 *
 * Analytics enabled:
 * - Total issues opened in the year
 * - Issue close rate (closed / total)
 * - Most engaged-with issue (by reactions)
 * - Label usage patterns
 * - Issue velocity (issues per month)
 * - Community impact (external issues on others' repos)
 */
export const GET_USER_ISSUES = /* GraphQL */ `
  query GetUserIssues($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      issues(
        first: $first
        after: $after
        orderBy: { field: CREATED_AT, direction: DESC }
        filterBy: { createdBy: $login }
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
          closedAt
          url
          comments {
            totalCount
          }
          reactions {
            totalCount
          }
          labels(first: 10) {
            nodes {
              name
              color
            }
          }
          repository {
            nameWithOwner
            isPrivate
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_ISSUES}. */
export interface GetUserIssuesVariables {
  readonly login: string;
  /** Number of issues per page. Maximum: 100. */
  readonly first: number;
  /** Pagination cursor from `pageInfo.endCursor`. Omit for the first page. */
  readonly after?: string;
}

/** Raw shape of a single issue node in {@link GetUserIssuesData}. */
export interface IssueNode {
  readonly id: string;
  readonly title: string;
  readonly state: "OPEN" | "CLOSED";
  readonly createdAt: string;
  readonly closedAt: string | null;
  readonly url: string;
  readonly comments: { readonly totalCount: number };
  readonly reactions: { readonly totalCount: number };
  readonly labels: {
    readonly nodes: ReadonlyArray<{
      readonly name: string;
      readonly color: string;
    }>;
  };
  readonly repository: {
    readonly nameWithOwner: string;
    readonly isPrivate: boolean;
  };
}

/**
 * Raw response shape for {@link GET_USER_ISSUES}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserIssuesData {
  readonly user: {
    readonly issues: {
      readonly pageInfo: {
        readonly hasNextPage: boolean;
        readonly endCursor: string | null;
      };
      readonly nodes: ReadonlyArray<IssueNode>;
    };
  } | null;
}
