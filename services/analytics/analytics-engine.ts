import type { AnalyticsEngineInput, AnalyticsResult } from "./analytics.types";
import { calculateRepositories } from "./calculators/repositories";
import { calculateLanguages } from "./calculators/languages";
import { mapRepositoriesToLanguageProfile } from "./calculators/languages/profile";
import { calculateProductivity } from "./calculators/productivity";
import { calculateConsistency } from "./calculators/consistency";
import { calculateActivity } from "./calculators/activity";
import { calculateAchievements } from "./calculators/achievements";
import { calculateTimeline } from "./calculators/timeline";
import { calculateSummary } from "./calculators/summary";
import { calculateOrganizations } from "./calculators/organizations";
import { createNormalizedScore } from "./analytics.utils";
import { ANALYTICS_CONFIG } from "./analytics.constants";
import { deriveAnalyticsAvailability, resolvedCollectionCount } from "./availability";
import { utcYear } from "@/lib/time/utc";

export function computeAnnualAnalytics(input: AnalyticsEngineInput): AnalyticsResult {
  const { user, contributions, repositories, pullRequests, issues, organizations, commits, year } =
    input;

  const repositoriesCalc = calculateRepositories(repositories, contributions);
  const languageProfile = mapRepositoriesToLanguageProfile(repositories);
  const languagesCalc = calculateLanguages(languageProfile, repositories, year);
  const productivityCalc = calculateProductivity(contributions, year);
  const consistencyCalc = calculateConsistency(contributions, year);
  const activityCalc = calculateActivity(commits, pullRequests, issues);
  const achievementsCalc = calculateAchievements(input);
  const timelineCalc = calculateTimeline(contributions, pullRequests, issues);
  const organizationsCalc = calculateOrganizations(organizations);
  const availability = deriveAnalyticsAvailability(input, activityCalc, languagesCalc);

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

  const totalStars = repositories.reduce((sum, r) => sum + r.starCount, 0);
  const totalForks = repositories.reduce((sum, r) => sum + r.forkCount, 0);
  const rawRepoScore = totalStars * 2 + totalForks * 3 + repositories.length * 5;
  const repositoryScore = createNormalizedScore(
    rawRepoScore,
    ANALYTICS_CONFIG.scoring.maxRepositoryScore,
    `Calculated from portfolio impact: ${totalStars} stars, ${totalForks} forks, and ${repositories.length} repos.`,
  );

  const newReposThisYear = repositories.filter((r) => utcYear(r.createdAt) === year).length;
  const rawGrowthScore = newReposThisYear * 15 + languagesCalc.newLanguagesLearned.length * 20;
  const growthScore = createNormalizedScore(
    rawGrowthScore,
    ANALYTICS_CONFIG.scoring.maxGrowthScore,
    `Grew portfolio with ${newReposThisYear} new repositories and learned ${languagesCalc.newLanguagesLearned.length} new languages.`,
  );

  const rawProductivityScore =
    productivityCalc.averageContributionsPerDay * 20 + productivityCalc.contributionMomentum * 10;
  const productivityScore = createNormalizedScore(
    rawProductivityScore,
    ANALYTICS_CONFIG.scoring.maxProductivityScore,
    `Calculated from daily coding averages and momentum score of ${productivityCalc.contributionMomentum}.`,
  );

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
      totalPullRequests: resolvedCollectionCount(
        input.sources.pullRequests,
        pullRequests.length,
        contributions.pullRequestCount,
      ),
      totalIssues: resolvedCollectionCount(
        input.sources.issues,
        issues.length,
        contributions.issueCount,
      ),
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
    availability,
  };
}
