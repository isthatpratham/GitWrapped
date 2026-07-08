// ---------------------------------------------------------------------------
// GraphQL Query: Contribution Calendar (Annual)
// ---------------------------------------------------------------------------
// Fetches the complete contribution summary and calendar heatmap for a
// specific date window via `contributionsCollection(from:, to:)`.
//
// Design decisions:
// - `from` and `to` are required variables so any year can be queried,
//   enabling multi-year comparison in future roadmap items.
// - The `contributionCalendar` is fetched with full week/day granularity
//   because the Analytics Engine needs daily data for streak calculation.
// - `commitContributionsByRepository` gives per-repo commit breakdowns,
//   enabling the "Most Committed Repository" analytics insight. We cap
//   at 10 repos per request — this covers the vast majority of users.
// - `popularBeforeRestrictedContributions` surfaces the user's single
//   biggest contribution day, which is directly usable for story generation.
//
// GitHub GraphQL limitations:
// - `contributionsCollection` cannot return data spanning multiple years
//   in a single query; the window must fit within a 365-day period.
//   The service layer calls this once per year for multi-year recaps.
// - Commit timestamps within a day are not available via GraphQL.
//   The REST Commits API is needed for time-of-day analytics (future).
// ---------------------------------------------------------------------------

/**
 * Fetches the full annual contribution collection for a GitHub user.
 * Supports querying any calendar year via date variables.
 *
 * Analytics enabled:
 * - Daily contribution heatmap (visual calendar)
 * - Current / longest contribution streak
 * - Total commits, PRs, issues, reviews opened in the year
 * - Best contribution day (count + date)
 * - Most committed repository
 * - Coding consistency score
 * - Restricted contributions detection (private activity toggle)
 */
export const GET_USER_CONTRIBUTIONS = /* GraphQL */ `
  query GetUserContributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        totalCommitContributions
        totalPullRequestContributions
        totalIssueContributions
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedCommits
        restrictedContributionsCount

        contributionCalendar {
          totalContributions
          weeks {
            firstDay
            contributionDays {
              date
              contributionCount
              contributionLevel
              color
            }
          }
        }

        commitContributionsByRepository(maxRepositories: 10) {
          repository {
            nameWithOwner
            primaryLanguage {
              name
              color
            }
          }
          contributions {
            totalCount
          }
        }

      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_CONTRIBUTIONS}. */
export interface GetUserContributionsVariables {
  readonly login: string;
  /**
   * ISO 8601 datetime marking the start of the recap window.
   * @example "2024-01-01T00:00:00Z"
   */
  readonly from: string;
  /**
   * ISO 8601 datetime marking the end of the recap window.
   * @example "2024-12-31T23:59:59Z"
   */
  readonly to: string;
}

/** A single contribution level bucket. */
export type ContributionLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

/**
 * Raw response shape for {@link GET_USER_CONTRIBUTIONS}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserContributionsData {
  readonly user: {
    readonly contributionsCollection: {
      readonly totalCommitContributions: number;
      readonly totalPullRequestContributions: number;
      readonly totalIssueContributions: number;
      readonly totalPullRequestReviewContributions: number;
      readonly totalRepositoriesWithContributedCommits: number;
      readonly restrictedContributionsCount: number;
      readonly contributionCalendar: {
        readonly totalContributions: number;
        readonly weeks: ReadonlyArray<{
          readonly firstDay: string;
          readonly contributionDays: ReadonlyArray<{
            readonly date: string;
            readonly contributionCount: number;
            readonly contributionLevel: ContributionLevel;
            readonly color: string;
          }>;
        }>;
      };
      /** Per-repository commit breakdown for up to 10 repositories. */
      readonly commitContributionsByRepository: ReadonlyArray<{
        readonly repository: {
          readonly nameWithOwner: string;
          readonly primaryLanguage: {
            readonly name: string;
            readonly color: string | null;
          } | null;
        };
        readonly contributions: {
          readonly totalCount: number;
        };
      }>;
    };
  } | null;
}
