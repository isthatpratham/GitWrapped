import "server-only";

import { githubConfig } from "./config";
import {
  GitHubAuthenticationError,
  GitHubForbiddenError,
  GitHubGraphQLError,
  GitHubHttpError,
  GitHubNetworkError,
  GitHubRateLimitError,
  GitHubTimeoutError,
} from "./errors";
import type { GraphQLRequestOptions, GraphQLResponse } from "./types";

// ---------------------------------------------------------------------------
// GitHub GraphQL Client
// ---------------------------------------------------------------------------
// A minimal, focused GraphQL client built on native fetch().
// No external GraphQL library is used — this keeps the bundle lean and
// gives us full control over error handling, timeouts, and logging.
//
// Responsibilities:
// - Build authenticated HTTP requests.
// - Execute GraphQL operations against the GitHub API.
// - Map HTTP and GraphQL errors to typed SDK error classes.
// - Support request cancellation via AbortSignal (timeout).
//
// This function is the ONLY place in the SDK that calls fetch().
// All services must route through this function.
// ---------------------------------------------------------------------------

/**
 * Builds the standard HTTP headers required by every GitHub GraphQL request.
 * The token is injected from config — never passed as a parameter — to
 * prevent accidental exposure in logs or stack traces.
 */
function buildRequestHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${githubConfig.token}`,
    // Pinning the API version ensures we receive a stable, predictable response
    // shape even if GitHub introduces breaking changes to their default version.
    "X-GitHub-Api-Version": githubConfig.apiVersion,
    // GitHub's GraphQL endpoint requires an Accept header.
    Accept: "application/vnd.github+json",
  };
}

/**
 * Creates an AbortController that automatically aborts after the
 * configured timeout. Returns both the signal and a cleanup function.
 */
function createTimeoutController(timeoutMs: number): {
  signal: AbortSignal;
  clear: () => void;
} {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer),
  };
}

/**
 * Maps a raw HTTP response to a typed SDK error.
 * Returns null if the response indicates success (2xx).
 */
async function mapHttpErrorResponse(
  response: Response,
  requestUrl: string,
): Promise<
  | GitHubAuthenticationError
  | GitHubForbiddenError
  | GitHubRateLimitError
  | GitHubHttpError
  | null
> {
  if (response.ok) return null;

  const rateLimitResetHeader = response.headers.get("x-ratelimit-reset");
  const resetAt = rateLimitResetHeader
    ? new Date(parseInt(rateLimitResetHeader, 10) * 1000).toISOString()
    : undefined;

  switch (response.status) {
    case 401:
      return new GitHubAuthenticationError(requestUrl);

    case 403:
      return new GitHubForbiddenError(requestUrl, resetAt);

    case 429:
      return new GitHubRateLimitError(requestUrl, resetAt);

    default:
      return new GitHubHttpError(response.status, response.statusText, requestUrl);
  }
}

/**
 * Executes a GraphQL operation against the GitHub GraphQL API.
 *
 * @template TData - The expected shape of `response.data`.
 * @param options - The query string, variables, and operation name.
 * @returns The strongly-typed `data` field from the GraphQL response.
 *
 * @throws {GitHubTimeoutError} When the request exceeds the configured timeout.
 * @throws {GitHubNetworkError} When the request fails before a response is received.
 * @throws {GitHubAuthenticationError} On HTTP 401.
 * @throws {GitHubForbiddenError} On HTTP 403.
 * @throws {GitHubRateLimitError} On HTTP 429.
 * @throws {GitHubHttpError} On any other non-2xx HTTP status.
 * @throws {GitHubGraphQLError} When the response body contains a GraphQL `errors` array.
 */
export async function executeQuery<TData>(
  options: GraphQLRequestOptions,
): Promise<TData> {
  const { query, variables, operationName } = options;
  const endpoint = githubConfig.graphqlEndpoint;
  const { signal, clear } = createTimeoutController(githubConfig.requestTimeoutMs);

  let response: Response;

  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: buildRequestHeaders(),
      body: JSON.stringify({
        query,
        variables: variables ?? {},
        operationName,
      }),
      signal,
      // `cache: "no-store"` is critical here: GitHub data changes frequently,
      // and stale data would produce incorrect annual recaps.
      // Caching is handled explicitly at the TanStack Query layer, not here.
      cache: "no-store",
    });
  } catch (error) {
    clear();

    // AbortError means our timeout fired before a response was received.
    if (error instanceof Error && error.name === "AbortError") {
      throw new GitHubTimeoutError(endpoint, githubConfig.requestTimeoutMs);
    }

    // All other fetch failures are network-level errors.
    throw new GitHubNetworkError(endpoint, error);
  }

  // Always clear the timeout once a response is received.
  clear();

  const httpError = await mapHttpErrorResponse(response, endpoint);
  if (httpError !== null) {
    throw httpError;
  }

  // Parse the JSON body. This can fail if GitHub returns a malformed response.
  let body: GraphQLResponse<TData>;
  try {
    body = (await response.json()) as GraphQLResponse<TData>;
  } catch {
    throw new GitHubNetworkError(endpoint);
  }

  // GraphQL errors are returned with HTTP 200 but contain an `errors` array.
  // We always check for these before returning data.
  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new GitHubGraphQLError(body.errors, operationName);
  }

  // If neither errors nor data is present, the response is malformed.
  if (body.data === undefined || body.data === null) {
    throw new GitHubGraphQLError(
      [{ message: "Response contained no `data` field and no `errors` field." }],
      operationName,
    );
  }

  return body.data;
}
