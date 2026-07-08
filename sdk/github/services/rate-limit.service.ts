import { executeQuery } from "../client";
import type { GitHubRateLimit } from "../types";
import { GET_RATE_LIMIT, type GetRateLimitData } from "../queries";

// ---------------------------------------------------------------------------
// Rate Limit Service
// ---------------------------------------------------------------------------
// Provides a lightweight way to check the current API rate limit status.
// Used for health checks and proactive throttling decisions.
// ---------------------------------------------------------------------------

/**
 * Fetches the current GitHub API rate limit status.
 * This query costs exactly 1 rate limit point.
 *
 * @returns The current `GitHubRateLimit` state.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL failure.
 */
export async function fetchRateLimit(): Promise<GitHubRateLimit> {
  const data = await executeQuery<GetRateLimitData>({
    query: GET_RATE_LIMIT,
    operationName: "GetRateLimit",
  });

  return {
    limit: data.rateLimit.limit,
    remaining: data.rateLimit.remaining,
    used: data.rateLimit.used,
    resetAt: data.rateLimit.resetAt,
    cost: data.rateLimit.cost,
  };
}

/**
 * Returns true if the current rate limit state has enough remaining requests
 * to safely initiate a full annual data fetch.
 *
 * A full fetch typically consumes 3–5 requests (profile, contributions,
 * repositories, pull requests). We use a conservative threshold of 10
 * to ensure headroom for paginated repositories or PRs.
 */
export async function hasSufficientRateLimit(): Promise<boolean> {
  const rateLimit = await fetchRateLimit();
  return rateLimit.remaining >= 10;
}
