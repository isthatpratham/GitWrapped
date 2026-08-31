import type { Commit, Issue, PullRequest, RepositoryCommitActivity } from "@/domain/models";
import type { AnalyticsExternalContributions } from "@/services/analytics/analytics.types";

function ownerFromPath(path: string): string {
  const slash = path.indexOf("/");
  return (slash > 0 ? path.slice(0, slash) : path).toLowerCase();
}

export function isExternalRepositoryPath(path: string | null | undefined, handle: string): boolean {
  if (!path || !handle) return false;
  return ownerFromPath(path) !== handle.toLowerCase();
}

export function calculateExternalContributions(
  handle: string,
  commits: ReadonlyArray<Commit>,
  pullRequests: ReadonlyArray<PullRequest>,
  issues: ReadonlyArray<Issue>,
  repositoryActivity: ReadonlyArray<RepositoryCommitActivity>,
): AnalyticsExternalContributions {
  const counts = new Map<string, number>();

  let pullRequestCount = 0;
  for (const pullRequest of pullRequests) {
    const path = pullRequest.targetRepositoryPath;
    if (!isExternalRepositoryPath(path, handle) || !path) continue;
    pullRequestCount += 1;
    counts.set(path, (counts.get(path) ?? 0) + 2);
  }

  let commitCount = 0;
  for (const commit of commits) {
    if (!isExternalRepositoryPath(commit.repositoryPath, handle)) continue;
    commitCount += 1;
    counts.set(commit.repositoryPath, (counts.get(commit.repositoryPath) ?? 0) + 1);
  }

  if (commitCount === 0) {
    for (const activity of repositoryActivity) {
      if (!isExternalRepositoryPath(activity.repositoryPath, handle)) continue;
      commitCount += activity.commitCount;
      counts.set(activity.repositoryPath, (counts.get(activity.repositoryPath) ?? 0) + activity.commitCount);
    }
  }

  let issueCount = 0;
  for (const issue of issues) {
    if (!isExternalRepositoryPath(issue.repositoryPath, handle)) continue;
    issueCount += 1;
    counts.set(issue.repositoryPath, (counts.get(issue.repositoryPath) ?? 0) + 1);
  }

  let featuredRepositoryPath: string | null = null;
  let featuredScore = 0;
  for (const [path, score] of counts) {
    if (score > featuredScore || (score === featuredScore && featuredRepositoryPath !== null && path < featuredRepositoryPath)) {
      featuredRepositoryPath = path;
      featuredScore = score;
    }
  }

  return {
    pullRequestCount,
    commitCount,
    issueCount,
    uniqueRepositoryCount: counts.size,
    featuredRepositoryPath,
  };
}
