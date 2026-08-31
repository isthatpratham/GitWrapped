import { describe, expect, it } from "vitest";
import { unavailable } from "@/domain/models";
import { deriveStoryAchievements } from "./achievements";
import { collapseRedundantInsights } from "./redundancy";
import { rankStoryInsights } from "./rank";
import { generateStoryInsights } from "./generate";
import { baseAnalytics, richAnalytics } from "../test-fixtures";

describe("deriveStoryAchievements", () => {
  it("does not unlock Night Builder without coding-hour evidence", () => {
    const analytics = richAnalytics();
    const titles = deriveStoryAchievements({
      ...analytics,
      availability: {
        ...analytics.availability,
        codingHours: unavailable("no_commit_timestamps"),
      },
    }).map((item) => item.id);
    expect(titles).not.toContain("night-builder");
  });

  it("caps achievements to avoid spam", () => {
    expect(deriveStoryAchievements(richAnalytics()).length).toBeLessThanOrEqual(4);
  });

  it("unlocks Shipper from merged pull requests", () => {
    const analytics = baseAnalytics({
      availability: {
        ...baseAnalytics().availability,
        pullRequests: { status: "available", confidence: "measured" },
      },
      activity: {
        ...baseAnalytics().activity,
        pullRequests: {
          opened: 24,
          merged: 21,
          closed: 1,
          mergeRate: 0.87,
          biggestPullRequest: null,
        },
      },
    });
    expect(deriveStoryAchievements(analytics).some((item) => item.id === "shipper")).toBe(true);
  });

  it("does not keep overlapping streak achievements beside a streak slide", () => {
    const unique = collapseRedundantInsights(rankStoryInsights(generateStoryInsights(richAnalytics())));
    const achievements = unique.find((insight) => insight.kind === "achievements");
    if (achievements && achievements.payload.kind === "achievements") {
      expect(achievements.payload.achievements.some((item) => item.id === "streak-keeper")).toBe(false);
      expect(achievements.payload.achievements.some((item) => item.id === "night-builder")).toBe(false);
    }
  });
});
