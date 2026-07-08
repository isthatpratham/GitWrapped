// ---------------------------------------------------------------------------
// Services barrel export
// ---------------------------------------------------------------------------
// Re-exports all service functions from the GitHub SDK services layer.
// Consumers import from "@/sdk/github/services" — never from individual files.
// ---------------------------------------------------------------------------

export {
  fetchAnnualData,
  fetchCurrentYearData,
} from "./annual-data.service";

export {
  generateMockAnnualData,
} from "./mock-data";

// User
export {
  fetchUserProfile,
  userExists,
  getYearDateRange,
  getRecapYear,
} from "./user.service";

// Contributions
export {
  fetchUserContributions,
  flattenContributionDays,
} from "./contributions.service";

// Repositories
export { fetchUserRepositories } from "./repositories.service";

// Pull Requests
export { fetchUserPullRequests } from "./pull-requests.service";

// Rate Limit
export {
  fetchRateLimit,
  hasSufficientRateLimit,
} from "./rate-limit.service";
