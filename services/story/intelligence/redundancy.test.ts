import { describe, expect, it } from "vitest";
import { collapseRedundantInsights } from "./redundancy";
import { rankStoryInsights } from "./rank";
import { generateStoryInsights } from "./generate";
import { richAnalytics } from "../test-fixtures";

describe("collapseRedundantInsights", () => {
  it("keeps a single coding-time slide when night and weekend both exist", () => {
    const analytics = richAnalytics();
    const withWeekend = {
      ...analytics,
      activity: {
        ...analytics.activity,
        timeAnalysis: {
          ...analytics.activity.timeAnalysis,
          weekendActivity: 55,
        },
      },
    };
    const ranked = rankStoryInsights(generateStoryInsights(withWeekend));
    const unique = collapseRedundantInsights(ranked);
    const codingTime = unique.filter((insight) => insight.family === "coding-time");
    expect(codingTime).toHaveLength(1);
  });

  it("does not keep overlapping streak achievements when a streak slide is selected first", () => {
    const ranked = rankStoryInsights(generateStoryInsights(richAnalytics()));
    const unique = collapseRedundantInsights(ranked);
    const achievements = unique.find((insight) => insight.kind === "achievements");
    if (achievements && achievements.payload.kind === "achievements") {
      expect(achievements.payload.achievements.some((item) => item.id === "streak-keeper")).toBe(false);
    }
  });
});
