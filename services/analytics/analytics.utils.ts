// ---------------------------------------------------------------------------
// Analytics Engine — Utilities
// ---------------------------------------------------------------------------
// Pure helper functions for calculations, date grouping, and normalization.
// ---------------------------------------------------------------------------

import type { NormalizedScore } from "./analytics.types";
import { utcQuarter, utcYearWeekString } from "@/lib/time/utc";

/**
 * Calculates a normalised rating score.
 * Ensures the value is clamped between 0 and maximum.
 *
 * @param value - The raw input score.
 * @param maximum - The target maximum value.
 * @param description - High-level description of this score.
 */
export function createNormalizedScore(
  value: number,
  maximum: number,
  description: string,
): NormalizedScore {
  const clampedValue = Math.max(0, Math.min(value, maximum));
  const percentage = maximum > 0 ? Math.round((clampedValue / maximum) * 100) : 0;

  return {
    value: parseFloat(clampedValue.toFixed(2)),
    maximum,
    percentage,
    description,
  };
}

/**
 * Parses a date string and returns its quarter index (1-4).
 */
export function getQuarter(dateString: string): number {
  return utcQuarter(dateString);
}

/**
 * Groups date strings by GitHub contribution week in UTC.
 * Returns a key in format "YYYY-Www".
 */
export function getYearWeekString(dateString: string): string {
  return utcYearWeekString(dateString);
}

/**
 * Month name helper.
 */
export const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

/**
 * Day name helper.
 */
export const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;
