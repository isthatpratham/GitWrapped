import { z } from "zod";

import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import { isoTimestampSchema } from "../schemas/primitives";
import { utcYearRange } from "@/lib/time/utc";
import type { GitHubUserProfile } from "../types";
import {
  GET_USER_PROFILE,
  type GetUserProfileData,
  type GetUserProfileVariables,
} from "../queries";

// ---------------------------------------------------------------------------
// Zod schema: User Profile
// ---------------------------------------------------------------------------
// Validates that the raw API response matches our expected shape before
// any downstream code touches it. This acts as a runtime contract check.
// ---------------------------------------------------------------------------

const gitHubUserProfileSchema = z.object({
  id: z.string().min(1),
  login: z.string().min(1),
  name: z.string().nullable(),
  avatarUrl: z.string().url(),
  bio: z.string().nullable(),
  createdAt: isoTimestampSchema,
  websiteUrl: z.string().nullable(),
  twitterUsername: z.string().nullable(),
  company: z.string().nullable(),
  location: z.string().nullable(),
  followers: z.object({ totalCount: z.number().int().nonnegative() }),
  following: z.object({ totalCount: z.number().int().nonnegative() }),
  repositories: z.object({ totalCount: z.number().int().nonnegative() }),
});

// ---------------------------------------------------------------------------
// Normaliser
// ---------------------------------------------------------------------------
// Maps raw GraphQL response fields to our typed `GitHubUserProfile`.
// This indirection means if GitHub renames a field, only this function changes.
// ---------------------------------------------------------------------------

function normaliseUserProfile(raw: z.infer<typeof gitHubUserProfileSchema>): GitHubUserProfile {
  return {
    id: raw.id,
    login: raw.login,
    name: raw.name,
    avatarUrl: raw.avatarUrl,
    bio: raw.bio,
    createdAt: raw.createdAt,
    websiteUrl: raw.websiteUrl,
    twitterUsername: raw.twitterUsername,
    company: raw.company,
    location: raw.location,
    publicRepos: raw.repositories.totalCount,
    followers: raw.followers.totalCount,
    following: raw.following.totalCount,
  };
}

// ---------------------------------------------------------------------------
// Public service function
// ---------------------------------------------------------------------------

/**
 * Fetches and validates the public profile for a given GitHub user.
 *
 * @param username - The GitHub login handle to look up.
 * @returns A validated `GitHubUserProfile` object.
 *
 * @throws {GitHubUserNotFoundError} When the username does not exist on GitHub.
 * @throws {GitHubResponseValidationError} When the API response fails schema validation.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL-level failure.
 */
export async function fetchUserProfile(username: string): Promise<GitHubUserProfile> {
  const data = await executeQuery<GetUserProfileData>({
    query: GET_USER_PROFILE,
    variables: { login: username } satisfies GetUserProfileVariables,
    operationName: "GetUserProfile",
  });

  if (data.user === null) {
    throw new GitHubUserNotFoundError(username);
  }

  const validation = gitHubUserProfileSchema.safeParse(data.user);
  if (!validation.success) {
    throw new GitHubResponseValidationError("GetUserProfile", validation.error);
  }

  return normaliseUserProfile(validation.data);
}

/**
 * Validates that a GitHub username exists without fetching the full profile.
 * Useful for lightweight username validation before initiating heavy fetches.
 *
 * @param username - The GitHub login handle to check.
 * @returns `true` if the user exists, `false` if not found.
 *
 * @throws {GitHubSDKError} For transport, HTTP, or GraphQL failures.
 */
export async function userExists(username: string): Promise<boolean> {
  try {
    await fetchUserProfile(username);
    return true;
  } catch (error) {
    if (error instanceof GitHubUserNotFoundError) return false;
    throw error;
  }
}

// ---------------------------------------------------------------------------
// Date range helpers (used by contribution and PR services)
// ---------------------------------------------------------------------------

/**
 * Returns the ISO 8601 start and end datetime strings for a given calendar year.
 * These are the exact values GitHub's `contributionsCollection(from:, to:)` expects.
 */
export function getYearDateRange(year: number): { from: string; to: string } {
  return utcYearRange(year);
}

/**
 * Returns the default recap year from config.
 * Exposed here so callers don't need to import config directly.
 */
export function getRecapYear(): number {
  return githubConfig.recapYear;
}
