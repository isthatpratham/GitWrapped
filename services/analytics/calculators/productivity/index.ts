// ---------------------------------------------------------------------------
// Calculator: Productivity
// ---------------------------------------------------------------------------
// Computes productivity profiles (averages, peaks, quietest months, trends).
// ---------------------------------------------------------------------------

import type { ContributionHistory } from "@/domain/models";
import type { AnalyticsProductivity } from "@/services/analytics/analytics.types";
import { MONTH_NAMES, getQuarter, getYearWeekString } from "@/services/analytics/analytics.utils";

export function calculateProductivity(
  contributions: ContributionHistory,
  recapYear: number,
): AnalyticsProductivity {
  const days = contributions.calendar.weeks.flatMap((w) => w.days);

  let maxDayCount = 0;
  let mostProductiveDayDate = "";

  const weekMap = new Map<string, number>();
  const monthMap = new Map<number, number>();

  for (const day of days) {
    const count = day.count;
    const dateStr = day.date;
    const date = new Date(dateStr);
    const month = date.getMonth();

    // Day level
    if (count > maxDayCount) {
      maxDayCount = count;
      mostProductiveDayDate = dateStr;
    }

    // Week level
    const weekKey = getYearWeekString(dateStr);
    const currentWeekCount = weekMap.get(weekKey) ?? 0;
    weekMap.set(weekKey, currentWeekCount + count);

    // Month level
    const currentMonthCount = monthMap.get(month) ?? 0;
    monthMap.set(month, currentMonthCount + count);
  }

  // Find most productive week
  let maxWeekCount = 0;
  let mostProductiveWeekStart = "";
  for (const [weekKey, count] of weekMap.entries()) {
    if (count > maxWeekCount) {
      maxWeekCount = count;
      mostProductiveWeekStart = weekKey;
    }
  }

  // Find most productive / quietest month
  let maxMonthCount = -1;
  let mostProductiveMonthIndex = 0;
  let minMonthCount = Infinity;
  let quietestMonthIndex = 0;

  for (let m = 0; m < 12; m++) {
    const count = monthMap.get(m) ?? 0;
    if (count > maxMonthCount) {
      maxMonthCount = count;
      mostProductiveMonthIndex = m;
    }
    if (count < minMonthCount) {
      minMonthCount = count;
      quietestMonthIndex = m;
    }
  }

  const totalContributions = contributions.calendar.totalCount;
  const totalDays = days.length || 1;
  const totalWeeks = weekMap.size || 1;

  // Group by quarter to compute momentum and trends
  let q1Count = 0, q2Count = 0, q3Count = 0, q4Count = 0;
  for (const day of days) {
    const q = getQuarter(day.date);
    if (q === 1) q1Count += day.count;
    else if (q === 2) q2Count += day.count;
    else if (q === 3) q3Count += day.count;
    else if (q === 4) q4Count += day.count;
  }

  // Trend: UPWARD if Q4 > Q1, DOWNWARD if Q4 < Q1, STABLE if equal
  let productivityTrend: "UPWARD" | "DOWNWARD" | "STABLE" = "STABLE";
  if (q4Count > q1Count * 1.05) {
    productivityTrend = "UPWARD";
  } else if (q4Count < q1Count * 0.95) {
    productivityTrend = "DOWNWARD";
  }

  // Contribution Momentum: Q4 / Q1 ratio (safely handle division by zero)
  const denominator = q1Count || 1;
  const contributionMomentum = parseFloat((q4Count / denominator).toFixed(3));

  return {
    mostProductiveDay: mostProductiveDayDate
      ? {
          date: mostProductiveDayDate,
          count: maxDayCount,
        }
      : null,
    mostProductiveWeek: mostProductiveWeekStart
      ? {
          weekStartDate: mostProductiveWeekStart,
          count: maxWeekCount,
        }
      : null,
    mostProductiveMonth: totalContributions > 0
      ? {
          monthIndex: mostProductiveMonthIndex,
          monthName: MONTH_NAMES[mostProductiveMonthIndex] ?? "",
          count: maxMonthCount,
        }
      : null,
    averageContributionsPerDay: parseFloat((totalContributions / totalDays).toFixed(2)),
    averageContributionsPerWeek: parseFloat((totalContributions / totalWeeks).toFixed(2)),
    averageContributionsPerMonth: parseFloat((totalContributions / 12).toFixed(2)),
    peakContributionDay: contributions.peakDay
      ? {
          date: contributions.peakDay.date,
          count: contributions.peakDay.commitCount,
          repositoryPath: contributions.peakDay.repositoryPath,
        }
      : null,
    quietestMonth: totalContributions > 0
      ? {
          monthIndex: quietestMonthIndex,
          monthName: MONTH_NAMES[quietestMonthIndex] ?? "",
          count: minMonthCount,
        }
      : null,
    productivityTrend,
    contributionMomentum,
  };
}
