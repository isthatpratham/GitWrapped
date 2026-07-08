// ---------------------------------------------------------------------------
// Calculator: Consistency
// ---------------------------------------------------------------------------
// Evaluates weekly/monthly consistency percentages, streaks, missed days,
// and computes the final normalised Consistency Score.
// ---------------------------------------------------------------------------

import type { ContributionHistory } from "@/domain/models";
import type { AnalyticsConsistency } from "@/services/analytics/analytics.types";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";
import { createNormalizedScore, getYearWeekString } from "@/services/analytics/analytics.utils";

export function calculateConsistency(contributions: ContributionHistory): AnalyticsConsistency {
  const days = contributions.calendar.weeks.flatMap((w) => w.days);

  let longestStreak = 0;
  let longestStreakStartDate: string | null = null;
  let longestStreakEndDate: string | null = null;

  let currentStreak = 0;
  let currentStreakStartDate: string | null = null;

  let tempStreak = 0;
  let tempStreakStart = "";
  let missedDaysCount = 0;

  const weekActiveMap = new Map<string, boolean>();
  const monthActiveMap = new Map<number, boolean>();

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day) continue;

    const count = day.count;
    const dateStr = day.date;
    const date = new Date(dateStr);
    const weekKey = getYearWeekString(dateStr);
    const month = date.getMonth();

    if (count > 0) {
      weekActiveMap.set(weekKey, true);
      monthActiveMap.set(month, true);

      if (tempStreak === 0) {
        tempStreakStart = dateStr;
      }
      tempStreak++;

      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
        longestStreakStartDate = tempStreakStart;
        longestStreakEndDate = dateStr;
      }
    } else {
      missedDaysCount++;
      tempStreak = 0;
    }
  }

  // Current streak (backward scanner)
  let activeBackward = 0;
  let startedStreak = false;
  let streakStart: string | null = null;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!day) continue;

    if (day.count > 0) {
      activeBackward++;
      startedStreak = true;
      streakStart = day.date;
    } else {
      if (startedStreak) {
        break;
      }
      if (days.length - 1 - i > 1) {
        break;
      }
    }
  }

  if (activeBackward >= ANALYTICS_CONFIG.consistency.minimumStreakLength) {
    currentStreak = activeBackward;
    currentStreakStartDate = streakStart;
  }

  // Weekly consistency: active weeks / total weeks
  const totalWeeks = contributions.calendar.weeks.length || 1;
  const activeWeeksCount = weekActiveMap.size;
  const averageWeeklyConsistency = parseFloat(((activeWeeksCount / totalWeeks) * 100).toFixed(2));

  // Monthly consistency: active months / 12
  const activeMonthsCount = monthActiveMap.size;
  const averageMonthlyConsistency = parseFloat(((activeMonthsCount / 12) * 100).toFixed(2));

  // Consecutive active weeks (max consecutive weeks with at least 1 contribution)
  let maxConsecutiveWeeks = 0;
  let currentConsecutiveWeeks = 0;

  for (const week of contributions.calendar.weeks) {
    const isWeekActive = week.days.some((d) => d.count > 0);
    if (isWeekActive) {
      currentConsecutiveWeeks++;
      if (currentConsecutiveWeeks > maxConsecutiveWeeks) {
        maxConsecutiveWeeks = currentConsecutiveWeeks;
      }
    } else {
      currentConsecutiveWeeks = 0;
    }
  }

  // Consistency Score (0-100): Weighted formula based on total active days, longest streak, and weekly rhythm consistency.
  // 40% active days ratio (target 150 days), 30% weekly consistency, 30% longest streak ratio (target 30 days)
  const activeDaysRatio = Math.min(1, weekActiveMap.size / totalWeeks); // active weeks ratio
  const weeklyRatio = activeWeeksCount / totalWeeks;
  const streakRatio = Math.min(1, longestStreak / 30);

  const rawScore = (activeDaysRatio * 40) + (weeklyRatio * 30) + (streakRatio * 30);
  const consistencyScore = createNormalizedScore(
    rawScore,
    ANALYTICS_CONFIG.consistency.maxConsistencyScore,
    `Calculated from a weekly active ratio of ${averageWeeklyConsistency}% and a longest streak of ${longestStreak} days.`,
  );

  return {
    longestStreak,
    longestStreakStartDate,
    longestStreakEndDate,
    currentStreak,
    currentStreakStartDate,
    averageWeeklyConsistency,
    averageMonthlyConsistency,
    missedDaysCount,
    consecutiveActiveWeeks: maxConsecutiveWeeks,
    consistencyScore,
  };
}
