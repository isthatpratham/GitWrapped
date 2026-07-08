// ---------------------------------------------------------------------------
// Analytics Engine — Utilities
// ---------------------------------------------------------------------------
// Pure helper functions for calculations, date grouping, and normalization.
// ---------------------------------------------------------------------------

import type { NormalizedScore } from "./analytics.types";

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
  const date = new Date(dateString);
  const month = date.getMonth(); // 0-11
  return Math.floor(month / 3) + 1;
}

/**
 * Groups date strings by ISO-8601 week number.
 * Returns a key in format "YYYY-WW" (e.g. "2024-27").
 */
export function getYearWeekString(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();

  // Find Sunday of this week
  const day = date.getDay();
  const diff = date.getDate() - day;
  const sunday = new Date(date.setDate(diff));

  const startOfYear = new Date(year, 0, 1);
  const days = Math.floor((sunday.getTime() - startOfYear.getTime()) / (24 * 60 * 60 * 1000));
  const weekNumber = Math.max(1, Math.ceil((days + 1) / 7));

  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
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
