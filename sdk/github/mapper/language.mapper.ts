// ---------------------------------------------------------------------------
// Mapper: GitHub Repository List → Domain LanguageProfile
// ---------------------------------------------------------------------------
// Aggregates language byte usage across all public repositories in a user's
// portfolio.
//
// Design:
// - Aggregation is a structural transformation mapping many repository language
//   records into a single unified profile.
// - Ordered descending by byte count so the top language is always first.
// ---------------------------------------------------------------------------

import type { GitHubRepository } from "@/sdk/github/types";
import type { LanguageProfile, LanguageUsage } from "@/domain/models/language";

/**
 * Aggregates and maps a list of raw SDK `GitHubRepository` objects into a
 * single unified `LanguageProfile`.
 *
 * @param repositories - The list of repositories.
 * @returns A normalised `LanguageProfile` domain model.
 */
export function mapGitHubRepositoriesToLanguageProfile(
  repositories: ReadonlyArray<GitHubRepository>,
): LanguageProfile {
  const languageMap = new Map<string, { color: string | null; totalBytes: number; repoCount: number }>();
  let totalBytes = 0;

  for (const repo of repositories) {
    for (const edge of repo.languages.edges) {
      const { name, color } = edge.node;
      const size = edge.size;

      totalBytes += size;

      const existing = languageMap.get(name);
      if (existing) {
        existing.totalBytes += size;
        existing.repoCount += 1;
      } else {
        languageMap.set(name, {
          color,
          totalBytes: size,
          repoCount: 1,
        });
      }
    }
  }

  const usages: LanguageUsage[] = Array.from(languageMap.entries())
    .map(([name, data]) => ({
      name,
      color: data.color,
      totalBytes: data.totalBytes,
      repositoryCount: data.repoCount,
    }))
    .sort((a, b) => b.totalBytes - a.totalBytes);

  return {
    totalBytes,
    usages,
  };
}
