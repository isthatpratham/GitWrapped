// ---------------------------------------------------------------------------
// GitHub SDK Error Hierarchy
// ---------------------------------------------------------------------------
// A structured error hierarchy allows callers to handle failures precisely
// without inspecting error messages. Each error class carries enough context
// for logging, telemetry, and user-facing messaging at higher layers.
//
// Design principles:
// - Every error extends GitHubSDKError for exhaustive catch blocks.
// - Errors carry structured metadata, not just strings.
// - HTTP status codes are preserved for rate-limit and auth handling.
// - Error names are explicit for serialisation / logging pipelines.
//
// TypeScript note on `name`:
// The base Error class types `name` as `string`. In strict mode, subclass
// literal types ("GitHubNetworkError") are assignable to `string`, but
// `override readonly` narrows the type to a literal which conflicts with
// the base declaration. We use `declare` in the base to establish intent,
// and each subclass assigns its literal in the constructor body.
// ---------------------------------------------------------------------------

/**
 * Base class for all errors originating from the GitHub SDK.
 * Upstream layers should catch `GitHubSDKError` to handle any SDK failure.
 */
export class GitHubSDKError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "GitHubSDKError";
    // Restore prototype chain broken by extending built-in Error in TypeScript.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Network / Transport errors
// ---------------------------------------------------------------------------

/**
 * Thrown when a network request fails before receiving an HTTP response.
 * Common causes: DNS failure, ECONNREFUSED, request timeout.
 */
export class GitHubNetworkError extends GitHubSDKError {
  constructor(
    public readonly requestUrl: string,
    cause?: unknown,
  ) {
    super(`Network request failed for: ${requestUrl}`, { cause });
    this.name = "GitHubNetworkError";
  }
}

/**
 * Thrown when a request exceeds the configured timeout threshold.
 */
export class GitHubTimeoutError extends GitHubSDKError {
  constructor(
    public readonly requestUrl: string,
    public readonly timeoutMs: number,
  ) {
    super(`Request timed out after ${timeoutMs}ms for: ${requestUrl}`);
    this.name = "GitHubTimeoutError";
  }
}

// ---------------------------------------------------------------------------
// HTTP / Response errors
// ---------------------------------------------------------------------------

/**
 * Thrown when the GitHub API returns a non-2xx HTTP status code.
 * The raw `status` and `statusText` are preserved for upstream handling.
 */
export class GitHubHttpError extends GitHubSDKError {
  constructor(
    public readonly status: number,
    public readonly statusText: string,
    public readonly requestUrl: string,
  ) {
    super(`GitHub API returned HTTP ${status} ${statusText} for: ${requestUrl}`);
    this.name = "GitHubHttpError";
  }
}

/**
 * Thrown when GitHub returns HTTP 401 — invalid or expired token.
 */
export class GitHubAuthenticationError extends GitHubHttpError {
  constructor(requestUrl: string) {
    super(401, "Unauthorized", requestUrl);
    this.name = "GitHubAuthenticationError";
  }
}

/**
 * Thrown when GitHub returns HTTP 403 — typically a rate limit or
 * insufficient token permissions.
 */
export class GitHubForbiddenError extends GitHubHttpError {
  /** ISO 8601 timestamp when the rate limit window resets. May be undefined. */
  public readonly rateLimitResetAt: string | undefined;

  constructor(requestUrl: string, rateLimitResetAt?: string) {
    super(403, "Forbidden", requestUrl);
    this.name = "GitHubForbiddenError";
    this.rateLimitResetAt = rateLimitResetAt;
  }
}

/**
 * Thrown when GitHub returns HTTP 429 — explicit rate limit exceeded.
 * Distinct from 403 because GitHub may return either depending on the context.
 */
export class GitHubRateLimitError extends GitHubSDKError {
  constructor(
    public readonly requestUrl: string,
    /** ISO 8601 timestamp when the rate limit window resets. */
    public readonly resetAt: string | undefined,
  ) {
    const resetInfo = resetAt ? ` Rate limit resets at: ${resetAt}.` : "";
    super(`GitHub API rate limit exceeded for: ${requestUrl}.${resetInfo}`);
    this.name = "GitHubRateLimitError";
  }
}

// ---------------------------------------------------------------------------
// GraphQL-level errors
// ---------------------------------------------------------------------------

/**
 * Represents a single error object returned inside a GraphQL `errors` array.
 */
export interface GraphQLErrorDetail {
  readonly message: string;
  readonly type?: string;
  readonly path?: ReadonlyArray<string | number>;
  readonly locations?: ReadonlyArray<{ readonly line: number; readonly column: number }>;
}

/**
 * Thrown when the GitHub GraphQL API returns a response with an `errors` array.
 * This is distinct from a transport error — the HTTP response was 200 OK,
 * but the GraphQL execution itself failed.
 */
export class GitHubGraphQLError extends GitHubSDKError {
  constructor(
    public readonly errors: ReadonlyArray<GraphQLErrorDetail>,
    public readonly operationName: string,
  ) {
    const summary = errors
      .map((e) => {
        let msg = `[${e.type || "Error"}] ${e.message}`;
        if (e.path) msg += ` (Path: ${e.path.join(".")})`;
        if (e.locations) {
          const locs = e.locations.map((l) => `line ${l.line}, col ${l.column}`).join(", ");
          msg += ` (Location: ${locs})`;
        }
        return msg;
      })
      .join(" | ");
    super(`GraphQL operation "${operationName}" failed: ${summary}`);
    this.name = "GitHubGraphQLError";
  }
}

// ---------------------------------------------------------------------------
// Domain errors
// ---------------------------------------------------------------------------

/**
 * Thrown when a GitHub user is not found (GraphQL returns null for the user node).
 */
export class GitHubUserNotFoundError extends GitHubSDKError {
  constructor(public readonly username: string) {
    super(`GitHub user not found: "${username}"`);
    this.name = "GitHubUserNotFoundError";
  }
}

/**
 * Thrown when the GitHub API response fails Zod schema validation.
 * This indicates either an API contract change or an unexpected response shape.
 * Preserves the raw Zod error for debugging.
 */
export class GitHubResponseValidationError extends GitHubSDKError {
  constructor(
    public readonly operationName: string,
    public readonly zodError: unknown,
  ) {
    super(
      `Response validation failed for operation "${operationName}". ` +
        "The API response shape does not match the expected schema. " +
        "This may indicate a GitHub API contract change.",
    );
    this.name = "GitHubResponseValidationError";
  }
}

// ---------------------------------------------------------------------------
// Type guard utilities
// ---------------------------------------------------------------------------

/** Returns true if the given error is any GitHub SDK error. */
export function isGitHubSDKError(error: unknown): error is GitHubSDKError {
  return error instanceof GitHubSDKError;
}

/** Returns true if the error is a rate limit error (403 or 429). */
export function isGitHubRateLimitError(
  error: unknown,
): error is GitHubRateLimitError | GitHubForbiddenError {
  return error instanceof GitHubRateLimitError || error instanceof GitHubForbiddenError;
}

/** Returns true if the error is an authentication failure. */
export function isGitHubAuthenticationError(
  error: unknown,
): error is GitHubAuthenticationError {
  return error instanceof GitHubAuthenticationError;
}
