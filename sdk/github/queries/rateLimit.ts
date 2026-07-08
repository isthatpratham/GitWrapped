// ---------------------------------------------------------------------------
// GraphQL Query: API Rate Limit
// ---------------------------------------------------------------------------
// A minimal diagnostic query that checks the current state of the
// GitHub GraphQL API rate limit window.
//
// Design decisions:
// - This query is intentionally the smallest possible GraphQL operation.
//   It costs exactly 1 rate-limit point — the minimum for any query.
// - It should be called before initiating heavy data fetches to detect
//   exhaustion proactively, not reactively.
// - `nodeRateLimit` is an alias used by some GitHub Enterprise versions.
//   We use the standard `rateLimit` field which works on both github.com
//   and GitHub Enterprise Server 3.1+.
//
// GitHub GraphQL limitation:
// - The rate limit window is 5,000 points per hour for authenticated requests.
// - Each query costs between 1 and ~50 points depending on complexity.
//   A full GitWrapped fetch (profile + contributions + repos + PRs) costs ~5-15 points.
// - Secondary rate limits (abuse detection) are separate and not visible
//   via `rateLimit`. They produce HTTP 429 responses handled in `client.ts`.
// ---------------------------------------------------------------------------

/**
 * Checks the current GitHub API rate limit status.
 * Cost: exactly 1 rate-limit point.
 *
 * Usage:
 * - Call before a full annual data fetch to ensure at least 20 points remain.
 * - Call after a full fetch to log remaining capacity for monitoring.
 * - Embed in health check endpoints to expose API quota status.
 */
export const GET_RATE_LIMIT = /* GraphQL */ `
  query GetRateLimit {
    rateLimit {
      limit
      remaining
      used
      resetAt
      cost
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Raw response shape for {@link GET_RATE_LIMIT}.
 * This query always succeeds when the token is valid —
 * even if the rate limit is exhausted, GitHub returns the current state.
 */
export interface GetRateLimitData {
  readonly rateLimit: {
    /** Maximum requests allowed in the current 1-hour window. */
    readonly limit: number;
    /** Requests remaining before the window resets. */
    readonly remaining: number;
    /** Requests consumed in the current window. */
    readonly used: number;
    /** ISO 8601 timestamp when the window resets and `remaining` returns to `limit`. */
    readonly resetAt: string;
    /** Rate-limit cost of this specific query (always 1 for GetRateLimit). */
    readonly cost: number;
  };
}
