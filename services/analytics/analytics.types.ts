// ---------------------------------------------------------------------------
// Analytics Engine — Types
// ---------------------------------------------------------------------------
// Defines the input structures and detailed analytics output types for the
// Analytics Engine. All properties are readonly to ensure immutability.
// ---------------------------------------------------------------------------

import type {
  UserProfile,
  Repository,
  ContributionHistory,
  Organization,
  PullRequest,
  Issue,
  Commit,
  DataAvailability,
  FetchStatus,
} from "@/domain/models";

/**
 * Combined input payload containing normalized domain models plus fetch
 * provenance. Empty arrays are only meaningful when the matching source
 * status is `fetched` or `partial`.
 */
export interface AnalyticsEngineInput {
  readonly user: UserProfile;
  readonly contributions: ContributionHistory;
  readonly repositories: ReadonlyArray<Repository>;
  readonly pullRequests: ReadonlyArray<PullRequest>;
  readonly issues: ReadonlyArray<Issue>;
  readonly organizations: ReadonlyArray<Organization>;
  readonly commits: ReadonlyArray<Commit>;
  readonly year: number;
  readonly sources: {
    readonly pullRequests: FetchStatus;
    readonly issues: FetchStatus;
    readonly organizations: FetchStatus;
    readonly commits: FetchStatus;
    readonly repositories: FetchStatus;
  };
}

export const FETCHED_ANALYTICS_SOURCES: AnalyticsEngineInput["sources"] = {
  pullRequests: { status: "fetched" },
  issues: { status: "fetched" },
  organizations: { status: "fetched" },
  commits: { status: "fetched" },
  repositories: { status: "fetched" },
};

// ---------------------------------------------------------------------------
// Scoring Sub-types
// ---------------------------------------------------------------------------

export interface NormalizedScore {
  readonly value: number;
  readonly maximum: number;
  readonly percentage: number;
  readonly description: string;
}

// ---------------------------------------------------------------------------
// Output Structure Sections
// ---------------------------------------------------------------------------

export interface AnalyticsOverview {
  readonly totalContributions: number;
  readonly totalCommits: number;
  readonly totalRepositories: number;
  readonly totalStarsEarned: number;
  readonly totalForks: number;
  readonly totalPullRequests: number;
  readonly totalIssues: number;
  readonly scores: {
    readonly activity: NormalizedScore;
    readonly consistency: NormalizedScore;
    readonly repository: NormalizedScore;
    readonly languageDiversity: NormalizedScore;
    readonly growth: NormalizedScore;
    readonly productivity: NormalizedScore;
  };
}

export interface AnalyticsProductivity {
  readonly mostProductiveDay: {
    readonly date: string;
    readonly count: number;
  } | null;
  readonly mostProductiveWeek: {
    readonly weekStartDate: string;
    readonly count: number;
  } | null;
  readonly mostProductiveMonth: {
    readonly monthIndex: number; // 0-11
    readonly monthName: string;
    readonly count: number;
  } | null;
  readonly averageContributionsPerDay: number;
  readonly averageContributionsPerWeek: number;
  readonly averageContributionsPerMonth: number;
  readonly peakContributionDay: {
    readonly date: string;
    readonly count: number;
    readonly repositoryPath: string | null;
  } | null;
  readonly quietestMonth: {
    readonly monthIndex: number;
    readonly monthName: string;
    readonly count: number;
  } | null;
  readonly productivityTrend: "UPWARD" | "DOWNWARD" | "STABLE";
  readonly contributionMomentum: number; // rate of change in last quarter vs first quarter
}

export interface AnalyticsConsistency {
  readonly longestStreak: number;
  readonly longestStreakStartDate: string | null;
  readonly longestStreakEndDate: string | null;
  readonly currentStreak: number;
  readonly currentStreakStartDate: string | null;
  readonly averageWeeklyConsistency: number; // % of recap-year weeks with at least 1 contribution
  readonly averageMonthlyConsistency: number; // % of months with at least 1 contribution
  /**
   * Count of recap-year calendar days with at least one contribution.
   * Zero is a valid measured value.
   */
  readonly activeDaysCount: number;
  /**
   * `activeDaysCount / targetActiveDays` clamped to 1.
   * Canonical meaning: share of the 150-day activity target, not weekly ratio.
   */
  readonly activeDaysRatio: number;
  readonly missedDaysCount: number;
  readonly consecutiveActiveWeeks: number;
  readonly consistencyScore: NormalizedScore;
}

export interface AnalyticsActivity {
  readonly commits: {
    readonly totalCount: number;
    readonly averageLinesPerCommit: number;
    readonly biggestCommit: {
      readonly sha: string;
      readonly summary: string;
      readonly linesAdded: number;
      readonly linesDeleted: number;
      readonly authoredAt: string;
    } | null;
    readonly commitMessageQualityScore: number | null; // null when there are no commits to score
  };
  readonly pullRequests: {
    readonly opened: number;
    readonly merged: number;
    readonly closed: number;
    readonly mergeRate: number;
    readonly biggestPullRequest: {
      readonly id: string;
      readonly title: string;
      readonly totalLinesChanged: number;
      readonly url: string;
    } | null;
  };
  readonly issues: {
    readonly opened: number;
    readonly closed: number;
    readonly closeRate: number;
    readonly mostReactedIssue: {
      readonly id: string;
      readonly title: string;
      readonly reactions: number;
      readonly url: string;
    } | null;
  };
  readonly timeAnalysis: {
    /** UTC hour 0–23. Null when no commit timestamps were available. */
    readonly mostActiveHour: number | null;
    readonly nightOwlScore: NormalizedScore | null;
    readonly earlyBirdScore: NormalizedScore | null;
    /** Percentage of timed commits on Sat/Sun. Null without timestamps. */
    readonly weekendActivity: number | null;
    readonly weekdayActivity: number | null;
    readonly preferredCodingSession: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT" | null;
  };
}

export interface AnalyticsLanguages {
  readonly favoriteLanguage: {
    readonly name: string;
    readonly color: string | null;
    readonly totalBytes: number;
    readonly percentage: number;
  } | null;
  readonly languageDiversityScore: NormalizedScore;
  readonly languageDistribution: ReadonlyArray<{
    readonly name: string;
    readonly color: string | null;
    readonly totalBytes: number;
    readonly percentage: number;
    readonly repositoryCount: number;
  }>;
  readonly languageEvolution: ReadonlyArray<{
    readonly year: number;
    readonly primaryLanguage: string;
    readonly bytesAdded: number;
  }>;
  readonly newLanguagesLearned: ReadonlyArray<string>;
  readonly dormantLanguages: ReadonlyArray<string>; // languages used in past years but not active this year
}

export interface PeakDayRepositoryHighlight {
  readonly name: string;
  readonly ownerName: string;
  /** Stars for this repository only. Null when the peak-day path is not in the user's repository list. */
  readonly starCount: number | null;
  readonly url: string | null;
}

export interface AnalyticsRepositories {
  /**
   * Repository with the highest star count among the user's public repositories.
   * This is not the peak-day repository and must not be substituted for it.
   */
  readonly favoriteRepository: {
    readonly name: string;
    readonly ownerName: string;
    readonly starCount: number;
    readonly url: string;
  } | null;
  /**
   * Repository responsible for peak-day attributed commits (`contributions.peakDay.repositoryPath`).
   * Identity and metadata come only from that path (and that repository's own record when present).
   */
  readonly peakDayRepository: PeakDayRepositoryHighlight | null;
  readonly fastestGrowingRepository: {
    readonly name: string;
    readonly starGrowth: number;
  } | null;
  readonly mostActiveRepository: {
    readonly name: string;
    readonly commitCount: number;
  } | null;
  readonly oldestActiveRepository: {
    readonly name: string;
    readonly ageDays: number;
  } | null;
  readonly newestRepository: {
    readonly name: string;
    readonly createdAt: string;
  } | null;
  readonly repositoryGrowthTimeline: ReadonlyArray<{
    readonly date: string;
    readonly totalStars: number;
  }>;
}

export interface AnalyticsOrganizations {
  readonly organizationContributionsCount: number;
  readonly mostActiveOrganization: {
    readonly handle: string;
    readonly displayName: string | null;
    readonly avatarUrl: string;
    readonly repositoryCount: number;
  } | null;
  readonly organizationList: ReadonlyArray<{
    readonly handle: string;
    readonly displayName: string | null;
    readonly memberCount: number;
    readonly repositoryCount: number;
  }>;
}

export interface AnalyticsAchievement {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly tier: "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";
  readonly unlockedAt: string;
}

export interface AnalyticsAchievements {
  readonly unlockedList: ReadonlyArray<AnalyticsAchievement>;
  readonly count: number;
}

export interface TimelineDataPoint {
  readonly date: string; // YYYY-MM-DD or YYYY-WW or YYYY-MM or YYYY-QQ
  readonly commitCount: number;
  readonly pullRequestCount: number;
  readonly issueCount: number;
  readonly reviewCount: number;
  readonly totalContributions: number;
}

export interface AnalyticsTimeline {
  readonly daily: ReadonlyArray<TimelineDataPoint>;
  readonly weekly: ReadonlyArray<TimelineDataPoint>;
  readonly monthly: ReadonlyArray<TimelineDataPoint>;
  readonly quarterly: ReadonlyArray<TimelineDataPoint>;
  readonly yearly: TimelineDataPoint;
}

export interface AnalyticsSummary {
  readonly highlights: ReadonlyArray<string>;
  readonly bestMoments: ReadonlyArray<{
    readonly title: string;
    readonly value: string;
    readonly subtitle: string;
  }>;
  readonly interestingFacts: ReadonlyArray<string>;
  readonly topMetrics: ReadonlyArray<{
    readonly name: string;
    readonly value: string | number;
  }>;
  readonly shareStatistics: {
    readonly formattedTotalContributions: string;
    readonly topLanguageName: string | null;
    readonly longestStreakDays: number;
    readonly globalRankPercentage: number;
  };
  readonly milestones: ReadonlyArray<{
    readonly title: string;
    readonly reachedAt: string;
  }>;
}

// ---------------------------------------------------------------------------
// Canonical analytics snapshot
// ---------------------------------------------------------------------------

export interface AnalyticsAvailability {
  readonly contributions: DataAvailability;
  readonly commitTimestamps: DataAvailability;
  readonly codingHours: DataAvailability;
  readonly pullRequests: DataAvailability;
  readonly issues: DataAvailability;
  readonly organizations: DataAvailability;
  readonly languages: DataAvailability;
  readonly repositories: DataAvailability;
  readonly peakDayRepository: DataAvailability;
}

// ---------------------------------------------------------------------------
// Unified Output Object
// ---------------------------------------------------------------------------

export interface AnalyticsResult {
  readonly year: number;
  readonly computedAt: string;
  readonly user: {
    readonly handle: string;
    readonly displayName: string | null;
    readonly avatarUrl: string;
    readonly accountCreatedAt: string;
  };
  readonly overview: AnalyticsOverview;
  readonly productivity: AnalyticsProductivity;
  readonly consistency: AnalyticsConsistency;
  readonly activity: AnalyticsActivity;
  readonly languages: AnalyticsLanguages;
  readonly repositories: AnalyticsRepositories;
  readonly organizations: AnalyticsOrganizations;
  readonly achievements: AnalyticsAchievements;
  readonly timeline: AnalyticsTimeline;
  readonly summary: AnalyticsSummary;
  readonly availability: AnalyticsAvailability;
}
