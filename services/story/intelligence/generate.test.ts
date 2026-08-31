import { describe, expect, it } from "vitest";
import { unavailable } from "@/domain/models";
import { generateStoryInsights } from "./generate";
import { baseAnalytics, richAnalytics } from "../test-fixtures";

describe("generateStoryInsights", () => {
  it("creates year, peak, streak, night, language, and repository candidates from rich data", () => {
    const insights = generateStoryInsights(richAnalytics());
    const kinds = insights.map((insight) => insight.kind);
    expect(kinds).toContain("contribution-total");
    expect(kinds).toContain("peak-day");
    expect(kinds).toContain("longest-streak");
    expect(kinds).toContain("night-activity");
    expect(kinds).toContain("language-dominance");
    expect(kinds).toContain("repository-concentration");
    expect(kinds).toContain("peak-repository");
    expect(kinds).toContain("most-starred-repository");
  });

  it("does not invent night activity when coding hours are unavailable", () => {
    const analytics = richAnalytics();
    const insights = generateStoryInsights({
      ...analytics,
      availability: {
        ...analytics.availability,
        codingHours: unavailable("no_commit_timestamps"),
        commitTimestamps: unavailable("no_commit_timestamps"),
      },
      activity: {
        ...analytics.activity,
        timeAnalysis: {
          mostActiveHour: null,
          nightOwlScore: null,
          earlyBirdScore: null,
          weekendActivity: null,
          weekdayActivity: null,
          preferredCodingSession: null,
        },
      },
    });
    expect(insights.some((insight) => insight.kind === "night-activity")).toBe(false);
  });

  it("does not create a language story when language data is unavailable", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 10 },
    });
    const insights = generateStoryInsights(analytics);
    expect(insights.some((insight) => insight.family === "language")).toBe(false);
  });

  it("does not create a language story for a year with no contributions", () => {
    const analytics = richAnalytics();
    const insights = generateStoryInsights({
      ...analytics,
      overview: { ...analytics.overview, totalContributions: 0 },
    });
    expect(insights.some((insight) => insight.family === "language")).toBe(false);
  });

  it("does not create a night candidate when night share is too weak", () => {
    const analytics = richAnalytics();
    const insights = generateStoryInsights({
      ...analytics,
      activity: {
        ...analytics.activity,
        timeAnalysis: {
          ...analytics.activity.timeAnalysis,
          nightOwlScore: {
            value: 8,
            maximum: 100,
            percentage: 8,
            description: "test",
          },
        },
      },
    });
    expect(insights.some((insight) => insight.kind === "night-activity")).toBe(false);
  });

  it("does not generate contribution stories when contribution data is unavailable", () => {
    const analytics = richAnalytics();
    const insights = generateStoryInsights({
      ...analytics,
      availability: {
        ...analytics.availability,
        contributions: unavailable("fetch_failed"),
      },
    });
    expect(insights.some((insight) => insight.family === "year")).toBe(false);
    expect(insights.some((insight) => insight.kind === "peak-day")).toBe(false);
    expect(insights.some((insight) => insight.kind === "longest-streak")).toBe(false);
    expect(insights.some((insight) => insight.kind === "comeback")).toBe(false);
  });
});
