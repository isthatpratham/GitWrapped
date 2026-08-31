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

function addScore(scores: Map<string, number>, path: string, amount: number): void {
  scores.set(path, (scores.get(path) ?? 0) + amount);
}

export function calculateExternalContributions(
  handle: string,
  commits: ReadonlyArray<Commit>,
  pullRequests: ReadonlyArray<PullRequest>,
  issues: ReadonlyArray<Issue>,
  repositoryActivity: ReadonlyArray<RepositoryCommitActivity>,
): AnalyticsExternalContributions {
  const scores = new Map<string, number>();
  const fetchedCommitsByPath = new Map<string, number>();

  let pullRequestCount = 0;
  for (const pullRequest of pullRequests) {
    const path = pullRequest.targetRepositoryPath;
    if (!isExternalRepositoryPath(path, handle) || !path) continue;
    pullRequestCount += 1;
    addScore(scores, path, 1);
  }

  for (const commit of commits) {
    if (!isExternalRepositoryPath(commit.repositoryPath, handle)) continue;
    fetchedCommitsByPath.set(
      commit.repositoryPath,
      (fetchedCommitsByPath.get(commit.repositoryPath) ?? 0) + 1,
    );
  }

  for (const activity of repositoryActivity) {
    if (!isExternalRepositoryPath(activity.repositoryPath, handle)) continue;
    const fetched = fetchedCommitsByPath.get(activity.repositoryPath) ?? 0;
    fetchedCommitsByPath.set(activity.repositoryPath, Math.max(fetched, activity.commitCount));
  }

  let commitCount = 0;
  for (const [path, count] of fetchedCommitsByPath) {
    commitCount += count;
    addScore(scores, path, count);
  }

  let issueCount = 0;
  for (const issue of issues) {
    if (!isExternalRepositoryPath(issue.repositoryPath, handle)) continue;
    issueCount += 1;
    addScore(scores, issue.repositoryPath, 1);
  }

  let featuredRepositoryPath: string | null = null;
  let featuredScore = 0;
  for (const [repoPath, score] of scores) {
    if (
      score > featuredScore ||
      (score === featuredScore && featuredRepositoryPath !== null && repoPath < featuredRepositoryPath)
    ) {
      featuredRepositoryPath = repoPath;
      featuredScore = score;
    }
  }

  return {
    pullRequestCount,
    commitCount,
    issueCount,
    uniqueRepositoryCount: scores.size,
    featuredRepositoryPath,
  };
}
