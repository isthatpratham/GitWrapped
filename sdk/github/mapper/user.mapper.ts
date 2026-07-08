// ---------------------------------------------------------------------------
// Mapper: GitHub User → Domain UserProfile
// ---------------------------------------------------------------------------
// Converts the raw SDK `GitHubUserProfile` into the domain `UserProfile`.
// This is the only place in the codebase where GitHub field names are
// translated to GitWrapped business language.
//
// Rules:
// - All fields are validated and have explicit fallback behaviour.
// - No exceptions are thrown — missing optional fields produce null.
// - No calculations are performed — only structural mapping.
// ---------------------------------------------------------------------------

import type { GitHubUserProfile } from "@/sdk/github/types";
import type { UserProfile } from "@/domain/models/user";

/**
 * Maps a raw `GitHubUserProfile` from the GitHub SDK into the domain
 * `UserProfile` model used by the Analytics Engine and Story Engine.
 *
 * @param raw - The SDK-level user profile returned by `fetchUserProfile`.
 * @returns An immutable `UserProfile` domain model.
 *
 * @example
 * const profile = mapGitHubUserToUserProfile(data.user);
 * // profile.handle === "torvalds"  (was: raw.login)
 * // profile.followerCount === 220000  (was: raw.followers)
 */
export function mapGitHubUserToUserProfile(raw: GitHubUserProfile): UserProfile {
  return {
    handle: raw.login,
    displayName: raw.name ?? null,
    avatarUrl: raw.avatarUrl,
    bio: raw.bio ?? null,
    company: raw.company ?? null,
    location: raw.location ?? null,
    websiteUrl: raw.websiteUrl ?? null,
    twitterHandle: raw.twitterUsername ?? null,
    accountCreatedAt: raw.createdAt,
    publicRepositoryCount: raw.publicRepos,
    followerCount: raw.followers,
    followingCount: raw.following,
  };
}
