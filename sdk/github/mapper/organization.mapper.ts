// ---------------------------------------------------------------------------
// Mapper: GitHub Organization → Domain Organization
// ---------------------------------------------------------------------------
// Converts the raw SDK `GitHubOrganization` into the domain `Organization`.
// ---------------------------------------------------------------------------

import type { GitHubOrganization } from "@/sdk/github/types";
import type { Organization } from "@/domain/models/organization";

/**
 * Maps a raw `GitHubOrganization` from the GitHub SDK into the domain
 * `Organization` model.
 *
 * @param raw - The SDK-level organisation object.
 * @returns An immutable `Organization` domain model.
 */
export function mapGitHubOrganizationToOrganization(raw: GitHubOrganization): Organization {
  return {
    handle: raw.login,
    displayName: raw.name ?? null,
    avatarUrl: raw.avatarUrl,
    description: raw.description ?? null,
    profileUrl: raw.url,
    websiteUrl: raw.websiteUrl ?? null,
    memberCount: raw.memberCount,
    repositoryCount: raw.repositoryCount,
  };
}
