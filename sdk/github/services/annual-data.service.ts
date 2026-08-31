import type { GitHubAnnualData, FetchAnnualDataOptions, GitHubDataSourceStatus } from "../types";
import {
  GitHubUserNotFoundError,
  isGitHubAuthenticationError,
  isGitHubRateLimitError,
} from "../errors";
import { parseGitHubUsername } from "../username";
import { GitHubInvalidUsernameError } from "../errors";
import { fetchUserProfile, getRecapYear } from "./user.service";
import {
  applyCommitAttributionToContributions,
  fetchUserContributions,
} from "./contributions.service";
import { fetchUserRepositories } from "./repositories.service";
import { fetchUserPullRequests } from "./pull-requests.service";
import { fetchUserIssues } from "./issues.service";
import { fetchUserOrganizations } from "./organizations.service";
import { fetchUserCommitsForRepositories } from "./commits.service";

const FETCHED: GitHubDataSourceStatus = { status: "fetched" };

async function fetchOptional<T>(
  loader: () => Promise<T>,
  fallback: T,
): Promise<{ data: T; status: GitHubDataSourceStatus }> {
  try {
    const data = await loader();
    return { data, status: FETCHED };
  } catch (error) {
    if (error instanceof GitHubUserNotFoundError) throw error;
    if (isGitHubAuthenticationError(error) || isGitHubRateLimitError(error)) throw error;
    return { data: fallback, status: { status: "unavailable", reason: "fetch_failed" } };
  }
}

export async function fetchAnnualData(
  options: FetchAnnualDataOptions,
): Promise<GitHubAnnualData> {
  let username: string;
  try {
    username = parseGitHubUsername(options.username);
  } catch {
    throw new GitHubInvalidUsernameError(options.username);
  }

  const { year } = options;

  const user = await fetchUserProfile(username);

  const [contributions, repositoriesResult, pullRequestsResult] = await Promise.all([
    fetchUserContributions(username, year),
    fetchOptional(() => fetchUserRepositories(username), []),
    fetchOptional(() => fetchUserPullRequests(username, year), []),
  ]);

  const [issuesResult, organizationsResult] = await Promise.all([
    fetchOptional(() => fetchUserIssues(username, year), []),
    fetchOptional(() => fetchUserOrganizations(username), []),
  ]);

  const commitPaths = Array.from(
    new Set(
      [
        ...contributions.repositoryActivity.map((item) => item.repositoryPath),
        ...pullRequestsResult.data.map((pullRequest) => pullRequest.baseRepository?.nameWithOwner),
        ...issuesResult.data.map((issue) => issue.repository.nameWithOwner),
      ].filter((path): path is string => Boolean(path)),
    ),
  );
  let commits: GitHubAnnualData["commits"] = [];
  let commitsStatus: GitHubDataSourceStatus = { status: "unavailable", reason: "no_commit_timestamps" };

  if (user.id && commitPaths.length > 0) {
    try {
      const result = await fetchUserCommitsForRepositories({
        authorId: user.id,
        repositoryPaths: commitPaths,
        year,
      });
      commits = result.commits;
      if (result.partial && result.commits.length > 0) {
        commitsStatus = { status: "partial", reason: "insufficient_data" };
      } else if (result.commits.length > 0) {
        commitsStatus = FETCHED;
      } else {
        commitsStatus = { status: "fetched" };
      }
    } catch (error) {
      if (error instanceof GitHubUserNotFoundError) throw error;
      if (isGitHubAuthenticationError(error) || isGitHubRateLimitError(error)) throw error;
      commitsStatus = { status: "unavailable", reason: "fetch_failed" };
    }
  } else if (commitPaths.length === 0) {
    commitsStatus = FETCHED;
  }

  const attributedContributions = applyCommitAttributionToContributions(
    contributions,
    commits,
    pullRequestsResult.data,
    issuesResult.data,
  );

  return {
    user,
    contributions: attributedContributions,
    repositories: repositoriesResult.data,
    pullRequests: pullRequestsResult.data,
    issues: issuesResult.data,
    organizations: organizationsResult.data,
    commits,
    achievementSignals: {
      login: user.login,
      followers: user.followers,
      following: user.following,
      publicRepositoryCount: user.publicRepos,
      starredRepositoryCount: 0,
      publicGistCount: 0,
      packageCount: 0,
      sponsoringCount: 0,
      sponsorCount: 0,
      totalMergedPullRequests: 0,
      totalIssues: 0,
    },
    sources: {
      pullRequests: pullRequestsResult.status,
      issues: issuesResult.status,
      organizations: organizationsResult.status,
      commits: commitsStatus,
      repositories: repositoriesResult.status,
    },
    year,
    fetchedAt: new Date().toISOString(),
  };
}

export async function fetchCurrentYearData(username: string): Promise<GitHubAnnualData> {
  return fetchAnnualData({ username, year: getRecapYear() });
}
