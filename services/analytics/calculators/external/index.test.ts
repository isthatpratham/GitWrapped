import { describe, expect, it } from "vitest";
import type { Commit, Issue, PullRequest, RepositoryCommitActivity } from "@/domain/models";
import { calculateExternalContributions, isExternalRepositoryPath } from "./index";

function pullRequest(path: string): PullRequest {
  return {
    id: path,
    title: "External change",
    status: "MERGED",
    openedAt: "2026-03-01T00:00:00.000Z",
    mergedAt: "2026-03-02T00:00:00.000Z",
    closedAt: "2026-03-02T00:00:00.000Z",
    url: `https://github.com/${path}/pull/1`,
    linesAdded: 8,
    linesDeleted: 1,
    changedFileCount: 1,
    commentCount: 0,
    reviewRequestCount: 0,
    targetRepositoryPath: path,
    targetRepositoryIsPrivate: false,
    labels: [],
  };
}

function commit(path: string, sha: string): Commit {
  return {
    sha,
    summary: "fix: edge case",
    fullMessage: "fix: edge case",
    authoredAt: "2026-03-01T12:00:00.000Z",
    linesAdded: 4,
    linesDeleted: 1,
    changedFileCount: 1,
    repositoryPath: path,
  };
}

function issue(path: string): Issue {
  return {
    id: path,
    title: "Question",
    status: "OPEN",
    openedAt: "2026-03-01T00:00:00.000Z",
    closedAt: null,
    url: `https://github.com/${path}/issues/1`,
    commentCount: 0,
    reactionCount: 0,
    labels: [],
    repositoryPath: path,
    repositoryIsPrivate: false,
  };
}

describe("calculateExternalContributions", () => {
  it("counts pull requests, commits, and issues outside the user's handle", () => {
    const activity: ReadonlyArray<RepositoryCommitActivity> = [
      { repositoryPath: "octocat/hello-world", commitCount: 40, primaryLanguage: null },
    ];
    const result = calculateExternalContributions(
      "octocat",
      [commit("vercel/next.js", "a"), commit("octocat/hello-world", "b")],
      [pullRequest("vercel/next.js"), pullRequest("octocat/notes")],
      [issue("torvalds/linux")],
      activity,
    );
    expect(result.pullRequestCount).toBe(1);
    expect(result.commitCount).toBe(1);
    expect(result.issueCount).toBe(1);
    expect(result.uniqueRepositoryCount).toBe(2);
    expect(result.featuredRepositoryPath).toBe("vercel/next.js");
    expect(isExternalRepositoryPath("vercel/next.js", "octocat")).toBe(true);
    expect(isExternalRepositoryPath("octocat/hello-world", "octocat")).toBe(false);
  });

  it("does not treat owned repositories as external contribution", () => {
    const result = calculateExternalContributions(
      "octocat",
      [commit("octocat/hello-world", "a")],
      [pullRequest("octocat/hello-world")],
      [issue("octocat/hello-world")],
      [{ repositoryPath: "octocat/hello-world", commitCount: 12, primaryLanguage: null }],
    );
    expect(result.uniqueRepositoryCount).toBe(0);
    expect(result.pullRequestCount).toBe(0);
    expect(result.commitCount).toBe(0);
  });

  it("falls back to contribution repository activity when commit list is empty", () => {
    const result = calculateExternalContributions(
      "octocat",
      [],
      [],
      [],
      [{ repositoryPath: "microsoft/vscode", commitCount: 9, primaryLanguage: null }],
    );
    expect(result.commitCount).toBe(9);
    expect(result.uniqueRepositoryCount).toBe(1);
    expect(result.featuredRepositoryPath).toBe("microsoft/vscode");
  });
});
