// ---------------------------------------------------------------------------
// GraphQL Queries — Barrel Export
// ---------------------------------------------------------------------------
// This is the single import point for all GraphQL query strings and
// their co-located TypeScript interfaces.
//
// Import from "@/sdk/github/queries" — never from individual query files.
// This allows query files to be reorganised without breaking services.
//
// Query modules:
//   user.ts          → User identity (profile, avatar, bio, counts)
//   repositories.ts  → Owned public repository list with metadata
//   contributions.ts → Annual contribution calendar and summaries
//   languages.ts     → Portfolio language byte distribution
//   organizations.ts → Public organisation memberships
//   pullRequests.ts  → Authored pull requests with code change metrics
//   issues.ts        → Authored issues with engagement metrics
//   commits.ts       → Per-repository commit history
//   achievements.ts  → Raw signals for achievement computation
//   rateLimit.ts     → API rate limit health check
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------
export {
  GET_USER_PROFILE,
  type GetUserProfileVariables,
  type GetUserProfileData,
} from "./user";

// ---------------------------------------------------------------------------
// Repositories
// ---------------------------------------------------------------------------
export {
  GET_USER_REPOSITORIES,
  type GetUserRepositoriesVariables,
  type GetUserRepositoriesData,
  type RepositoryNode,
} from "./repositories";

// ---------------------------------------------------------------------------
// Contributions
// ---------------------------------------------------------------------------
export {
  GET_USER_CONTRIBUTIONS,
  type GetUserContributionsVariables,
  type GetUserContributionsData,
  type ContributionLevel,
} from "./contributions";

// ---------------------------------------------------------------------------
// Languages
// ---------------------------------------------------------------------------
export {
  GET_USER_LANGUAGE_STATS,
  type GetUserLanguageStatsVariables,
  type GetUserLanguageStatsData,
  type LanguageStatsRepositoryNode,
} from "./languages";

// ---------------------------------------------------------------------------
// Organisations
// ---------------------------------------------------------------------------
export {
  GET_USER_ORGANIZATIONS,
  type GetUserOrganizationsVariables,
  type GetUserOrganizationsData,
  type OrganizationNode,
} from "./organizations";

// ---------------------------------------------------------------------------
// Pull Requests
// ---------------------------------------------------------------------------
export {
  GET_USER_PULL_REQUESTS,
  type GetUserPullRequestsVariables,
  type GetUserPullRequestsData,
  type PullRequestNode,
} from "./pullRequests";

// ---------------------------------------------------------------------------
// Issues
// ---------------------------------------------------------------------------
export {
  GET_USER_ISSUES,
  type GetUserIssuesVariables,
  type GetUserIssuesData,
  type IssueNode,
} from "./issues";

// ---------------------------------------------------------------------------
// Commits
// ---------------------------------------------------------------------------
export {
  GET_REPOSITORY_COMMITS,
  type GetRepositoryCommitsVariables,
  type GetRepositoryCommitsData,
  type CommitNode,
} from "./commits";

// ---------------------------------------------------------------------------
// Achievements
// ---------------------------------------------------------------------------
export {
  GET_USER_ACHIEVEMENT_SIGNALS,
  type GetUserAchievementSignalsVariables,
  type GetUserAchievementSignalsData,
} from "./achievements";

// ---------------------------------------------------------------------------
// Rate Limit
// ---------------------------------------------------------------------------
export {
  GET_RATE_LIMIT,
  type GetRateLimitData,
} from "./rateLimit";
