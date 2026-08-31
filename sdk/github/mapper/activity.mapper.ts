// ---------------------------------------------------------------------------
// Mapper: GitHub Activity (PR, Issue, Commit) → Domain Activity Models
// ---------------------------------------------------------------------------
// Converts raw SDK activity data into domain activity models.
// Normalises naming conventions to use GitWrapped business language.
// ---------------------------------------------------------------------------

import type {
  GitHubPullRequest,
  GitHubIssue,
  GitHubCommit,
  GitHubLabel,
} from "@/sdk/github/types";
import type {
  PullRequest,
  Issue,
  Commit,
  ActivityLabel,
} from "@/domain/models/activity";

/**
 * Maps an SDK label to a domain label.
 */
export function mapGitHubLabelToActivityLabel(raw: GitHubLabel): ActivityLabel {
  return {
    name: raw.name,
    color: raw.color,
  };
}

/**
 * Maps a raw `GitHubPullRequest` from the GitHub SDK into the domain
 * `PullRequest` model.
 */
export function mapGitHubPullRequestToPullRequest(raw: GitHubPullRequest): PullRequest {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.state,
    openedAt: raw.createdAt,
    mergedAt: raw.mergedAt,
    closedAt: raw.closedAt,
    url: raw.url,
    linesAdded: raw.additions,
    linesDeleted: raw.deletions,
    changedFileCount: raw.changedFiles,
    commentCount: raw.commentCount,
    reviewRequestCount: raw.reviewRequestCount,
    targetRepositoryPath: raw.baseRepository?.nameWithOwner ?? null,
    targetRepositoryIsPrivate: raw.baseRepository?.isPrivate ?? false,
    labels: raw.labels.map(mapGitHubLabelToActivityLabel),
  };
}

/**
 * Maps a raw `GitHubIssue` from the GitHub SDK into the domain
 * `Issue` model.
 */
export function mapGitHubIssueToIssue(raw: GitHubIssue): Issue {
  return {
    id: raw.id,
    title: raw.title,
    status: raw.state,
    openedAt: raw.createdAt,
    closedAt: raw.closedAt,
    url: raw.url,
    commentCount: raw.commentCount,
    reactionCount: raw.reactionCount,
    labels: raw.labels.map(mapGitHubLabelToActivityLabel),
    repositoryPath: raw.repository.nameWithOwner,
    repositoryIsPrivate: raw.repository.isPrivate,
  };
}

/**
 * Maps a raw `GitHubCommit` from the GitHub SDK into the domain
 * `Commit` model.
 */
export function mapGitHubCommitToCommit(raw: GitHubCommit): Commit {
  return {
    sha: raw.oid,
    summary: raw.messageHeadline,
    fullMessage: raw.message,
    authoredAt: raw.committedDate,
    linesAdded: raw.additions,
    linesDeleted: raw.deletions,
    changedFileCount: raw.changedFiles,
    repositoryPath: raw.repositoryPath,
  };
}
