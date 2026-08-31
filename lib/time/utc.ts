// ---------------------------------------------------------------------------
// Time policy — UTC only
// ---------------------------------------------------------------------------
// GitWrapped has no reliable user timezone (no OAuth profile tz, no browser
// tz on the server). All hour-of-day, day-of-week, and calendar-year
// analytics therefore interpret timestamps in UTC.
//
// Calendar dates from GitHub's contribution calendar are already `YYYY-MM-DD`
// strings with no time component. Compare them as strings. Do not parse them
// with `new Date("YYYY-MM-DD")` and then read local getHours()/getMonth(),
// which is timezone-dependent and non-deterministic across servers.
// ---------------------------------------------------------------------------

const CALENDAR_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/**
 * Returns the UTC calendar date (`YYYY-MM-DD`) for an ISO-8601 timestamp.
 */
export function utcCalendarDate(isoTimestamp: string): string {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid ISO-8601 timestamp");
  }
  const year = date.getUTCFullYear().toString().padStart(4, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0");
  const day = date.getUTCDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Parses a GitHub contribution calendar day (`YYYY-MM-DD`) as UTC midnight.
 * Returns null when the string is not a calendar date.
 */
export function parseCalendarDateUtc(calendarDate: string): Date | null {
  const match = CALENDAR_DATE.exec(calendarDate);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** UTC hour (0–23) from an ISO timestamp. Null if unparseable. */
export function utcHour(isoTimestamp: string): number | null {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCHours();
}

/** UTC weekday (0 = Sunday … 6 = Saturday). Null if unparseable. */
export function utcWeekday(isoTimestamp: string): number | null {
  const date = new Date(isoTimestamp);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCDay();
}

/** UTC month index (0–11) from a calendar date or ISO timestamp. */
export function utcMonthIndex(dateString: string): number | null {
  if (CALENDAR_DATE.test(dateString)) {
    const parsed = parseCalendarDateUtc(dateString);
    return parsed ? parsed.getUTCMonth() : null;
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCMonth();
}

/** UTC calendar year from a calendar date or ISO timestamp. */
export function utcYear(dateString: string): number | null {
  if (CALENDAR_DATE.test(dateString)) {
    const parsed = parseCalendarDateUtc(dateString);
    return parsed ? parsed.getUTCFullYear() : null;
  }
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return null;
  return date.getUTCFullYear();
}

/**
 * Inclusive UTC year window used for GitHub `from` / `to` arguments.
 */
export function utcYearRange(year: number): { from: string; to: string } {
  return {
    from: `${year}-01-01T00:00:00.000Z`,
    to: `${year}-12-31T23:59:59.999Z`,
  };
}

/**
 * True when a calendar date belongs to the given UTC year.
 * GitHub contribution weeks pad with days from adjacent years.
 */
export function isCalendarDateInYear(calendarDate: string, year: number): boolean {
  return calendarDate.startsWith(`${year}-`);
}

/**
 * ISO-8601 week key derived in UTC so grouping is server-timezone independent.
 * Format: `YYYY-Www` (week 01 contains the first Thursday logic is not used;
 * weeks are Sunday-start to match GitHub's contribution calendar).
 */
export function utcYearWeekString(dateString: string): string {
  const calendarDate = CALENDAR_DATE.test(dateString)
    ? dateString
    : utcCalendarDateSafe(dateString) ?? dateString;
  const parsed = parseCalendarDateUtc(calendarDate);
  if (!parsed) return calendarDate;
  const year = parsed.getUTCFullYear();
  const weekday = parsed.getUTCDay();
  const sunday = new Date(parsed);
  sunday.setUTCDate(parsed.getUTCDate() - weekday);
  const startOfYear = new Date(Date.UTC(year, 0, 1));
  const days = Math.floor((sunday.getTime() - startOfYear.getTime()) / 86_400_000);
  const weekNumber = Math.max(1, Math.ceil((days + 1) / 7));
  return `${year}-W${weekNumber.toString().padStart(2, "0")}`;
}

export function utcQuarter(dateString: string): number {
  const month = utcMonthIndex(dateString);
  if (month === null) return 1;
  return Math.floor(month / 3) + 1;
}

function utcCalendarDateSafe(isoTimestamp: string): string | null {
  try {
    return utcCalendarDate(isoTimestamp);
  } catch {
    return null;
  }
}
