import { describe, expect, it } from "vitest";
import { generateStoryInsights } from "./generate";
import { detectComeback } from "./signals";
import { baseAnalytics, emptyTimeline, richAnalytics } from "../test-fixtures";

describe("story moments", () => {
  it("creates a peak-day moment from the biggest calendar day", () => {
    const peak = generateStoryInsights(richAnalytics()).find((insight) => insight.kind === "peak-day");
    expect(peak?.payload).toMatchObject({ kind: "peak-day", date: "2026-09-14", count: 27 });
  });

  it("creates a comeback moment after a long quiet stretch", () => {
    expect(detectComeback(richAnalytics())).not.toBeNull();
    expect(generateStoryInsights(richAnalytics()).some((insight) => insight.kind === "comeback")).toBe(true);
  });

  it("creates repository concentration from commit share", () => {
    const insight = generateStoryInsights(richAnalytics()).find(
      (item) => item.kind === "repository-concentration",
    );
    expect(insight?.payload).toMatchObject({ kind: "repository-concentration", repositoryName: "hello-world" });
  });

  it("creates language evolution when the primary language changes", () => {
    const insight = generateStoryInsights(richAnalytics()).find((item) => item.kind === "language-evolution");
    expect(insight?.payload).toMatchObject({
      kind: "language-evolution",
      fromLanguage: "JavaScript",
      toLanguage: "TypeScript",
    });
  });

  it("does not treat a modest busy day as an unusual spike", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 12 },
      timeline: emptyTimeline(2026, [
        { date: "2026-01-01", count: 2 },
        { date: "2026-01-02", count: 2 },
        { date: "2026-01-03", count: 3 },
      ]),
      productivity: {
        ...baseAnalytics().productivity,
        mostProductiveDay: { date: "2026-01-03", count: 3 },
        averageContributionsPerDay: 2,
      },
    });
    expect(generateStoryInsights(analytics).some((insight) => insight.kind === "activity-spike")).toBe(false);
  });
});
