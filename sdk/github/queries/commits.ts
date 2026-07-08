// ---------------------------------------------------------------------------
// GraphQL Query: Repository Commits (Default Branch)
// ---------------------------------------------------------------------------
// Fetches recent commit history from a repository's default branch.
//
// Design decisions:
// - Commits are scoped per-repository because GitHub's GraphQL API does not
//   expose a top-level "all commits by user" query. The `contributionsCollection`
//   gives aggregate counts; this query gives the actual commit data.
// - We filter by `author.id` to restrict to commits by the target user,
//   preventing commits by other contributors from polluting the analytics.
// - `committedDate` provides the timestamp needed for time-of-day and
//   day-of-week analysis (e.g., "You code most on Thursdays at 11pm").
// - `messageHeadline` is the first line of the commit message — useful for
//   the "Best Commit Message" easter egg and for displaying commit samples.
// - `additions` and `deletions` per-commit enable the "Biggest Commit"
//   and average commit size analytics.
// - We cap at 100 commits per repository per query call. The service layer
//   paginates to get the full history within the target year window.
//
// Usage pattern:
// The service will call this query once per repository in the
// `commitContributionsByRepository` result from GET_USER_CONTRIBUTIONS.
// This avoids querying every repository — only the top ones by commit count.
//
// GitHub GraphQL limitation:
// - `history(author: { id: $authorId })` requires the user's GraphQL node ID,
//   not their login string. The service must resolve the ID from the user
//   profile query first.
// - Commit data older than 1 year may be incomplete on large repositories
//   due to GitHub's internal data retention policies.
// - The REST API Commits endpoint provides richer data (GPG signing, etc.)
//   but requires more requests. GraphQL is preferred for V1.
// ---------------------------------------------------------------------------

/**
 * Fetches commit history from a specific repository filtered by author.
 * Used by the service layer to enrich data from top-contributed repositories.
 *
 * Analytics enabled:
 * - Time-of-day coding pattern ("You commit most at 11pm")
 * - Day-of-week coding pattern ("You code most on Thursdays")
 * - Average commit size (additions + deletions)
 * - Biggest single commit
 * - Commit message quality analysis (message length distribution)
 * - Commit velocity within a repository
 */
export const GET_REPOSITORY_COMMITS = /* GraphQL */ `
  query GetRepositoryCommits(
    $owner: String!
    $name: String!
    $authorId: ID!
    $first: Int!
    $after: String
    $since: GitTimestamp
    $until: GitTimestamp
  ) {
    repository(owner: $owner, name: $name) {
      defaultBranchRef {
        target {
          ... on Commit {
            history(
              first: $first
              after: $after
              author: { id: $authorId }
              since: $since
              until: $until
            ) {
              pageInfo {
                hasNextPage
                endCursor
              }
              nodes {
                oid
                messageHeadline
                message
                committedDate
                additions
                deletions
                changedFilesIfAvailable
                author {
                  name
                  email
                  date
                }
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

/** Variables accepted by {@link GET_REPOSITORY_COMMITS}. */
export interface GetRepositoryCommitsVariables {
  /** Repository owner login (user or org handle). */
  readonly owner: string;
  /** Repository name (not nameWithOwner — just the name portion). */
  readonly name: string;
  /**
   * GraphQL node ID of the commit author.
   * Obtain from the user profile query's `databaseId` converted to a
   * global node ID, or from `viewer.id` for the authenticated user.
   */
  readonly authorId: string;
  /** Number of commits per page. Maximum: 100. */
  readonly first: number;
  /** Pagination cursor from `pageInfo.endCursor`. Omit for the first page. */
  readonly after?: string;
  /**
   * ISO 8601 timestamp — include commits after this time.
   * @example "2024-01-01T00:00:00Z"
   */
  readonly since?: string;
  /**
   * ISO 8601 timestamp — include commits before this time.
   * @example "2024-12-31T23:59:59Z"
   */
  readonly until?: string;
}

/** Raw shape of a single commit node in {@link GetRepositoryCommitsData}. */
export interface CommitNode {
  /** Full SHA-1 hash of the commit. */
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
   * May be null for very large commits where GitHub does not compute this.
   */
  readonly changedFilesIfAvailable: number | null;
  readonly author: {
    readonly name: string | null;
    readonly email: string | null;
    readonly date: string | null;
  };
}

/**
 * Raw response shape for {@link GET_REPOSITORY_COMMITS}.
 * `repository` is null when the repository does not exist or is inaccessible.
 * `defaultBranchRef` is null for empty repositories with no commits.
 */
export interface GetRepositoryCommitsData {
  readonly repository: {
    readonly defaultBranchRef: {
      readonly target: {
        readonly history: {
          readonly pageInfo: {
            readonly hasNextPage: boolean;
            readonly endCursor: string | null;
          };
          readonly nodes: ReadonlyArray<CommitNode>;
        };
      };
    } | null;
  } | null;
}
