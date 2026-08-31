import { describe, expect, it } from "vitest";
import { classifyDeveloperRhythm } from "./rhythm";
import { baseAnalytics, richAnalytics } from "../test-fixtures";

describe("classifyDeveloperRhythm", () => {
  it("classifies night activity as Night Builder", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 40 },
      availability: {
        ...baseAnalytics().availability,
        codingHours: { status: "available", confidence: "measured" },
      },
      activity: {
        ...baseAnalytics().activity,
        timeAnalysis: {
          ...baseAnalytics().activity.timeAnalysis,
          mostActiveHour: 23,
          nightOwlScore: { value: 52, maximum: 100, percentage: 52, description: "test" },
          preferredCodingSession: "NIGHT",
        },
      },
    });
    expect(classifyDeveloperRhythm(analytics)?.rhythm).toBe("Night Builder");
  });

  it("classifies consistent activity", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 200 },
      consistency: {
        ...baseAnalytics().consistency,
        activeDaysCount: 120,
        activeDaysRatio: 0.8,
        averageWeeklyConsistency: 70,
        longestStreak: 9,
      },
    });
    expect(classifyDeveloperRhythm(analytics)?.rhythm).toBe("Consistent Builder");
  });

  it("classifies a specialist from language share", () => {
    const analytics = richAnalytics();
    const specialist = classifyDeveloperRhythm({
      ...analytics,
      activity: {
        ...analytics.activity,
        timeAnalysis: {
          ...analytics.activity.timeAnalysis,
          nightOwlScore: { value: 10, maximum: 100, percentage: 10, description: "test" },
        },
      },
      consistency: {
        ...analytics.consistency,
        activeDaysCount: 10,
        activeDaysRatio: 0.05,
        averageWeeklyConsistency: 10,
        consecutiveActiveWeeks: 8,
      },
      languages: {
        ...analytics.languages,
        favoriteLanguage: {
          name: "Rust",
          color: "#dea584",
          totalBytes: 90000,
          percentage: 88,
        },
      },
      organizations: {
        organizationContributionsCount: 0,
        mostActiveOrganization: null,
        organizationList: [],
      },
      timeline: { ...analytics.timeline, daily: [] },
    });
    expect(specialist?.rhythm).toBe("Specialist");
  });

  it("classifies an explorer from language count", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 40 },
      availability: {
        ...baseAnalytics().availability,
        languages: { status: "available", confidence: "measured" },
      },
      languages: {
        ...baseAnalytics().languages,
        favoriteLanguage: { name: "TypeScript", color: null, totalBytes: 1000, percentage: 20 },
        languageDistribution: [
          { name: "TypeScript", color: null, totalBytes: 1, percentage: 20, repositoryCount: 1 },
          { name: "Go", color: null, totalBytes: 1, percentage: 16, repositoryCount: 1 },
          { name: "Rust", color: null, totalBytes: 1, percentage: 16, repositoryCount: 1 },
          { name: "Python", color: null, totalBytes: 1, percentage: 16, repositoryCount: 1 },
          { name: "Ruby", color: null, totalBytes: 1, percentage: 16, repositoryCount: 1 },
          { name: "C", color: null, totalBytes: 1, percentage: 16, repositoryCount: 1 },
        ],
      },
    });
    expect(classifyDeveloperRhythm(analytics)?.rhythm).toBe("Explorer");
  });

  it("classifies concentrated bursts as Sprint Builder", () => {
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 80 },
      productivity: {
        ...baseAnalytics().productivity,
        mostProductiveWeek: { weekStartDate: "2026-W12", count: 36 },
        averageContributionsPerWeek: 8,
      },
      consistency: {
        ...baseAnalytics().consistency,
        consecutiveActiveWeeks: 2,
        activeDaysCount: 18,
        activeDaysRatio: 0.05,
        averageWeeklyConsistency: 12,
      },
    });
    expect(classifyDeveloperRhythm(analytics)?.rhythm).toBe("Sprint Builder");
  });

  it("returns no classification when signals are weak", () => {
    expect(classifyDeveloperRhythm(baseAnalytics())).toBeNull();
  });
});
