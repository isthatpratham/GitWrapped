// ---------------------------------------------------------------------------
// Calculator: Contributions
// ---------------------------------------------------------------------------
// Calculates heatmap summaries, seasonal activities, weekly rhythms,
// and monthly rhythms.
// ---------------------------------------------------------------------------

import type { ContributionHistory } from "@/domain/models";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { MONTH_NAMES, DAY_NAMES } from "@/services/analytics/analytics.utils";

export interface ContributionsCalculationResult {
  readonly heatmapSummary: {
    readonly intensityLevels: {
      readonly none: number;
      readonly low: number;
      readonly medium: number;
      readonly high: number;
      readonly extreme: number;
    };
  };
  readonly weeklyRhythm: ReadonlyArray<{
    readonly dayIndex: number;
    readonly dayName: string;
    readonly totalContributions: number;
    readonly percentage: number;
  }>;
  readonly monthlyRhythm: ReadonlyArray<{
    readonly monthIndex: number;
    readonly monthName: string;
    readonly totalContributions: number;
    readonly percentage: number;
  }>;
  readonly seasonalActivity: {
    readonly spring: number; // Mar - May
    readonly summer: number; // Jun - Aug
    readonly autumn: number; // Sep - Nov
    readonly winter: number; // Dec - Feb
  };
  readonly codingFrequency: {
    readonly activeDaysCount: number;
    readonly inactiveDaysCount: number;
    readonly ratio: number; // active / total
  };
}

export function calculateContributions(
  contributions: ContributionHistory,
): ContributionsCalculationResult {
  const days = contributions.calendar.weeks.flatMap((w) => w.days);

  // Heatmap intensity counts
  let none = 0, low = 0, medium = 0, high = 0, extreme = 0;
  // Weekly rhythm
  const weeklyCounts = new Array(7).fill(0);
  // Monthly rhythm
  const monthlyCounts = new Array(12).fill(0);
  // Seasonal counts
  let spring = 0, summer = 0, autumn = 0, winter = 0;

  let activeDaysCount = 0;

  for (const day of days) {
    const count = day.count;
    if (count > 0) activeDaysCount++;

    // Intensity
    switch (day.intensity) {
      case "NONE":
        none++;
        break;
      case "FIRST_QUARTILE":
        low++;
        break;
      case "SECOND_QUARTILE":
        medium++;
        break;
      case "THIRD_QUARTILE":
        high++;
        break;
      case "FOURTH_QUARTILE":
        extreme++;
        break;
    }

    // Date parsing
    const date = new Date(day.date);
    const dayOfWeek = date.getDay(); // 0-6
    const month = date.getMonth(); // 0-11

    weeklyCounts[dayOfWeek] += count;
    monthlyCounts[month] += count;

    // Seasons: Spring (Mar=2, Apr=3, May=4), Summer (Jun=5, Jul=6, Aug=7),
    // Autumn (Sep=8, Oct=9, Nov=10), Winter (Dec=11, Jan=0, Feb=1)
    if (month >= 2 && month <= 4) spring += count;
    else if (month >= 5 && month <= 7) summer += count;
    else if (month >= 8 && month <= 10) autumn += count;
    else winter += count;
  }

  const totalCalendarContributions = contributions.calendar.totalCount;

  const weeklyRhythm = weeklyCounts.map((total, dayIndex) => ({
    dayIndex,
    dayName: DAY_NAMES[dayIndex] ?? "",
    totalContributions: total,
    percentage: totalCalendarContributions > 0 ? parseFloat(((total / totalCalendarContributions) * 100).toFixed(2)) : 0,
  }));

  const monthlyRhythm = monthlyCounts.map((total, monthIndex) => ({
    monthIndex,
    monthName: MONTH_NAMES[monthIndex] ?? "",
    totalContributions: total,
    percentage: totalCalendarContributions > 0 ? parseFloat(((total / totalCalendarContributions) * 100).toFixed(2)) : 0,
  }));

  const totalDays = days.length || 1;

  return {
    heatmapSummary: {
      intensityLevels: { none, low, medium, high, extreme },
    },
    weeklyRhythm,
    monthlyRhythm,
    seasonalActivity: { spring, summer, autumn, winter },
    codingFrequency: {
      activeDaysCount,
      inactiveDaysCount: totalDays - activeDaysCount,
      ratio: parseFloat((activeDaysCount / totalDays).toFixed(4)),
    },
  };
}
