import { describe, expect, it } from "vitest";

import { normalizePullRequest, pullRequestNodeSchema } from "./pull-request";

const validPullRequest = {
  id: "PR_kwDOA",
  title: "Add analytics contracts",
  state: "MERGED" as const,
  createdAt: "2026-03-01T12:00:00.000Z",
  mergedAt: "2026-03-02T12:00:00.000Z",
  closedAt: "2026-03-02T12:00:00.000Z",
  url: "https://github.com/acme/app/pull/1",
  additions: 120,
  deletions: 15,
  changedFiles: 4,
  comments: { totalCount: 3 },
  reviewRequests: { totalCount: 2 },
  baseRepository: { nameWithOwner: "acme/app", isPrivate: false },
  labels: { nodes: [{ name: "feature", color: "0e8a16" }] },
};

describe("pullRequestNodeSchema", () => {
  it("accepts a complete GitHub pull request node and normalizes consumed fields", () => {
    const parsed = pullRequestNodeSchema.parse(validPullRequest);
    const normalized = normalizePullRequest(parsed);

    expect(normalized.additions).toBe(120);
    expect(normalized.deletions).toBe(15);
    expect(normalized.changedFiles).toBe(4);
    expect(normalized.commentCount).toBe(3);
    expect(normalized.reviewRequestCount).toBe(2);
    expect(normalized.baseRepository?.isPrivate).toBe(false);
    expect(normalized.labels).toEqual([{ name: "feature", color: "0e8a16" }]);
  });

  it("rejects a response missing additions", () => {
    const { additions: _additions, ...rest } = validPullRequest;
    const result = pullRequestNodeSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects a response with a non-numeric deletions field", () => {
    const result = pullRequestNodeSchema.safeParse({
      ...validPullRequest,
      deletions: "15",
    });
    expect(result.success).toBe(false);
  });

  it("rejects labels that omit required nested fields", () => {
    const result = pullRequestNodeSchema.safeParse({
      ...validPullRequest,
      labels: { nodes: [{ name: "feature" }] },
    });
    expect(result.success).toBe(false);
  });
});
