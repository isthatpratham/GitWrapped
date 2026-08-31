import { isAvailable } from "@/domain/models";
import { isCalendarDateInYear } from "@/lib/time/utc";
import type { AnalyticsResult } from "@/services/analytics";
import { MONTH_NAMES } from "@/services/analytics/analytics.utils";
import { STORY_INTELLIGENCE } from "./constants";

export function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function formatCalendarDate(calendarDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(calendarDate);
  if (!match) return calendarDate;
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);
  const monthName = MONTH_NAMES[monthIndex];
  if (!monthName) return calendarDate;
  return `${monthName} ${day}`;
}

export function recapYearDays(analytics: AnalyticsResult) {
  return analytics.timeline.daily.filter((day) => isCalendarDateInYear(day.date, analytics.year));
}

export function meanPositive(values: ReadonlyArray<number>): number {
  const positive = values.filter((value) => value > 0);
  if (positive.length === 0) return 0;
  return positive.reduce((sum, value) => sum + value, 0) / positive.length;
}

export interface ComebackSignal {
  readonly quietDays: number;
  readonly reboundCount: number;
  readonly reboundStart: string;
}

export function detectComeback(analytics: AnalyticsResult): ComebackSignal | null {
  const days = recapYearDays(analytics);
  if (days.length === 0) return null;

  const total = days.reduce((sum, day) => sum + day.totalContributions, 0);
  if (total < STORY_INTELLIGENCE.comebackReboundMin) return null;

  const averageWeekly = (total / Math.max(1, days.length)) * 7;
  const reboundFloor = Math.max(
    STORY_INTELLIGENCE.comebackReboundMin,
    Math.round(averageWeekly * 1.5),
  );

  let quietRun = 0;
  let best: ComebackSignal | null = null;

  for (let i = 0; i < days.length; i += 1) {
    const day = days[i];
    if (!day) continue;

    if (day.totalContributions === 0) {
      quietRun += 1;
      continue;
    }

    if (quietRun >= STORY_INTELLIGENCE.comebackQuietDays) {
      const window = days.slice(i, i + 7);
      const reboundCount = window.reduce((sum, item) => sum + item.totalContributions, 0);
      if (
        reboundCount >= reboundFloor &&
        (best === null ||
          reboundCount > best.reboundCount ||
          (reboundCount === best.reboundCount && day.date > best.reboundStart))
      ) {
        best = {
          quietDays: quietRun,
          reboundCount,
          reboundStart: day.date,
        };
      }
    }
    quietRun = 0;
  }

  return best;
}

export function detectActivitySpike(analytics: AnalyticsResult): {
  readonly date: string;
  readonly count: number;
  readonly average: number;
} | null {
  const days = recapYearDays(analytics);
  const counts = days.map((day) => day.totalContributions);
  const average = meanPositive(counts);
  if (average <= 0) return null;

  const threshold = Math.max(
    STORY_INTELLIGENCE.spikeAbsoluteFloor,
    average * STORY_INTELLIGENCE.spikeMultiplier,
  );

  let spike: { date: string; count: number } | null = null;
  for (const day of days) {
    if (day.totalContributions < threshold) continue;
    if (
      spike === null ||
      day.totalContributions > spike.count ||
      (day.totalContributions === spike.count && day.date > spike.date)
    ) {
      spike = { date: day.date, count: day.totalContributions };
    }
  }

  return spike ? { ...spike, average: parseFloat(average.toFixed(2)) } : null;
}

export function languageShift(analytics: AnalyticsResult): {
  readonly fromLanguage: string;
  readonly toLanguage: string;
} | null {
  if (!isAvailable(analytics.availability.languages)) return null;
  const favorite = analytics.languages.favoriteLanguage;
  if (!favorite) return null;

  const prior = analytics.languages.languageEvolution
    .filter((entry) => entry.year < analytics.year)
    .sort((a, b) => b.year - a.year || b.bytesAdded - a.bytesAdded);

  const previous = prior[0];
  if (!previous) return null;
  if (previous.primaryLanguage === favorite.name) return null;
  if (favorite.percentage < STORY_INTELLIGENCE.languageEvolutionMinShare) return null;

  return { fromLanguage: previous.primaryLanguage, toLanguage: favorite.name };
}

export function repositoryShare(analytics: AnalyticsResult): {
  readonly repositoryName: string;
  readonly commitCount: number;
  readonly sharePercent: number;
  readonly owned: boolean;
} | null {
  const mostActive = analytics.repositories.mostActiveRepository;
  const totalCommits = analytics.overview.totalCommits;
  if (!mostActive || totalCommits <= 0) return null;

  const sharePercent = parseFloat(((mostActive.commitCount / totalCommits) * 100).toFixed(1));
  if (sharePercent < STORY_INTELLIGENCE.repositoryConcentrationPercent) return null;

  const owned = analytics.repositories.favoriteRepository
    ? `${analytics.repositories.favoriteRepository.ownerName}/${analytics.repositories.favoriteRepository.name}` ===
        mostActive.name || analytics.repositories.favoriteRepository.name === mostActive.name
    : false;

  return {
    repositoryName: mostActive.name,
    commitCount: mostActive.commitCount,
    sharePercent,
    owned,
  };
}
