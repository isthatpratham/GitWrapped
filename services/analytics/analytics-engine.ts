// ---------------------------------------------------------------------------
// Analytics Engine — Core Orchestrator
// ---------------------------------------------------------------------------
// Orchestrates all independent calculators in a clean, pure, single-pass
// pipeline to produce the final immutable AnalyticsResult payload.
// ---------------------------------------------------------------------------

import type { AnalyticsEngineInput, AnalyticsResult } from "./analytics.types";
import { calculateContributions } from "./calculators/contributions";
import { calculateRepositories } from "./calculators/repositories";
import { calculateLanguages } from "./calculators/languages";
import { calculateProductivity } from "./calculators/productivity";
import { calculateConsistency } from "./calculators/consistency";
import { calculateActivity } from "./calculators/activity";
import { calculateAchievements } from "./calculators/achievements";
import { calculateTimeline } from "./calculators/timeline";
import { calculateSummary } from "./calculators/summary";
import { calculateOrganizations } from "./calculators/organizations";
import { createNormalizedScore } from "./analytics.utils";
import { ANALYTICS_CONFIG } from "./analytics.constants";

/**
 * Executes the complete analytics computation pipeline.
 * Takes the raw domain inputs and applies all calculator modules.
 *
 * @param input - The domain structures representing the user's year in code.
 * @returns The complete, immutable `AnalyticsResult` payload.
 */
export function computeAnnualAnalytics(input: AnalyticsEngineInput): AnalyticsResult {
  const { user, contributions, repositories, pullRequests, issues, organizations, commits, year } = input;

  // Execute independent calculators
  const contributionsCalc = calculateContributions(contributions);
  const repositoriesCalc = calculateRepositories(repositories, contributions);
  const languagesCalc = calculateLanguages(
    {
      totalBytes: repositories.reduce((sum, r) => sum + r.totalLanguageBytes, 0),
      usages: Array.from(
        repositories
          .flatMap((r) => r.languageUsage)
          .reduce((map, usage) => {
            const existing = map.get(usage.language.name);
            if (existing) {
              map.set(usage.language.name, {
                ...existing,
                totalBytes: existing.totalBytes + usage.bytes,
                repositoryCount: existing.repositoryCount + 1,
              });
            } else {
              map.set(usage.language.name, {
                name: usage.language.name,
                color: usage.language.color,
                totalBytes: usage.bytes,
                repositoryCount: 1,
              });
            }
            return map;
          }, new Map<string, { name: string; color: string | null; totalBytes: number; repositoryCount: number }>())
          .values(),
      ).sort((a, b) => b.totalBytes - a.totalBytes),
    },
    repositories,
    year,
  );
  const productivityCalc = calculateProductivity(contributions, year);
  const consistencyCalc = calculateConsistency(contributions);
  const activityCalc = calculateActivity(commits, pullRequests, issues, contributions);
  const achievementsCalc = calculateAchievements(input);
  const timelineCalc = calculateTimeline(contributions, pullRequests, issues);
  const organizationsCalc = calculateOrganizations(organizations);

  // Derive scores
  // 1. Activity Score (0-1000 normalized)
  // Commits count + 5*PRs + 3*Issues + 2*Reviews
  const rawActivityScore =
    contributions.commitCount +
    contributions.pullRequestCount * 5 +
    contributions.issueCount * 3 +
    contributions.reviewCount * 2;
  const activityScore = createNormalizedScore(
    rawActivityScore,
    ANALYTICS_CONFIG.scoring.maxActivityScore,
    `Authored ${contributions.commitCount} commits, merged ${contributions.pullRequestCount} PRs, and resolved ${contributions.issueCount} issues.`,
  );

  // 2. Repository Score (0-100 normalized)
  // Weighted score of stars, forks, and total public repos
  const totalStars = repositories.reduce((sum, r) => sum + r.starCount, 0);
  const totalForks = repositories.reduce((sum, r) => sum + r.forkCount, 0);
  const rawRepoScore = totalStars * 2 + totalForks * 3 + repositories.length * 5;
  const repositoryScore = createNormalizedScore(
    rawRepoScore,
    ANALYTICS_CONFIG.scoring.maxRepositoryScore,
    `Calculated from portfolio impact: ${totalStars} stars, ${totalForks} forks, and ${repositories.length} repos.`,
  );

  // 3. Growth Score (0-100 normalized)
  // Based on number of new repos created this year + new languages learned
  const newReposThisYear = repositories.filter((r) => new Date(r.createdAt).getFullYear() === year).length;
  const rawGrowthScore = newReposThisYear * 15 + languagesCalc.newLanguagesLearned.length * 20;
  const growthScore = createNormalizedScore(
    rawGrowthScore,
    ANALYTICS_CONFIG.scoring.maxGrowthScore,
    `Grew portfolio with ${newReposThisYear} new repositories and learned ${languagesCalc.newLanguagesLearned.length} new languages.`,
  );

  // 4. Productivity Score (0-100 normalized)
  // Based on average contributions per day and contribution momentum
  const rawProductivityScore = productivityCalc.averageContributionsPerDay * 20 + productivityCalc.contributionMomentum * 10;
  const productivityScore = createNormalizedScore(
    rawProductivityScore,
    ANALYTICS_CONFIG.scoring.maxProductivityScore,
    `Calculated from daily coding averages and momentum score of ${productivityCalc.contributionMomentum}.`,
  );

  // Synthesize Summary
  const summaryCalc = calculateSummary({
    handle: user.handle,
    totalContributions: contributions.calendar.totalCount,
    commitCount: contributions.commitCount,
    prCount: contributions.pullRequestCount,
    issueCount: contributions.issueCount,
    longestStreak: consistencyCalc.longestStreak,
    favoriteLanguageName: languagesCalc.favoriteLanguage?.name ?? null,
    achievementCount: achievementsCalc.length,
    publicRepos: repositories.length,
  });

  return {
    year,
    computedAt: new Date().toISOString(),
    user: {
      handle: user.handle,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      accountCreatedAt: user.accountCreatedAt,
    },
    overview: {
      totalContributions: contributions.calendar.totalCount,
      totalCommits: contributions.commitCount,
      totalRepositories: repositories.length,
      totalStarsEarned: totalStars,
      totalForks,
      totalPullRequests: pullRequests.length,
      totalIssues: issues.length,
      scores: {
        activity: activityScore,
        consistency: consistencyCalc.consistencyScore,
        repository: repositoryScore,
        languageDiversity: languagesCalc.languageDiversityScore,
        growth: growthScore,
        productivity: productivityScore,
      },
    },
    productivity: productivityCalc,
    consistency: consistencyCalc,
    activity: activityCalc,
    languages: languagesCalc,
    repositories: repositoriesCalc,
    organizations: organizationsCalc,
    achievements: {
      unlockedList: achievementsCalc,
      count: achievementsCalc.length,
    },
    timeline: timelineCalc,
    summary: summaryCalc,
  };
}
