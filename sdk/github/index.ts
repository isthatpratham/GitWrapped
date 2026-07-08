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

// Configuration
export { githubConfig } from "./config";

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
  FetchAnnualDataOptions,
} from "./types";

// Service functions (primary SDK API)
export {
  // Primary entry points
  fetchAnnualData,
  fetchCurrentYearData,
  generateMockAnnualData,
  // Individual data fetchers
  fetchUserProfile,
  fetchUserContributions,
  fetchUserRepositories,
  fetchUserPullRequests,
  // Utilities
  userExists,
  getYearDateRange,
  getRecapYear,
  flattenContributionDays,
  // Rate limit
  fetchRateLimit,
  hasSufficientRateLimit,
} from "./services";

// Low-level client (for advanced use cases or testing)
export { executeQuery } from "./client";
