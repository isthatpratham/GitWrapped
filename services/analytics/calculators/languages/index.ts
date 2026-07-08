// ---------------------------------------------------------------------------
// Calculator: Languages
// ---------------------------------------------------------------------------
// Aggregates language byte usage, calculates diversity score, evolution,
// new languages learned, and dormant languages.
// ---------------------------------------------------------------------------

import type { LanguageProfile, Repository } from "@/domain/models";
import type { AnalyticsLanguages } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { createNormalizedScore } from "@/services/analytics/analytics.utils";

export function calculateLanguages(
  profile: LanguageProfile,
  repositories: ReadonlyArray<Repository>,
  recapYear: number,
): AnalyticsLanguages {
  const totalBytes = profile.totalBytes;

  const distribution = profile.usages.map((u) => {
    const percentage = totalBytes > 0 ? parseFloat(((u.totalBytes / totalBytes) * 100).toFixed(2)) : 0;
    return {
      name: u.name,
      color: u.color,
      totalBytes: u.totalBytes,
      percentage,
      repositoryCount: u.repositoryCount,
    };
  });

  const favoriteLanguage = distribution[0]
    ? {
        name: distribution[0].name,
        color: distribution[0].color,
        totalBytes: distribution[0].totalBytes,
        percentage: distribution[0].percentage,
      }
    : null;

  // Diversity Score
  const uniqueLanguageCount = profile.usages.length;
  const maxDiversityLanguages = ANALYTICS_CONFIG.languages.diversityHighThreshold;
  const diversityScore = createNormalizedScore(
    uniqueLanguageCount,
    maxDiversityLanguages,
    `Usage of ${uniqueLanguageCount} distinct language${uniqueLanguageCount === 1 ? "" : "s"} across all repositories.`,
  );

  // Language Evolution: Group by repository creation year and primary language bytes
  const evolutionMap = new Map<number, Map<string, number>>();

  for (const repo of repositories) {
    const creationYear = new Date(repo.createdAt).getFullYear();
    const primaryLang = repo.primaryLanguage?.name;
    if (!primaryLang) continue;

    const totalLangBytes = repo.totalLanguageBytes;

    let yearMap = evolutionMap.get(creationYear);
    if (!yearMap) {
      yearMap = new Map<string, number>();
      evolutionMap.set(creationYear, yearMap);
    }
    const currentBytes = yearMap.get(primaryLang) ?? 0;
    yearMap.set(primaryLang, currentBytes + totalLangBytes);
  }

  const languageEvolution = Array.from(evolutionMap.entries()).flatMap(([year, yearMap]) =>
    Array.from(yearMap.entries()).map(([primaryLanguage, bytesAdded]) => ({
      year,
      primaryLanguage,
      bytesAdded,
    })),
  ).sort((a, b) => a.year - b.year);

  // New Languages Learned: Languages used in repositories created in the recap year,
  // which were never used in repositories created before the recap year.
  const oldLanguages = new Set<string>();
  const newLanguages = new Set<string>();

  for (const repo of repositories) {
    const creationYear = new Date(repo.createdAt).getFullYear();
    for (const edge of repo.languageUsage) {
      const name = edge.language.name;
      if (creationYear < recapYear) {
        oldLanguages.add(name);
      } else if (creationYear === recapYear) {
        newLanguages.add(name);
      }
    }
  }

  const newLanguagesLearned = Array.from(newLanguages).filter((lang) => !oldLanguages.has(lang));

  // Dormant Languages: Languages used in repositories created before the recap year
  // but which received zero updates/pushes in the recap year.
  const activeLanguagesThisYear = new Set<string>();
  const legacyLanguages = new Set<string>();

  for (const repo of repositories) {
    const pushYear = repo.lastPushedAt ? new Date(repo.lastPushedAt).getFullYear() : 0;
    const creationYear = new Date(repo.createdAt).getFullYear();

    for (const edge of repo.languageUsage) {
      const name = edge.language.name;
      if (pushYear === recapYear) {
        activeLanguagesThisYear.add(name);
      }
      if (creationYear < recapYear) {
        legacyLanguages.add(name);
      }
    }
  }

  const dormantLanguages = Array.from(legacyLanguages).filter((lang) => !activeLanguagesThisYear.has(lang));

  return {
    favoriteLanguage,
    languageDiversityScore: diversityScore,
    languageDistribution: distribution,
    languageEvolution,
    newLanguagesLearned,
    dormantLanguages,
  };
}
