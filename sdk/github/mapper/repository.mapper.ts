// ---------------------------------------------------------------------------
// Mapper: GitHub Repository → Domain Repository
// ---------------------------------------------------------------------------
// Converts the raw SDK `GitHubRepository` into the domain `Repository`.
//
// Rules:
// - Removes GraphQL structures like edges and nodes.
// - Normalises the owner name from the nameWithOwner string.
// - Safely handles nullable fields.
// ---------------------------------------------------------------------------

import type { GitHubRepository } from "@/sdk/github/types";
import type { Repository, RepositoryLanguageUsage, RepositoryVisibility } from "@/domain/models/repository";

/**
 * Parses the owner login and repository name from the `nameWithOwner` string.
 * Example: "vercel/next.js" -> { ownerName: "vercel", name: "next.js" }
 */
function parseNameWithOwner(nameWithOwner: string): { ownerName: string; name: string } {
  const parts = nameWithOwner.split("/");
  return {
    ownerName: parts[0] ?? "",
    name: parts[1] ?? "",
  };
}

/**
 * Maps a raw `GitHubRepository` from the GitHub SDK into the domain
 * `Repository` model.
 *
 * @param raw - The SDK-level repository returned by `fetchUserRepositories`.
 * @returns An immutable `Repository` domain model.
 */
export function mapGitHubRepositoryToRepository(raw: GitHubRepository): Repository {
  const { ownerName, name } = parseNameWithOwner(raw.nameWithOwner);

  const languageUsage: ReadonlyArray<RepositoryLanguageUsage> = raw.languages.edges.map((edge) => ({
    language: {
      name: edge.node.name,
      color: edge.node.color,
    },
    bytes: edge.size,
  }));

  // Safe cast visibility or default to PUBLIC
  let visibility: RepositoryVisibility = "PUBLIC";
  if (raw.visibility === "PRIVATE" || raw.visibility === "INTERNAL") {
    visibility = raw.visibility;
  }

  return {
    id: raw.id,
    name,
    ownerName,
    description: raw.description,
    createdAt: raw.createdAt,
    lastPushedAt: raw.pushedAt,
    lastUpdatedAt: raw.updatedAt,
    starCount: raw.stargazerCount,
    forkCount: raw.forkCount,
    watcherCount: raw.watcherCount,
    openIssueCount: raw.openIssueCount,
    openPullRequestCount: raw.openPullRequestCount,
    isFork: raw.isFork,
    isArchived: raw.isArchived,
    visibility,
    defaultBranch: raw.defaultBranch,
    homepageUrl: raw.homepageUrl,
    url: raw.url,
    diskUsageKilobytes: raw.diskUsage,
    primaryLanguage: raw.primaryLanguage
      ? { name: raw.primaryLanguage.name, color: raw.primaryLanguage.color }
      : null,
    languageUsage,
    totalLanguageBytes: raw.languages.totalSize,
    topics: raw.topics.map((t) => ({ name: t })),
  };
}
