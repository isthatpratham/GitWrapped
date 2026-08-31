// ---------------------------------------------------------------------------
// GitHub SDK — Public API
// ---------------------------------------------------------------------------
// This is the single import point for all GitHub SDK consumers.
// Import from "@/sdk/github" — never from internal SDK modules.
//
// Usage examples:
//
//   import { fetchAnnualData, GitHubUserNotFoundError } from "@/sdk/github";
//   import type { GitHubAnnualData, GitHubOrganization } from "@/sdk/github";
//
// ---------------------------------------------------------------------------

// Configuration is server-only. Do not re-export githubConfig from this
// barrel — it contains the PAT. Import config only from server modules.
export { parseGitHubUsername, githubUsernameSchema } from "./username";
export { selectPeakContributionDay, attributePeakDayRepository, peakDayEventsFromSources } from "./peak-day";
// Error classes and type guards
export {
  GitHubSDKError,
  GitHubNetworkError,
  GitHubTimeoutError,
  GitHubHttpError,
  GitHubAuthenticationError,
  GitHubForbiddenError,
  GitHubRateLimitError,
  GitHubGraphQLError,
  GitHubUserNotFoundError,
  GitHubInvalidUsernameError,
  GitHubResponseValidationError,
  isGitHubSDKError,
  isGitHubRateLimitError,
  isGitHubAuthenticationError,
  type GraphQLErrorDetail,
} from "./errors";

// Shared types (raw API shapes and SDK contracts)
export type {
  // GraphQL plumbing
  GraphQLResponse,
  GraphQLRequestOptions,
  // User
  GitHubUserProfile,
  // Contributions
  ContributionDay,
  ContributionWeek,
  ContributionCalendar,
  ContributionCollection,
  // Repositories & Languages
  RepositoryLanguage,
  RepositoryLanguageEdge,
  RepositoryLanguages,
  GitHubRepository,
  // Pull Requests
  PullRequestState,
  GitHubPullRequest,
  // Issues
  IssueState,
  GitHubIssue,
  // Shared
  GitHubLabel,
  // Commits
  GitHubCommit,
  // Organizations
  GitHubOrganization,
  // Achievement Signals
  GitHubAchievementSignals,
  // Pagination
  PageInfo,
  // Rate Limit
  GitHubRateLimit,
  // Service contracts
  GitHubAnnualData,
  GitHubDataSourceStatus,
  FetchAnnualDataOptions,
} from "./types";

// Service functions (primary SDK API)
export {
  fetchAnnualData,
  fetchCurrentYearData,
  fetchUserProfile,
  fetchUserContributions,
  fetchUserRepositories,
  fetchUserPullRequests,
  fetchUserIssues,
  fetchUserOrganizations,
  fetchUserCommitsForRepositories,
  userExists,
  getYearDateRange,
  getRecapYear,
  flattenContributionDays,
  fetchRateLimit,
  hasSufficientRateLimit,
} from "./services";

// Low-level client stays internal to the SDK. Callers use fetchAnnualData.