import { describe, expect, it } from "vitest";
import { unavailable } from "@/domain/models";
import { composeStory } from "../compose";
import { copyForInsight } from "../copy/templates";
import { generateStoryInsights } from "./generate";
import { rankStoryInsights } from "./rank";
import { collapseRedundantInsights } from "./redundancy";
import { CHAPTER_ORDER } from "./types";
import { baseAnalytics, emptyTimeline, richAnalytics } from "../test-fixtures";
import { selectRepositoryCard } from "@/lib/player";
import type { StoryInsight } from "./types";
import { availableMeasured } from "@/domain/models";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function calendarDays(year: number, countFor: (date: string) => number) {
  const days: Array<{ date: string; count: number }> = [];
  for (let month = 1; month <= 12; month += 1) {
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let day = 1; day <= lastDay; day += 1) {
      const date = `${year}-${pad(month)}-${pad(day)}`;
      days.push({ date, count: countFor(date) });
    }
  }
  return days;
}

describe("additional story candidates", () => {
  it("does not generate a comeback when contribution data is unavailable", () => {
    const analytics = richAnalytics();
    const insights = generateStoryInsights({
      ...analytics,
      availability: {
        ...analytics.availability,
        contributions: unavailable("fetch_failed"),
      },
    });
    expect(insights.some((insight) => insight.kind === "comeback")).toBe(false);
    expect(insights.some((insight) => insight.kind === "final-push")).toBe(false);
    expect(insights.some((insight) => insight.kind === "contribution-milestone")).toBe(false);
  });

  it("places the six stories in existing chapters without breaking arc order", () => {
    const days = calendarDays(2026, (date) => {
      if (date >= "2026-12-11") return 5;
      if (date >= "2026-04-01" && date <= "2026-04-20") return 0;
      if (date >= "2026-04-21" && date <= "2026-04-27") return 6;
      return date.endsWith("-01") ? 4 : 0;
    });
    const analytics = baseAnalytics({
      overview: { ...baseAnalytics().overview, totalContributions: 400 },
      timeline: emptyTimeline(2026, days),
      repositories: {
        ...baseAnalytics().repositories,
        firstRepositoryCreatedInYear: {
          name: "spark",
          ownerName: "octocat",
          createdAt: "2026-01-08T00:00:00.000Z",
          url: "https://github.com/octocat/spark",
        },
      },
      externalContributions: {
        pullRequestCount: 4,
        commitCount: 12,
        issueCount: 0,
        uniqueRepositoryCount: 2,
        featuredRepositoryPath: "vercel/next.js",
      },
      activity: {
        ...baseAnalytics().activity,
        commits: {
          ...baseAnalytics().activity.commits,
          totalCount: 12,
          messageProfile: {
            sampleSize: 12,
            feat: 0,
            fix: 10,
            refactor: 0,
            docs: 0,
            chore: 0,
            update: 0,
            final: 0,
            topKeyword: { word: "timeout", count: 6 },
          },
        },
      },
      availability: {
        ...baseAnalytics().availability,
        commitTimestamps: { status: "available", confidence: "measured" },
      },
    });

    const insights = generateStoryInsights(analytics);
    const kinds = insights.map((insight) => insight.kind);
    expect(kinds).toEqual(expect.arrayContaining([
      "comeback",
      "final-push",
      "contribution-milestone",
      "first-repository",
      "open-source",
      "commit-personality",
    ]));

    const unique = collapseRedundantInsights(rankStoryInsights(insights));
    expect(unique.some((insight) => insight.kind === "comeback")).toBe(true);
    expect(unique.some((insight) => insight.kind === "final-push")).toBe(true);

    const story = composeStory(analytics);
    const indexes = story.slides.map((slide) => CHAPTER_ORDER.indexOf(slide.chapter));
    expect(indexes).toEqual([...indexes].sort((left, right) => left - right));
    expect(story.slides.find((slide) => slide.insightId === "first-repository")?.chapter).toBe("OPENING");
    expect(story.slides.find((slide) => slide.insightId === "contribution-milestone")?.chapter).toBe("YOUR_YEAR");
    expect(story.slides.find((slide) => slide.insightId === "commit-personality")?.chapter).toBe("YOUR_RHYTHM");
    expect(story.slides.find((slide) => slide.insightId === "open-source")?.chapter).toBe("YOUR_BUILD");
    expect(story.slides.find((slide) => slide.insightId === "comeback")?.chapter).toBe("MILESTONES");
    expect(story.slides.find((slide) => slide.insightId === "final-push")?.chapter).toBe("MILESTONES");

    const firstCard = selectRepositoryCard(
      story.slides.find((slide) => slide.insightId === "first-repository")?.metadata ?? {},
    );
    expect(firstCard).toMatchObject({ name: "spark", ownerName: "octocat" });
    expect(story.slides.length).toBeLessThanOrEqual(15);
  });

  it("does not pad low-data users with the new stories", () => {
    const story = composeStory(baseAnalytics());
    const extra = new Set([
      "comeback",
      "final-push",
      "contribution-milestone",
      "first-repository",
      "open-source",
      "commit-personality",
    ]);
    expect(story.slides.some((slide) => extra.has(slide.insightId ?? ""))).toBe(false);
  });

  it("is deterministic for the same additional-story snapshot", () => {
    const analytics = richAnalytics();
    const first = generateStoryInsights(analytics).map((insight) => insight.id);
    const second = generateStoryInsights(analytics).map((insight) => insight.id);
    expect(first).toEqual(second);
  });
});

describe("additional story copy", () => {
  const baseInsight = {
    family: "year" as const,
    chapter: "YOUR_YEAR" as const,
    slideType: "Highlights" as const,
    availability: availableMeasured(),
    strength: 50,
    uniqueness: 50,
    narrativeValue: 50,
    surprise: 10,
    shareable: true,
    heroValue: null,
    evidence: [],
  };

  it("keeps comeback copy evidence-based", () => {
    const insight: StoryInsight = {
      ...baseInsight,
      id: "comeback",
      kind: "comeback",
      family: "comeback",
      chapter: "MILESTONES",
      payload: {
        kind: "comeback",
        quietDays: 21,
        reboundCount: 18,
        reboundStart: "2026-06-22",
        typicalWeekly: 4.2,
      },
    };
    const copy = copyForInsight(insight, "octocat");
    expect(copy.headline).toContain("came back");
    expect(copy.description).toContain("21 quiet days");
  });

  it("does not put full commit messages on the personality slide", () => {
    const insight: StoryInsight = {
      ...baseInsight,
      id: "commit-personality",
      kind: "commit-personality",
      family: "commit-voice",
      chapter: "YOUR_RHYTHM",
      payload: {
        kind: "commit-personality",
        archetype: "fixer",
        keyword: "fix",
        matchCount: 10,
        sampleSize: 12,
        sharePercent: 83.3,
      },
    };
    const copy = copyForInsight(insight, "octocat");
    expect(copy.description).not.toContain("fix: leak api key");
    expect(copy.description).toContain("word pattern");
  });
});
