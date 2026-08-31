import { describe, expect, it } from "vitest";
import { unavailable } from "@/domain/models";
import { analyzeCommitMessageProfile } from "@/services/analytics/calculators/activity/messages";
import {
  classifyCommitPersonality,
  detectCommitPersonality,
  detectContributionMilestone,
  detectFinalPush,
  detectFirstRepository,
  detectOpenSourceChapter,
} from "./additional-signals";
import { detectComeback } from "./signals";
import { baseAnalytics, emptyTimeline, richAnalytics } from "../test-fixtures";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function calendarDays(
  year: number,
  countFor: (date: string) => number,
): Array<{ date: string; count: number }> {
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

function analyticsWithDays(
  year: number,
  countFor: (date: string) => number,
  totalOverride?: number,
) {
  const days = calendarDays(year, countFor);
  const total = totalOverride ?? days.reduce((sum, day) => sum + day.count, 0);
  return baseAnalytics({
    year,
    overview: { ...baseAnalytics().overview, totalContributions: total },
    timeline: emptyTimeline(year, days),
    availability: {
      ...baseAnalytics().availability,
      contributions: { status: "available", confidence: "measured" },
    },
  });
}

describe("detectComeback", () => {
  it("detects a long quiet stretch followed by a strong rebound", () => {
    const signal = detectComeback(richAnalytics());
    expect(signal).not.toBeNull();
    expect(signal?.quietDays).toBeGreaterThanOrEqual(14);
    expect(signal?.reboundCount).toBeGreaterThanOrEqual(15);
    expect(signal?.typicalWeekly).toBeGreaterThan(0);
  });

  it("does not label a short gap as a comeback", () => {
    const analytics = analyticsWithDays(2026, (date) => {
      if (date >= "2026-03-01" && date <= "2026-03-05") return 0;
      return 2;
    });
    expect(detectComeback(analytics)).toBeNull();
  });

  it("does not label a weak return as a comeback", () => {
    const analytics = analyticsWithDays(2026, (date) => {
      if (date >= "2026-04-01" && date <= "2026-04-20") return 0;
      if (date === "2026-04-21") return 1;
      return 0;
    });
    expect(detectComeback(analytics)).toBeNull();
  });
});

describe("detectFinalPush", () => {
  it("detects elevated activity in the final 21 days versus the rest of the year", () => {
    const analytics = analyticsWithDays(2026, (date) => {
      if (date >= "2026-12-11") return 4;
      return date.endsWith("-01") ? 2 : 0;
    });
    const signal = detectFinalPush(analytics);
    expect(signal).not.toBeNull();
    expect(signal?.windowStart).toBe("2026-12-11");
    expect(signal?.windowEnd).toBe("2026-12-31");
    expect(signal?.windowCount).toBeGreaterThanOrEqual(12);
  });

  it("does not treat a normal even year as a final push", () => {
    const analytics = analyticsWithDays(2026, () => 1);
    expect(detectFinalPush(analytics)).toBeNull();
  });

  it("does not treat a last contribution as a final push", () => {
    const analytics = analyticsWithDays(2026, (date) => {
      if (date === "2026-12-31") return 3;
      if (date <= "2026-06-30") return date.endsWith("-01") ? 3 : 0;
      return 0;
    });
    expect(detectFinalPush(analytics)).toBeNull();
  });
});

describe("detectContributionMilestone", () => {
  it("records the date 100 contributions were crossed", () => {
    let remaining = 100;
    const analytics = analyticsWithDays(2026, (date) => {
      if (remaining <= 0) return 0;
      if (date < "2026-03-10") return 0;
      remaining -= 1;
      return 1;
    });
    expect(detectContributionMilestone(analytics)).toMatchObject({
      threshold: 100,
      crossedOn: "2026-06-17",
    });
  });

  it("records 500 and 1,000 crossings and selects the highest for the story signal", () => {
    let remaining = 1000;
    const analytics = analyticsWithDays(2026, () => {
      if (remaining <= 0) return 0;
      remaining -= 4;
      return 4;
    });
    const signal = detectContributionMilestone(analytics);
    expect(signal?.threshold).toBe(1000);
    expect(signal?.crossedOn).toBeTruthy();
  });

  it("keeps the highest threshold when several are crossed", () => {
    const analytics = analyticsWithDays(2026, (date) => (date <= "2026-04-30" ? 8 : 0));
    expect(detectContributionMilestone(analytics)?.threshold).toBe(500);
  });

  it("does not create a milestone below 100", () => {
    const analytics = analyticsWithDays(2026, (date) => (date <= "2026-01-20" ? 2 : 0));
    expect(detectContributionMilestone(analytics)).toBeNull();
  });

  it("treats an exact threshold as a crossing", () => {
    let remaining = 100;
    const analytics = analyticsWithDays(2026, () => {
      if (remaining === 0) return 0;
      remaining -= 1;
      return 1;
    });
    expect(detectContributionMilestone(analytics)).toMatchObject({ threshold: 100, total: 100 });
  });
});

describe("detectFirstRepository", () => {
  it("uses the first repository created in the recap year", () => {
    const analytics = baseAnalytics({
      repositories: {
        ...baseAnalytics().repositories,
        firstRepositoryCreatedInYear: {
          name: "spark",
          ownerName: "octocat",
          createdAt: "2026-02-03T00:00:00.000Z",
          url: "https://github.com/octocat/spark",
        },
        oldestActiveRepository: { name: "legacy", ageDays: 4000 },
      },
    });
    expect(detectFirstRepository(analytics)).toMatchObject({
      name: "spark",
      ownedByUser: true,
    });
  });

  it("does not invent a first-in-year repository from an older repo", () => {
    const analytics = baseAnalytics({
      repositories: {
        ...baseAnalytics().repositories,
        oldestActiveRepository: { name: "legacy", ageDays: 4000 },
        firstRepositoryCreatedInYear: null,
      },
    });
    expect(detectFirstRepository(analytics)).toBeNull();
  });

  it("skips when repository data is unavailable", () => {
    const analytics = baseAnalytics({
      availability: {
        ...baseAnalytics().availability,
        repositories: unavailable("fetch_failed"),
      },
      repositories: {
        ...baseAnalytics().repositories,
        firstRepositoryCreatedInYear: {
          name: "spark",
          ownerName: "octocat",
          createdAt: "2026-02-03T00:00:00.000Z",
          url: null,
        },
      },
    });
    expect(detectFirstRepository(analytics)).toBeNull();
  });
});

describe("detectOpenSourceChapter", () => {
  it("requires meaningful activity in repositories the user does not own", () => {
    const analytics = baseAnalytics({
      externalContributions: {
        pullRequestCount: 3,
        commitCount: 8,
        issueCount: 1,
        uniqueRepositoryCount: 2,
        featuredRepositoryPath: "vercel/next.js",
      },
    });
    expect(detectOpenSourceChapter(analytics)?.featuredRepositoryPath).toBe("vercel/next.js");
  });

  it("does not treat owned-only activity as open source", () => {
    expect(detectOpenSourceChapter(baseAnalytics())).toBeNull();
  });

  it("does not generate from a single external commit", () => {
    const analytics = baseAnalytics({
      externalContributions: {
        pullRequestCount: 0,
        commitCount: 1,
        issueCount: 0,
        uniqueRepositoryCount: 1,
        featuredRepositoryPath: "other/repo",
      },
    });
    expect(detectOpenSourceChapter(analytics)).toBeNull();
  });
});

describe("commit message personality", () => {
  function summaries(kind: string, count: number): string[] {
    return Array.from({ length: count }, (_, index) => `${kind}: change ${index + 1}`);
  }

  it("labels a strong fix pattern as fixer", () => {
    const signal = classifyCommitPersonality(analyzeCommitMessageProfile(summaries("fix", 12)));
    expect(signal?.archetype).toBe("fixer");
    expect(signal?.keyword).toBe("fix");
  });

  it("labels a strong feat pattern as builder", () => {
    expect(classifyCommitPersonality(analyzeCommitMessageProfile(summaries("feat", 12)))?.archetype).toBe(
      "builder",
    );
  });

  it("labels a strong refactor pattern as refactorer", () => {
    expect(
      classifyCommitPersonality(analyzeCommitMessageProfile(summaries("refactor", 12)))?.archetype,
    ).toBe("refactorer");
  });

  it("labels repeated final wording as final-final", () => {
    const input = [
      ...summaries("chore", 8),
      "final",
      "final-final",
      "final2",
      "final_final polish",
    ];
    expect(classifyCommitPersonality(analyzeCommitMessageProfile(input))?.archetype).toBe("final-final");
  });

  it("does not label weak or tiny samples", () => {
    expect(classifyCommitPersonality(analyzeCommitMessageProfile(["fix: one"]))).toBeNull();
    expect(
      classifyCommitPersonality(
        analyzeCommitMessageProfile([
          "alpha zebra",
          "beta yak",
          "gamma xylophone",
          "delta wolf",
          "echo viper",
          "foxtrot umber",
          "golf tango",
          "hotel sierra",
          "india romeo",
          "juliet quebec",
          "kilo papa",
          "lima oscar",
        ]),
      ),
    ).toBeNull();
  });

  it("is deterministic", () => {
    const profile = analyzeCommitMessageProfile(summaries("fix", 12));
    expect(classifyCommitPersonality(profile)).toEqual(classifyCommitPersonality(profile));
    expect(detectCommitPersonality(baseAnalytics())).toBeNull();
  });
});
