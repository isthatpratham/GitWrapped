import type { ContributionHistory } from "@/domain/models";
import {
  isCalendarDateInYear,
  utcMonthIndex,
  utcQuarter,
  utcYearWeekString,
} from "@/lib/time/utc";
import type { AnalyticsProductivity } from "@/services/analytics/analytics.types";
import { MONTH_NAMES } from "@/services/analytics/analytics.utils";

export function calculateProductivity(
  contributions: ContributionHistory,
  year: number,
): AnalyticsProductivity {
  const days = contributions.calendar.weeks
    .flatMap((w) => w.days)
    .filter((day) => isCalendarDateInYear(day.date, year));

  let maxDayCount = 0;
  let mostProductiveDayDate = "";

  const weekMap = new Map<string, number>();
  const monthMap = new Map<number, number>();

  for (const day of days) {
    const count = day.count;
    const dateStr = day.date;
    const month = utcMonthIndex(dateStr);

    if (
      count > maxDayCount ||
      (count === maxDayCount && count > 0 && dateStr > mostProductiveDayDate)
    ) {
      maxDayCount = count;
      mostProductiveDayDate = dateStr;
    }

    const weekKey = utcYearWeekString(dateStr);
    weekMap.set(weekKey, (weekMap.get(weekKey) ?? 0) + count);

    if (month !== null) {
      monthMap.set(month, (monthMap.get(month) ?? 0) + count);
    }
  }

  let maxWeekCount = 0;
  let mostProductiveWeekStart = "";
  for (const [weekKey, count] of weekMap.entries()) {
    if (count > maxWeekCount || (count === maxWeekCount && weekKey > mostProductiveWeekStart)) {
      maxWeekCount = count;
      mostProductiveWeekStart = weekKey;
    }
  }

  let maxMonthCount = -1;
  let mostProductiveMonthIndex = 0;
  let minMonthCount = Infinity;
  let quietestMonthIndex = 0;

  for (let m = 0; m < 12; m += 1) {
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

  let q1Count = 0;
  let q2Count = 0;
  let q3Count = 0;
  let q4Count = 0;
  for (const day of days) {
    const q = utcQuarter(day.date);
    if (q === 1) q1Count += day.count;
    else if (q === 2) q2Count += day.count;
    else if (q === 3) q3Count += day.count;
    else q4Count += day.count;
  }

  let productivityTrend: "UPWARD" | "DOWNWARD" | "STABLE" = "STABLE";
  if (q4Count > q1Count * 1.05) {
    productivityTrend = "UPWARD";
  } else if (q4Count < q1Count * 0.95) {
    productivityTrend = "DOWNWARD";
  }

  const denominator = q1Count || 1;
  const contributionMomentum = parseFloat((q4Count / denominator).toFixed(3));

  return {
    mostProductiveDay:
      maxDayCount > 0
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
    mostProductiveMonth:
      totalContributions > 0
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
    quietestMonth:
      totalContributions > 0
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
