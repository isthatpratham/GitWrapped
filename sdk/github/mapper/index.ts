// ---------------------------------------------------------------------------
// Mappers Barrel Export
// ---------------------------------------------------------------------------
// Re-exports all GitHub SDK to Domain mappers.
// Consumers import from "@/sdk/github/mapper" — never from individual files.
// ---------------------------------------------------------------------------

export { mapGitHubUserToUserProfile } from "./user.mapper";

export { mapGitHubRepositoryToRepository } from "./repository.mapper";

export { mapGitHubContributionsToContributionHistory } from "./contribution.mapper";

export { mapGitHubOrganizationToOrganization } from "./organization.mapper";

export {
  mapGitHubLabelToActivityLabel,
  mapGitHubPullRequestToPullRequest,
  mapGitHubIssueToIssue,
  mapGitHubCommitToCommit,
} from "./activity.mapper";
