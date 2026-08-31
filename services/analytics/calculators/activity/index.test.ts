import { describe, expect, it } from "vitest";

import type { Commit } from "@/domain/models";
import { calculateActivity } from "./index";

function commit(overrides: Partial<Commit> & Pick<Commit, "sha" | "summary" | "authoredAt">): Commit {
  return {
    fullMessage: overrides.summary,
    linesAdded: 10,
    linesDeleted: 2,
    changedFileCount: 1,
    repositoryPath: "acme/app",
    ...overrides,
  };
}

describe("calculateActivity commit quality", () => {
  it("returns null quality when there are no commits", () => {
    const result = calculateActivity([], [], []);
    expect(result.commits.totalCount).toBe(0);
    expect(result.commits.commitMessageQualityScore).toBeNull();
    expect(result.timeAnalysis.mostActiveHour).toBeNull();
    expect(result.timeAnalysis.preferredCodingSession).toBeNull();
    expect(result.timeAnalysis.nightOwlScore).toBeNull();
  });

  it("scores descriptive commit messages without inventing a perfect empty score", () => {
    const result = calculateActivity(
      [
        commit({
          sha: "a",
          summary: "Implement canonical analytics snapshot",
          authoredAt: "2026-03-01T15:00:00.000Z",
        }),
        commit({
          sha: "b",
          summary: "fix",
          authoredAt: "2026-03-01T16:00:00.000Z",
        }),
      ],
      [],
      [],
    );

    expect(result.commits.commitMessageQualityScore).toBe(50);
    expect(result.timeAnalysis.mostActiveHour).toBe(15);
  });
});
