// ---------------------------------------------------------------------------
// Domain Models — Barrel Export
// ---------------------------------------------------------------------------
// Import domain models from "@/domain/models" — never from individual files.
// This allows model files to be reorganised without breaking consumers.
// ---------------------------------------------------------------------------

// Availability
export type {
  DataAvailability,
  FetchStatus,
  UnavailabilityReason,
} from "./availability";
export {
  UNAVAILABILITY_REASONS,
  availableMeasured,
  availableEstimated,
  unavailable,
  notCalculated,
  isAvailable,
  isUnavailabilityReason,
  toFetchStatus,
} from "./availability";

// User
export type { UserProfile } from "./user";

// Repository
export type {
  Repository,
  RepositoryLanguage,
  RepositoryLanguageUsage,
  RepositoryTopic,
  RepositoryVisibility,
} from "./repository";

// Contribution
export type {
  ContributionHistory,
  ContributionCalendar,
  ContributionWeek,
  ContributionDay,
  ContributionIntensity,
  RepositoryCommitActivity,
  PeakContributionDay,
} from "./contribution";

// Language
export type {
  LanguageProfile,
  LanguageUsage,
} from "./language";

// Organization
export type { Organization } from "./organization";

// Activity
export type {
  PullRequest,
  PullRequestStatus,
  Issue,
  IssueStatus,
  Commit,
  ActivityLabel,
} from "./activity";

// Analytics (output of Analytics Engine)
export type {
  AnnualAnalytics,
  ContributionAnalytics,
  RepositoryAnalytics,
  LanguageAnalytics,
  LanguageAnalyticsEntry,
  PullRequestAnalytics,
  IssueAnalytics,
  AchievementAnalytics,
  Achievement,
  CommunityAnalytics,
  StreakAnalytics,
  DayOfWeekActivity,
  HourOfDayActivity,
} from "./analytics";

// Story (output of Story Engine)
export type {
  StoryDeck,
  Slide,
  SlideKind,
  StoryStat,
  StoryHighlight,
  // Individual slide types (for renderers that need the specific shape)
  IntroSlide,
  ContributionHeatmapSlide,
  StreakSlide,
  TopLanguageSlide,
  LanguageBreakdownSlide,
  RepositoriesSlide,
  PullRequestsSlide,
  IssuesSlide,
  CommunitySlide,
  AchievementsSlide,
  PeakDaySlide,
  CodingScheduleSlide,
  OutroSlide,
} from "./story";
