"use server";

import {
  fetchAnnualData,
  getRecapYear,
  GitHubInvalidUsernameError,
  GitHubUserNotFoundError,
  GitHubResponseValidationError,
  isGitHubAuthenticationError,
  isGitHubRateLimitError,
  isGitHubSDKError,
} from "@/sdk/github";
import {
  mapGitHubUserToUserProfile,
  mapGitHubRepositoryToRepository,
  mapGitHubContributionsToContributionHistory,
  mapGitHubPullRequestToPullRequest,
  mapGitHubIssueToIssue,
  mapGitHubOrganizationToOrganization,
  mapGitHubCommitToCommit,
} from "@/sdk/github/mapper";
import { generateRecapAnalytics } from "@/services/analytics";
import { generateStoryDeck } from "@/services/story";
import type { Story } from "@/services/story";
import { toFetchStatus } from "@/domain/models";

const SAFE_ERROR = {
  invalidUsername: "INVALID_USERNAME",
  userNotFound: "USER_NOT_FOUND",
  rateLimit: "RATE_LIMIT",
  authFailed: "AUTH_FAILED",
  malformedResponse: "MALFORMED_RESPONSE",
  fetchFailed: "FETCH_FAILED",
} as const;

function recapError(code: string): Error {
  const error = new Error(code);
  error.name = "RecapLoadError";
  return error;
}

function mapLoadError(error: unknown): Error {
  if (error instanceof GitHubInvalidUsernameError) {
    return recapError(SAFE_ERROR.invalidUsername);
  }
  if (error instanceof GitHubUserNotFoundError) {
    return recapError(SAFE_ERROR.userNotFound);
  }
  if (isGitHubRateLimitError(error)) {
    return recapError(SAFE_ERROR.rateLimit);
  }
  if (isGitHubAuthenticationError(error)) {
    return recapError(SAFE_ERROR.authFailed);
  }
  if (error instanceof GitHubResponseValidationError) {
    return recapError(SAFE_ERROR.malformedResponse);
  }
  if (isGitHubSDKError(error)) {
    return recapError(SAFE_ERROR.fetchFailed);
  }
  return recapError(SAFE_ERROR.fetchFailed);
}

export async function getWrappedStoryDeck(username: string): Promise<Story> {
  try {
    const year = getRecapYear();
    const rawData = await fetchAnnualData({ username, year });

    const analytics = generateRecapAnalytics({
      user: mapGitHubUserToUserProfile(rawData.user),
      contributions: mapGitHubContributionsToContributionHistory(rawData.contributions),
      repositories: rawData.repositories.map(mapGitHubRepositoryToRepository),
      pullRequests: rawData.pullRequests.map(mapGitHubPullRequestToPullRequest),
      issues: rawData.issues.map(mapGitHubIssueToIssue),
      organizations: rawData.organizations.map(mapGitHubOrganizationToOrganization),
      commits: rawData.commits.map(mapGitHubCommitToCommit),
      year,
      sources: {
        pullRequests: toFetchStatus(rawData.sources.pullRequests),
        issues: toFetchStatus(rawData.sources.issues),
        organizations: toFetchStatus(rawData.sources.organizations),
        commits: toFetchStatus(rawData.sources.commits),
        repositories: toFetchStatus(rawData.sources.repositories),
      },
    });

    return generateStoryDeck(analytics);
  } catch (error) {
    throw mapLoadError(error);
  }
}
