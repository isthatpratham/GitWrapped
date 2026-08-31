import { availableMeasured, unavailable } from "@/domain/models";
import type { AnalyticsResult } from "@/services/analytics";

const computedAt = "2026-09-01T00:00:00.000Z";

function score(percentage: number) {
  return {
    value: percentage,
    maximum: 100,
    percentage,
    description: "test",
  };
}

export function emptyTimeline(year: number, days: ReadonlyArray<{ date: string; count: number }>) {
  return {
    daily: days.map((day) => ({
      date: day.date,
      commitCount: day.count,
      pullRequestCount: 0,
      issueCount: 0,
      reviewCount: 0,
      totalContributions: day.count,
    })),
    weekly: [],
    monthly: [],
    quarterly: [],
    yearly: {
      date: String(year),
      commitCount: 0,
      pullRequestCount: 0,
      issueCount: 0,
      reviewCount: 0,
      totalContributions: days.reduce((sum, day) => sum + day.count, 0),
    },
  };
}

export function baseAnalytics(overrides: Partial<AnalyticsResult> = {}): AnalyticsResult {
  const year = overrides.year ?? 2026;
  const base: AnalyticsResult = {
    year,
    computedAt,
    user: {
      handle: "octocat",
      displayName: "The Octocat",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
      accountCreatedAt: "2011-01-25T00:00:00.000Z",
    },
    overview: {
      totalContributions: 0,
      totalCommits: 0,
      totalRepositories: 0,
      totalStarsEarned: 0,
      totalForks: 0,
      totalPullRequests: 0,
      totalIssues: 0,
      scores: {
        activity: score(0),
        consistency: score(0),
        repository: score(0),
        languageDiversity: score(0),
        growth: score(0),
        productivity: score(0),
      },
    },
    productivity: {
      mostProductiveDay: null,
      mostProductiveWeek: null,
      mostProductiveMonth: null,
      averageContributionsPerDay: 0,
      averageContributionsPerWeek: 0,
      averageContributionsPerMonth: 0,
      peakContributionDay: null,
      quietestMonth: null,
      productivityTrend: "STABLE",
      contributionMomentum: 0,
    },
    consistency: {
      longestStreak: 0,
      longestStreakStartDate: null,
      longestStreakEndDate: null,
      currentStreak: 0,
      currentStreakStartDate: null,
      averageWeeklyConsistency: 0,
      averageMonthlyConsistency: 0,
      activeDaysCount: 0,
      activeDaysRatio: 0,
      missedDaysCount: 365,
      consecutiveActiveWeeks: 0,
      consistencyScore: score(0),
    },
    activity: {
      commits: {
        totalCount: 0,
        averageLinesPerCommit: 0,
        biggestCommit: null,
        commitMessageQualityScore: null,
      },
      pullRequests: {
        opened: 0,
        merged: 0,
        closed: 0,
        mergeRate: 0,
        biggestPullRequest: null,
      },
      issues: {
        opened: 0,
        closed: 0,
        closeRate: 0,
        mostReactedIssue: null,
      },
      timeAnalysis: {
        mostActiveHour: null,
        nightOwlScore: null,
        earlyBirdScore: null,
        weekendActivity: null,
        weekdayActivity: null,
        preferredCodingSession: null,
      },
    },
    languages: {
      favoriteLanguage: null,
      languageDiversityScore: score(0),
      languageDistribution: [],
      languageEvolution: [],
      newLanguagesLearned: [],
      dormantLanguages: [],
    },
    repositories: {
      favoriteRepository: null,
      fastestGrowingRepository: null,
      mostActiveRepository: null,
      oldestActiveRepository: null,
      newestRepository: null,
      repositoryGrowthTimeline: [],
    },
    organizations: {
      organizationContributionsCount: 0,
      mostActiveOrganization: null,
      organizationList: [],
    },
    achievements: { unlockedList: [], count: 0 },
    timeline: emptyTimeline(year, []),
    summary: {
      highlights: [],
      bestMoments: [],
      interestingFacts: [],
      topMetrics: [],
      shareStatistics: {
        formattedTotalContributions: "0",
        topLanguageName: null,
        longestStreakDays: 0,
        globalRankPercentage: 1,
      },
      milestones: [],
    },
    availability: {
      contributions: availableMeasured(),
      commitTimestamps: unavailable("no_commit_timestamps"),
      codingHours: unavailable("no_commit_timestamps"),
      pullRequests: availableMeasured(),
      issues: availableMeasured(),
      organizations: availableMeasured(),
      languages: unavailable("no_language_bytes"),
      repositories: availableMeasured(),
      peakDayRepository: unavailable("empty_result"),
    },
  };

  return { ...base, ...overrides };
}

export function moderateAnalytics(): AnalyticsResult {
  return baseAnalytics({
    overview: {
      ...baseAnalytics().overview,
      totalContributions: 86,
      totalCommits: 60,
      totalRepositories: 4,
      totalPullRequests: 6,
    },
    productivity: {
      ...baseAnalytics().productivity,
      mostProductiveDay: { date: "2026-04-02", count: 5 },
      averageContributionsPerDay: 0.24,
      averageContributionsPerWeek: 1.6,
      productivityTrend: "STABLE",
      contributionMomentum: 1,
    },
    consistency: {
      ...baseAnalytics().consistency,
      longestStreak: 9,
      longestStreakStartDate: "2026-03-01",
      longestStreakEndDate: "2026-03-09",
      activeDaysCount: 40,
      activeDaysRatio: 0.11,
      averageWeeklyConsistency: 30,
    },
    languages: {
      ...baseAnalytics().languages,
      favoriteLanguage: {
        name: "TypeScript",
        color: "#3178c6",
        totalBytes: 12000,
        percentage: 55,
      },
      languageDistribution: [
        { name: "TypeScript", color: "#3178c6", totalBytes: 12000, percentage: 55, repositoryCount: 2 },
        { name: "JavaScript", color: "#f1e05a", totalBytes: 9800, percentage: 45, repositoryCount: 2 },
      ],
    },
    repositories: {
      ...baseAnalytics().repositories,
      mostActiveRepository: { name: "notes", commitCount: 18 },
    },
    availability: {
      ...baseAnalytics().availability,
      languages: availableMeasured(),
    },
  });
}

export function richAnalytics(): AnalyticsResult {
  return baseAnalytics({
    overview: {
      ...baseAnalytics().overview,
      totalContributions: 420,
      totalCommits: 300,
      totalRepositories: 12,
      totalStarsEarned: 40,
      totalForks: 12,
      totalPullRequests: 28,
    },
    productivity: {
      mostProductiveDay: { date: "2026-09-14", count: 27 },
      mostProductiveWeek: { weekStartDate: "2026-W37", count: 48 },
      mostProductiveMonth: { monthIndex: 8, monthName: "September", count: 90 },
      averageContributionsPerDay: 1.15,
      averageContributionsPerWeek: 8,
      averageContributionsPerMonth: 35,
      peakContributionDay: { date: "2026-09-14", count: 27, repositoryPath: "octocat/hello-world" },
      quietestMonth: { monthIndex: 0, monthName: "January", count: 4 },
      productivityTrend: "UPWARD",
      contributionMomentum: 2.4,
    },
    consistency: {
      longestStreak: 18,
      longestStreakStartDate: "2026-03-01",
      longestStreakEndDate: "2026-03-18",
      currentStreak: 0,
      currentStreakStartDate: null,
      averageWeeklyConsistency: 62,
      averageMonthlyConsistency: 90,
      activeDaysCount: 120,
      activeDaysRatio: 0.8,
      missedDaysCount: 245,
      consecutiveActiveWeeks: 8,
      consistencyScore: score(72),
    },
    activity: {
      ...baseAnalytics().activity,
      pullRequests: {
        opened: 28,
        merged: 22,
        closed: 4,
        mergeRate: 0.786,
        biggestPullRequest: null,
      },
      timeAnalysis: {
        mostActiveHour: 23,
        nightOwlScore: score(48),
        earlyBirdScore: score(8),
        weekendActivity: 22,
        weekdayActivity: 78,
        preferredCodingSession: "NIGHT",
      },
    },
    languages: {
      favoriteLanguage: {
        name: "TypeScript",
        color: "#3178c6",
        totalBytes: 80000,
        percentage: 72,
      },
      languageDiversityScore: score(80),
      languageDistribution: [
        { name: "TypeScript", color: "#3178c6", totalBytes: 80000, percentage: 72, repositoryCount: 8 },
        { name: "JavaScript", color: "#f1e05a", totalBytes: 20000, percentage: 18, repositoryCount: 4 },
        { name: "Go", color: "#00add8", totalBytes: 11000, percentage: 10, repositoryCount: 2 },
      ],
      languageEvolution: [
        { year: 2024, primaryLanguage: "JavaScript", bytesAdded: 40000 },
        { year: 2026, primaryLanguage: "TypeScript", bytesAdded: 80000 },
      ],
      newLanguagesLearned: ["Go"],
      dormantLanguages: [],
    },
    repositories: {
      favoriteRepository: {
        name: "hello-world",
        ownerName: "octocat",
        starCount: 12,
        url: "https://github.com/octocat/hello-world",
      },
      fastestGrowingRepository: { name: "hello-world", starGrowth: 0.1 },
      mostActiveRepository: { name: "hello-world", commitCount: 210 },
      oldestActiveRepository: { name: "hello-world", ageDays: 4000 },
      newestRepository: { name: "new-app", createdAt: "2026-02-01T00:00:00.000Z" },
      repositoryGrowthTimeline: [],
    },
    organizations: {
      organizationContributionsCount: 2,
      mostActiveOrganization: {
        handle: "github",
        displayName: "GitHub",
        avatarUrl: "https://avatars.githubusercontent.com/u/9919?v=4",
        repositoryCount: 100,
      },
      organizationList: [
        { handle: "github", displayName: "GitHub", memberCount: 10, repositoryCount: 100 },
      ],
    },
    timeline: emptyTimeline(2026, [
      ...Array.from({ length: 20 }, (_, index) => ({
        date: `2026-01-${String(index + 1).padStart(2, "0")}`,
        count: 1,
      })),
      ...Array.from({ length: 21 }, (_, index) => ({
        date: `2026-06-${String(index + 1).padStart(2, "0")}`,
        count: 0,
      })),
      { date: "2026-06-22", count: 6 },
      { date: "2026-06-23", count: 6 },
      { date: "2026-06-24", count: 6 },
      { date: "2026-09-14", count: 27 },
    ]),
    availability: {
      contributions: availableMeasured(),
      commitTimestamps: availableMeasured(),
      codingHours: availableMeasured(),
      pullRequests: availableMeasured(),
      issues: availableMeasured(),
      organizations: availableMeasured(),
      languages: availableMeasured(),
      repositories: availableMeasured(),
      peakDayRepository: availableMeasured(),
    },
  });
}
