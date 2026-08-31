import type { LanguageProfile, LanguageUsage, Repository } from "@/domain/models";

/**
 * Canonical language aggregation for a repository portfolio.
 * The analytics engine must use this function — do not re-implement.
 */
export function mapRepositoriesToLanguageProfile(
  repositories: ReadonlyArray<Repository>,
): LanguageProfile {
  const languageMap = new Map<string, { color: string | null; totalBytes: number; repoCount: number }>();
  let totalBytes = 0;

  for (const repo of repositories) {
    for (const usage of repo.languageUsage) {
      const { name, color } = usage.language;
      const size = usage.bytes;
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
