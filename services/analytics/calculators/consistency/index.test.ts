import { describe, expect, it } from "vitest";

import type { ContributionDay, ContributionHistory } from "@/domain/models";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { calculateConsistency } from "./index";

function contributionDay(date: string, count: number): ContributionDay {
  return {
    date,
    count,
    intensity: count > 0 ? "FIRST_QUARTILE" : "NONE",
    color: "#161b22",
  };
}

function historyForDays(year: number, days: ReadonlyArray<ContributionDay>): ContributionHistory {
  const totalCount = days.reduce((sum, day) => sum + day.count, 0);
  return {
    calendar: {
      totalCount,
      weeks: [
        {
          weekStartDate: days[0]?.date ?? `${year}-01-01`,
          days,
        },
      ],
    },
    commitCount: totalCount,
    pullRequestCount: 0,
    issueCount: 0,
    reviewCount: 0,
    activeRepositoryCount: totalCount > 0 ? 1 : 0,
    privateContributionCount: 0,
    repositoryActivity: [],
    peakDay: null,
  };
}

describe("calculateConsistency", () => {
  it("treats zero activity as measured zeros, not a perfect score", () => {
    const result = calculateConsistency(
      historyForDays(2026, [
        contributionDay("2026-01-01", 0),
        contributionDay("2026-01-02", 0),
        contributionDay("2026-01-03", 0),
      ]),
      2026,
    );

    expect(result.activeDaysCount).toBe(0);
    expect(result.activeDaysRatio).toBe(0);
    expect(result.consistencyScore.percentage).toBe(0);
  });

  it("scores low activity below the 150-day target", () => {
    const result = calculateConsistency(
      historyForDays(2026, [
        contributionDay("2026-01-05", 1),
        contributionDay("2026-01-06", 1),
        contributionDay("2026-01-20", 1),
      ]),
      2026,
    );

    expect(result.activeDaysCount).toBe(3);
    expect(result.activeDaysRatio).toBeCloseTo(3 / ANALYTICS_CONFIG.consistency.targetActiveDays);
    expect(result.consistencyScore.percentage).toBeLessThan(50);
  });

  it("scores regular weekly activity without treating it as a perfect day ratio", () => {
    const days = Array.from({ length: 20 }, (_, index) =>
      contributionDay(`2026-02-${String(index + 1).padStart(2, "0")}`, 1),
    );
    const result = calculateConsistency(historyForDays(2026, days), 2026);

    expect(result.activeDaysCount).toBe(20);
    expect(result.activeDaysRatio).toBeCloseTo(20 / 150);
    expect(result.averageWeeklyConsistency).toBeGreaterThan(0);
  });

  it("scores highly consistent activity near the active-days target", () => {
    const days = Array.from({ length: 150 }, (_, index) => {
      const date = new Date(Date.UTC(2026, 0, 1 + index));
      const iso = date.toISOString().slice(0, 10);
      return contributionDay(iso, 2);
    });
    const result = calculateConsistency(historyForDays(2026, days), 2026);

    expect(result.activeDaysCount).toBe(150);
    expect(result.activeDaysRatio).toBe(1);
    expect(result.consistencyScore.percentage).toBeGreaterThan(80);
  });
});
