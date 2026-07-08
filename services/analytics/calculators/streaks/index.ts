// ---------------------------------------------------------------------------
// Calculator: Streaks
// ---------------------------------------------------------------------------
// Calculates longest streak, current streak, and active days.
// ---------------------------------------------------------------------------

import type { ContributionHistory } from "@/domain/models";
import type { StreakAnalytics } from "@/domain/models";
import { ANALYTICS_CONFIG } from "@/services/analytics/analytics.constants";

export function calculateStreaks(contributions: ContributionHistory): StreakAnalytics {
  const days = contributions.calendar.weeks.flatMap((w) => w.days);

  let longestStreakDays = 0;
  let longestStreakStartDate = "";
  let longestStreakEndDate = "";

  let currentStreakDays = 0;
  let currentStreakStartDate: string | null = null;

  let tempStreakDays = 0;
  let tempStreakStart = "";

  let totalActiveDays = 0;

  for (let i = 0; i < days.length; i++) {
    const day = days[i];
    if (!day) continue;

    if (day.count > 0) {
      totalActiveDays++;
      if (tempStreakDays === 0) {
        tempStreakStart = day.date;
      }
      tempStreakDays++;

      if (tempStreakDays > longestStreakDays) {
        longestStreakDays = tempStreakDays;
        longestStreakStartDate = tempStreakStart;
        longestStreakEndDate = day.date;
      }
    } else {
      tempStreakDays = 0;
    }
  }

  // Calculate current streak. Let's look at the days backwards.
  // The current streak can be active if there is activity today or yesterday.
  // We assume the last day of the calendar is the reference point (e.g. Dec 31).
  // Let's check from the end of the array backwards.
  let runningStreak = 0;
  let streakStart: string | null = null;
  const today = new Date().toISOString().split("T")[0];

  // We walk backwards from the end of the calendar.
  let activeBackwardStreak = 0;
  let startedStreak = false;

  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!day) continue;

    if (day.count > 0) {
      activeBackwardStreak++;
      if (!startedStreak) {
        startedStreak = true;
      }
      streakStart = day.date;
    } else {
      // If we already had streak days, we stop.
      // But wait! If the user was active yesterday but not today, is the current streak still active?
      // Yes, if we're scanning backwards and the first few days (today, yesterday) had at least one active day.
      // If we hit a zero day after active days, we break.
      if (startedStreak) {
        break;
      }
      // If we haven't seen any active day yet, and we are further than 1 day from the end, then current streak is 0.
      if (days.length - 1 - i > 1) {
        // More than 1 day of inactivity at the end of the year/data.
        break;
      }
    }
  }

  if (activeBackwardStreak >= ANALYTICS_CONFIG.consistency.minimumStreakLength) {
    currentStreakDays = activeBackwardStreak;
    currentStreakStartDate = streakStart;
  } else {
    currentStreakDays = 0;
    currentStreakStartDate = null;
  }

  return {
    longestStreakDays,
    longestStreakStartDate: longestStreakStartDate || "",
    longestStreakEndDate: longestStreakEndDate || "",
    currentStreakDays,
    currentStreakStartDate,
    totalActiveDays,
  };
}
