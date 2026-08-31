import { describe, expect, it } from "vitest";
import { copyForInsight, welcomeCopy } from "./templates";
import { availableMeasured } from "@/domain/models";
import type { StoryInsight } from "../intelligence/types";

function insight(partial: Pick<StoryInsight, "kind" | "payload">): StoryInsight {
  return {
    id: partial.kind,
    family: "year",
    chapter: "YOUR_YEAR",
    slideType: "Overview",
    availability: availableMeasured(),
    strength: 50,
    uniqueness: 50,
    narrativeValue: 50,
    surprise: 10,
    shareable: true,
    heroValue: null,
    evidence: [],
    ...partial,
  };
}

describe("story copy templates", () => {
  it("uses a measured zero for empty contribution years", () => {
    const copy = copyForInsight(
      insight({
        kind: "contribution-total",
        payload: { kind: "contribution-total", total: 0, year: 2026 },
      }),
      "octocat",
    );
    expect(copy.headline).toContain("0 public contributions");
    expect(copy.description).toContain("measured zero");
  });

  it("does not claim repository creation from commit share", () => {
    const copy = copyForInsight(
      insight({
        kind: "repository-concentration",
        payload: {
          kind: "repository-concentration",
          repositoryName: "hello-world",
          commitCount: 210,
          sharePercent: 70,
          owned: false,
        },
      }),
      "octocat",
    );
    expect(copy.headline).toContain("70%");
    expect(copy.description.toLowerCase()).not.toContain("you built");
    expect(copy.description).toContain("not that you created the repository");
  });

  it("describes language volume as detected bytes, not lines of code", () => {
    const copy = copyForInsight(
      insight({
        kind: "language-dominance",
        payload: {
          kind: "language-dominance",
          name: "TypeScript",
          color: "#3178c6",
          percentage: 72,
          totalBytes: 80000,
        },
      }),
      "octocat",
    );
    expect(copy.description.toLowerCase()).not.toContain("lines of code");
    expect(copy.description).toContain("language bytes");
  });

  it("keeps welcome copy tied to the recap year", () => {
    expect(welcomeCopy("octocat", "The Octocat", 2026).headline).toBe("Hey, The Octocat.");
  });
});
