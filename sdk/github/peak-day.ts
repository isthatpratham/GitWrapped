// ---------------------------------------------------------------------------
// Peak contribution day
// ---------------------------------------------------------------------------
// GitHub's contribution calendar gives per-day totals but does NOT associate
// a day with a repository. Yearly `commitContributionsByRepository` is an
// annual ranking, not a per-day attribution.
//
// Peak day date + count: measured from the calendar.
// Peak day repository: attributed from public events on that UTC date —
// fetched commits, pull requests opened, and issues opened. Otherwise null.
//
// Tie-break (documented, deterministic):
// - Peak day: highest count; if tied, the later calendar date (YYYY-MM-DD).
// - Peak day repository: highest event count on that UTC date; if tied,
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

export interface PeakDayActivityEvent {
  readonly at: string;
  readonly repositoryPath: string;
}

/** @deprecated Use PeakDayActivityEvent. Kept for existing commit-only call sites. */
export interface CommitAttributionInput {
  readonly committedDate: string;
  readonly repositoryPath: string;
}

function eventTimestamp(event: PeakDayActivityEvent | CommitAttributionInput): string {
  return "at" in event ? event.at : event.committedDate;
}

export function peakDayEventsFromSources(input: {
  readonly commits?: ReadonlyArray<{ readonly committedDate: string; readonly repositoryPath: string }>;
  readonly pullRequests?: ReadonlyArray<{
    readonly createdAt: string;
    readonly baseRepository: { readonly nameWithOwner: string } | null;
  }>;
  readonly issues?: ReadonlyArray<{
    readonly createdAt: string;
    readonly repository: { readonly nameWithOwner: string };
  }>;
}): PeakDayActivityEvent[] {
  const events: PeakDayActivityEvent[] = [];

  for (const commit of input.commits ?? []) {
    events.push({ at: commit.committedDate, repositoryPath: commit.repositoryPath });
  }
  for (const pullRequest of input.pullRequests ?? []) {
    const path = pullRequest.baseRepository?.nameWithOwner;
    if (path) events.push({ at: pullRequest.createdAt, repositoryPath: path });
  }
  for (const issue of input.issues ?? []) {
    events.push({ at: issue.createdAt, repositoryPath: issue.repository.nameWithOwner });
  }

  return events;
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
 * Attributes the peak calendar day to the repository with the most
 * public events on that UTC date: commits, pull requests opened, and issues opened.
 * Returns null when nothing fetched falls on that date.
 */
export function attributePeakDayRepository(
  peakDate: string,
  events: ReadonlyArray<PeakDayActivityEvent | CommitAttributionInput>,
): string | null {
  const counts = new Map<string, number>();

  for (const event of events) {
    let date: string;
    try {
      date = utcCalendarDate(eventTimestamp(event));
    } catch {
      continue;
    }
    if (date !== peakDate) continue;
    counts.set(event.repositoryPath, (counts.get(event.repositoryPath) ?? 0) + 1);
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
