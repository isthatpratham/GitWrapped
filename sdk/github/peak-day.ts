// ---------------------------------------------------------------------------
// Peak contribution day
// ---------------------------------------------------------------------------
// GitHub's contribution calendar gives per-day totals but does NOT associate
// a day with a repository. Yearly `commitContributionsByRepository` is an
// annual ranking, not a per-day attribution.
//
// Peak day date + count: measured from the calendar.
// Peak day repository: attributed from real commit timestamps on that UTC
// date when commits were fetched. Otherwise null (unavailable).
//
// Tie-break (documented, deterministic):
// - Peak day: highest count; if tied, the later calendar date (YYYY-MM-DD).
// - Peak day repository: highest commit count on that UTC date; if tied,
//   lexicographically smaller repository path.
// ---------------------------------------------------------------------------

import { utcCalendarDate } from "@/lib/time/utc";

export interface PeakDayCandidate {
  readonly date: string;
  readonly contributionCount: number;
}

export interface PeakContributionDayResult {
  readonly date: string;
  readonly commitCount: number;
  readonly repositoryPath: string | null;
}

export interface CommitAttributionInput {
  readonly committedDate: string;
  readonly repositoryPath: string;
}

export function selectPeakContributionDay(
  days: ReadonlyArray<PeakDayCandidate>,
): PeakContributionDayResult | null {
  let peak: PeakDayCandidate | null = null;

  for (const day of days) {
    if (day.contributionCount <= 0) continue;
    if (
      peak === null ||
      day.contributionCount > peak.contributionCount ||
      (day.contributionCount === peak.contributionCount && day.date > peak.date)
    ) {
      peak = day;
    }
  }

  if (peak === null) return null;

  return {
    date: peak.date,
    commitCount: peak.contributionCount,
    repositoryPath: null,
  };
}

/**
 * Attributes the peak calendar day to the repository with the most commits
 * on that UTC date. Returns null when no fetched commits fall on that date.
 */
export function attributePeakDayRepository(
  peakDate: string,
  commits: ReadonlyArray<CommitAttributionInput>,
): string | null {
  const counts = new Map<string, number>();

  for (const commit of commits) {
    let date: string;
    try {
      date = utcCalendarDate(commit.committedDate);
    } catch {
      continue;
    }
    if (date !== peakDate) continue;
    counts.set(commit.repositoryPath, (counts.get(commit.repositoryPath) ?? 0) + 1);
  }

  if (counts.size === 0) return null;

  let winnerPath: string | null = null;
  let winnerCount = -1;

  for (const [path, count] of counts) {
    if (
      count > winnerCount ||
      (count === winnerCount && winnerPath !== null && path < winnerPath)
    ) {
      winnerCount = count;
      winnerPath = path;
    }
  }

  return winnerPath;
}
