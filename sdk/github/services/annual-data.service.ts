import type { GitHubAnnualData, FetchAnnualDataOptions } from "../types";
import { fetchUserProfile, getRecapYear } from "./user.service";
import { fetchUserContributions } from "./contributions.service";
import { fetchUserRepositories } from "./repositories.service";
import { fetchUserPullRequests } from "./pull-requests.service";

// ---------------------------------------------------------------------------
// Annual Data Orchestrator
// ---------------------------------------------------------------------------
// This is the primary entry point for the Analytics Engine.
// It composes all individual service calls into a single, complete payload
// that satisfies the `GitHubAnnualData` contract.
//
// Architecture note:
// - Each service call is independent and can fail separately.
// - We use Promise.all for parallelism where safe (contributions and
//   repositories can be fetched simultaneously; they don't depend on each other).
// - The user profile is fetched first to validate the username before
//   initiating heavier parallel requests.
// ---------------------------------------------------------------------------

/**
 * Fetches the complete annual GitHub data for a user.
 *
 * This is the **primary public API** of the GitHub SDK.
 * Callers (API routes, analytics engine) should import and call this function.
 *
 * Request strategy:
 * 1. Fetch user profile (validates the username exists — fast-fails if not).
 * 2. In parallel: fetch contributions, repositories, and pull requests.
 *
 * @param options - The username and target year.
 * @returns A fully populated `GitHubAnnualData` object.
 *
 * @throws {GitHubUserNotFoundError} When the username does not exist.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL failure.
 */
export async function fetchAnnualData(
  options: FetchAnnualDataOptions,
): Promise<GitHubAnnualData> {
  const { username, year } = options;

  // Step 1: Validate the user exists before initiating parallel fetches.
  // This gives us a clean GitHubUserNotFoundError early rather than
  // a confusing partial failure from one of the parallel operations.
  const user = await fetchUserProfile(username);

  // Step 2: Fetch the remaining data sources in parallel.
  // These are independent: contributions don't depend on repository data,
  // and pull request data doesn't depend on contribution data.
  const [contributions, repositories, pullRequests] = await Promise.all([
    fetchUserContributions(username, year),
    fetchUserRepositories(username),
    fetchUserPullRequests(username, year),
  ]);

  return {
    user,
    contributions,
    repositories,
    pullRequests,
    // Issues are included in the type contract for future implementation.
    // V1 derives issue count from the contributionsCollection instead
    // to avoid an additional API request.
    issues: [],
    // Organizations and achievement signals are fetched by dedicated services
    // added in the query layer expansion. Stub values here pending service implementation.
    organizations: [],
    achievementSignals: {
      login: user.login,
      followers: user.followers,
      following: user.following,
      publicRepositoryCount: user.publicRepos,
      starredRepositoryCount: 0,
      publicGistCount: 0,
      packageCount: 0,
      sponsoringCount: 0,
      sponsorCount: 0,
      totalMergedPullRequests: 0,
      totalIssues: 0,
    },
    year,
    fetchedAt: new Date().toISOString(),
  };
}

/**
 * Fetches the current year's annual data for a user.
 * A convenience wrapper over `fetchAnnualData` using the configured recap year.
 *
 * @param username - The GitHub login handle.
 */
export async function fetchCurrentYearData(username: string): Promise<GitHubAnnualData> {
  return fetchAnnualData({ username, year: getRecapYear() });
}
