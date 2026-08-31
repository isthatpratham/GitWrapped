import type { ContributionHistory } from "@/domain/models";
import { isCalendarDateInYear, utcMonthIndex, utcYearWeekString } from "@/lib/time/utc";
import type { AnalyticsConsistency } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { createNormalizedScore } from "@/services/analytics/analytics.utils";

/**
 * Consistency semantics
 *
 * Calendar weeks from GitHub include padding days from adjacent years.
 * All day-level metrics below are restricted to the recap year (UTC calendar dates).
 *
 * Score formula (0–100):
 *   40% activeDaysRatio  = min(1, activeDaysInYear / targetActiveDays)
 *                          targetActiveDays is 150 (see ANALYTICS_CONFIG)
 *   30% weeklyRatio      = activeWeeksInYear / weeksIntersectingYear
 *   30% streakRatio      = min(1, longestStreak / 30)
 *
 * `activeDaysRatio` previously reused the weekly ratio. That disagreed with
 * the documented active-days target. Product scores will change for users
 * whose weekly rhythm and day count diverge.
 */
export function calculateConsistency(
  contributions: ContributionHistory,
  year: number,
): AnalyticsConsistency {
  const allDays = contributions.calendar.weeks.flatMap((w) => w.days);
  const days = allDays.filter((day) => isCalendarDateInYear(day.date, year));

  let longestStreak = 0;
  let longestStreakStartDate: string | null = null;
  let longestStreakEndDate: string | null = null;

  let currentStreak = 0;
  let currentStreakStartDate: string | null = null;

  let tempStreak = 0;
  let tempStreakStart = "";
  let missedDaysCount = 0;
  let activeDaysCount = 0;

  const weekActiveMap = new Map<string, boolean>();
  const monthActiveMap = new Map<number, boolean>();

  for (const day of days) {
    const count = day.count;
    const dateStr = day.date;
    const weekKey = utcYearWeekString(dateStr);
    const month = utcMonthIndex(dateStr);

    if (count > 0) {
      activeDaysCount += 1;
      weekActiveMap.set(weekKey, true);
      if (month !== null) monthActiveMap.set(month, true);

      if (tempStreak === 0) {
        tempStreakStart = dateStr;
      }
      tempStreak += 1;

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStartDate = tempStreakStart;
        longestStreakEndDate = dateStr;
      }
    } else {
      missedDaysCount += 1;
      tempStreak = 0;
    }
  }

  let activeBackward = 0;
  let startedStreak = false;
  let streakStart: string | null = null;

  for (let i = days.length - 1; i >= 0; i -= 1) {
    const day = days[i];
    if (!day) continue;

    if (day.count > 0) {
      activeBackward += 1;
      startedStreak = true;
      streakStart = day.date;
    } else if (startedStreak || days.length - 1 - i > 1) {
      break;
    }
  }

  if (activeBackward >= ANALYTICS_CONFIG.consistency.minimumStreakLength) {
    currentStreak = activeBackward;
    currentStreakStartDate = streakStart;
  }

  const weeksInYear = contributions.calendar.weeks.filter((week) =>
    week.days.some((day) => isCalendarDateInYear(day.date, year)),
  );
  const totalWeeks = weeksInYear.length || 1;
  const activeWeeksCount = weekActiveMap.size;
  const averageWeeklyConsistency = parseFloat(((activeWeeksCount / totalWeeks) * 100).toFixed(2));

  const activeMonthsCount = monthActiveMap.size;
  const averageMonthlyConsistency = parseFloat(((activeMonthsCount / 12) * 100).toFixed(2));

  let maxConsecutiveWeeks = 0;
  let currentConsecutiveWeeks = 0;

  for (const week of weeksInYear) {
    const isWeekActive = week.days.some(
      (d) => isCalendarDateInYear(d.date, year) && d.count > 0,
    );
    if (isWeekActive) {
      currentConsecutiveWeeks += 1;
      if (currentConsecutiveWeeks > maxConsecutiveWeeks) {
        maxConsecutiveWeeks = currentConsecutiveWeeks;
      }
    } else {
      currentConsecutiveWeeks = 0;
    }
  }

  const targetActiveDays = ANALYTICS_CONFIG.consistency.targetActiveDays;
  const activeDaysRatio = Math.min(1, activeDaysCount / targetActiveDays);
  const weeklyRatio = Math.min(1, activeWeeksCount / totalWeeks);
  const streakRatio = Math.min(1, longestStreak / 30);

  const rawScore = activeDaysRatio * 40 + weeklyRatio * 30 + streakRatio * 30;
  const consistencyScore = createNormalizedScore(
    rawScore,
    ANALYTICS_CONFIG.consistency.maxConsistencyScore,
    `Calculated from ${activeDaysCount} active days (target ${targetActiveDays}), weekly active ratio ${averageWeeklyConsistency}%, and a longest streak of ${longestStreak} days.`,
  );

  return {
    longestStreak,
    longestStreakStartDate,
    longestStreakEndDate,
    currentStreak,
    currentStreakStartDate,
    averageWeeklyConsistency,
    averageMonthlyConsistency,
    activeDaysCount,
    activeDaysRatio: parseFloat(activeDaysRatio.toFixed(4)),
    missedDaysCount,
    consecutiveActiveWeeks: maxConsecutiveWeeks,
    consistencyScore,
  };
}
