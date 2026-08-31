import "server-only";

import { z } from "zod";

// ---------------------------------------------------------------------------
// Environment schema
// ---------------------------------------------------------------------------
// All GitHub SDK environment variables are declared and validated here.
// This is the single source of truth for what the SDK requires at runtime.
// Using Zod ensures failures are caught at startup, not at request time.
// ---------------------------------------------------------------------------

const githubEnvSchema = z.object({
  /**
   * GitHub Personal Access Token (server-side only).
   * Required scopes: read:user, repo (public only for V1).
   * Never exposed to the client bundle.
   */
  GITHUB_TOKEN: z
    .string()
    .min(1, "GITHUB_TOKEN is required for the GitHub SDK")
    .refine(
      (value) => value.startsWith("ghp_") || value.startsWith("github_pat_"),
      "GITHUB_TOKEN must be a GitHub personal access token",
    ),

  /**
   * GitHub GraphQL API endpoint.
   * Defaults to the standard GitHub GraphQL endpoint.
   * Can be overridden for enterprise GitHub instances.
   */
  NEXT_PUBLIC_GITHUB_GRAPHQL: z
    .string()
    .url("NEXT_PUBLIC_GITHUB_GRAPHQL must be a valid URL")
    .default("https://api.github.com/graphql"),
});

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------
// We perform a one-time validation at module load time.
// In production: throws immediately so the deployment fails visibly.
// In development: logs a descriptive error and uses safe fallbacks.
// ---------------------------------------------------------------------------

function parseGitHubEnv() {
  const result = githubEnvSchema.safeParse({
    GITHUB_TOKEN: process.env.GITHUB_TOKEN,
    NEXT_PUBLIC_GITHUB_GRAPHQL: process.env.NEXT_PUBLIC_GITHUB_GRAPHQL,
  });

  if (!result.success) {
    const issueSummary = result.error.issues
      .map((issue) => `${issue.path.join(".") || "env"}:${issue.code}`)
      .join(", ");
    const message = `GitHub SDK: invalid environment configuration (${issueSummary}).`;

    if (process.env.NODE_ENV === "production") {
      throw new Error(message);
    }

    console.error(message);

    // Return safe development fallbacks so the dev server starts.
    return {
      GITHUB_TOKEN: process.env.GITHUB_TOKEN ?? "",
      NEXT_PUBLIC_GITHUB_GRAPHQL:
        process.env.NEXT_PUBLIC_GITHUB_GRAPHQL ?? "https://api.github.com/graphql",
    };
  }

  return result.data;
}

const parsedEnv = parseGitHubEnv();

// ---------------------------------------------------------------------------
// GitHub SDK Configuration
// ---------------------------------------------------------------------------
// A typed, immutable configuration object consumed throughout the SDK.
// All magic strings live here — nowhere else.
// ---------------------------------------------------------------------------

export const githubConfig = {
  /** GitHub GraphQL API endpoint URL. */
  graphqlEndpoint: parsedEnv.NEXT_PUBLIC_GITHUB_GRAPHQL,

  /** Server-side GitHub PAT. Never pass this to client components. */
  token: parsedEnv.GITHUB_TOKEN,

  /**
   * GitHub REST API base URL.
   * Used as fallback for endpoints unavailable via GraphQL (e.g., repository traffic).
   */
  restEndpoint: "https://api.github.com",

  /**
   * Default request timeout in milliseconds.
   * Prevents hanging requests from blocking the rendering pipeline.
   */
  requestTimeoutMs: 15_000,

  /**
   * Maximum number of items to fetch per paginated request.
   * GitHub's GraphQL API caps this at 100.
   */
  maxPageSize: 100,

  /**
   * The year for which we generate the annual recap.
   * Defaults to the current calendar year.
   */
  get recapYear(): number {
    return new Date().getUTCFullYear();
  },

  /**
   * GitHub API version header.
   * Pinning the version ensures predictable API behavior even as GitHub evolves.
   */
  apiVersion: "2022-11-28",
} as const;
