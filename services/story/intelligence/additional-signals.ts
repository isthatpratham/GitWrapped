import { isAvailable } from "@/domain/models";
import { utcCalendarDate, utcYear } from "@/lib/time/utc";
import type { AnalyticsResult, CommitMessageProfile } from "@/services/analytics";
import { STORY_INTELLIGENCE } from "./constants";
import { recapYearDays } from "./signals";

export interface FinalPushSignal {
  readonly windowStart: string;
  readonly windowEnd: string;
  readonly windowCount: number;
  readonly restAverageDaily: number;
  readonly windowAverageDaily: number;
  readonly yearSharePercent: number;
}

export interface ContributionMilestoneSignal {
  readonly threshold: number;
  readonly crossedOn: string;
  readonly total: number;
}

export interface FirstRepositorySignal {
  readonly name: string;
  readonly ownerName: string;
  readonly createdAt: string;
  readonly url: string | null;
  readonly ownedByUser: boolean;
}

export interface OpenSourceSignal {
  readonly pullRequestCount: number;
  readonly commitCount: number;
  readonly issueCount: number;
  readonly uniqueRepositoryCount: number;
  readonly featuredRepositoryPath: string | null;
}

export interface CommitPersonalitySignal {
  readonly archetype: "fixer" | "builder" | "refactorer" | "final-final" | "keyword";
  readonly keyword: string;
  readonly matchCount: number;
  readonly sampleSize: number;
  readonly sharePercent: number;
}

function lastCalendarDateOfYear(year: number): string {
  return `${year}-12-31`;
}

function addUtcDays(calendarDate: string, delta: number): string {
  const [year, month, day] = calendarDate.split("-").map(Number);
  const date = new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, (day ?? 1) + delta));
  return utcCalendarDate(date.toISOString());
}

export function detectFinalPush(analytics: AnalyticsResult): FinalPushSignal | null {
  if (!isAvailable(analytics.availability.contributions)) return null;

  const days = recapYearDays(analytics).slice().sort((left, right) => left.date.localeCompare(right.date));
  if (days.length === 0) return null;

  const windowEnd = lastCalendarDateOfYear(analytics.year);
  const windowStart = addUtcDays(windowEnd, -(STORY_INTELLIGENCE.finalPushWindowDays - 1));
  const windowDays = days.filter((day) => day.date >= windowStart && day.date <= windowEnd);
  if (windowDays.length === 0) return null;

  const windowCount = windowDays.reduce((sum, day) => sum + day.totalContributions, 0);
  const yearTotal = days.reduce((sum, day) => sum + day.totalContributions, 0);
  const restCount = yearTotal - windowCount;
  if (windowCount < STORY_INTELLIGENCE.finalPushMinContributions) return null;
  if (restCount < STORY_INTELLIGENCE.finalPushMinBaseline) return null;
  if (yearTotal <= 0) return null;

  const restDays = Math.max(1, days.length - windowDays.length);
  const restAverageDaily = restCount / restDays;
  const windowAverageDaily = windowCount / windowDays.length;
  if (restAverageDaily <= 0) return null;
  if (windowAverageDaily < restAverageDaily * STORY_INTELLIGENCE.finalPushMinRatio) return null;

  const yearSharePercent = parseFloat(((windowCount / yearTotal) * 100).toFixed(1));
  if (yearSharePercent < STORY_INTELLIGENCE.finalPushMinShare * 100) return null;

  return {
    windowStart,
    windowEnd,
    windowCount,
    restAverageDaily: parseFloat(restAverageDaily.toFixed(2)),
    windowAverageDaily: parseFloat(windowAverageDaily.toFixed(2)),
    yearSharePercent,
  };
}

export function detectContributionMilestone(analytics: AnalyticsResult): ContributionMilestoneSignal | null {
  if (!isAvailable(analytics.availability.contributions)) return null;

  const days = recapYearDays(analytics).slice().sort((left, right) => left.date.localeCompare(right.date));
  if (days.length === 0) return null;

  let cumulative = 0;
  const crossed = new Map<number, string>();
  for (const day of days) {
    cumulative += day.totalContributions;
    for (const threshold of STORY_INTELLIGENCE.milestoneThresholds) {
      if (!crossed.has(threshold) && cumulative >= threshold) {
        crossed.set(threshold, day.date);
      }
    }
  }

  const reached = [...crossed.entries()].sort((left, right) => right[0] - left[0]);
  const top = reached[0];
  if (!top) return null;
  return {
    threshold: top[0],
    crossedOn: top[1],
    total: cumulative,
  };
}

export function detectFirstRepository(analytics: AnalyticsResult): FirstRepositorySignal | null {
  if (!isAvailable(analytics.availability.repositories)) return null;
  const first = analytics.repositories.firstRepositoryCreatedInYear;
  if (!first) return null;
  if (utcYear(first.createdAt) !== analytics.year) return null;

  return {
    name: first.name,
    ownerName: first.ownerName,
    createdAt: first.createdAt,
    url: first.url,
    ownedByUser: first.ownerName.toLowerCase() === analytics.user.handle.toLowerCase(),
  };
}

export function detectOpenSourceChapter(analytics: AnalyticsResult): OpenSourceSignal | null {
  const external = analytics.externalContributions;
  const prsAvailable = isAvailable(analytics.availability.pullRequests);
  const commitsAvailable = isAvailable(analytics.availability.commitTimestamps) ||
    isAvailable(analytics.availability.contributions);
  if (!prsAvailable && !commitsAvailable) return null;

  const meaningful =
    external.uniqueRepositoryCount >= 1 &&
    (external.commitCount >= STORY_INTELLIGENCE.openSourceMinCommits ||
      (prsAvailable && external.pullRequestCount >= STORY_INTELLIGENCE.openSourceMinPullRequests));
  if (!meaningful) return null;

  return { ...external };
}

function share(count: number, sampleSize: number): number {
  if (sampleSize <= 0) return 0;
  return parseFloat(((count / sampleSize) * 100).toFixed(1));
}

export function classifyCommitPersonality(profile: CommitMessageProfile): CommitPersonalitySignal | null {
  if (profile.sampleSize < STORY_INTELLIGENCE.commitPersonalityMinMessages) return null;

  const candidates: CommitPersonalitySignal[] = [];
  const finalShare = share(profile.final, profile.sampleSize);
  if (
    profile.final >= STORY_INTELLIGENCE.commitPersonalityFinalMinCount &&
    finalShare >= STORY_INTELLIGENCE.commitPersonalityFinalMinShare
  ) {
    candidates.push({
      archetype: "final-final",
      keyword: "final",
      matchCount: profile.final,
      sampleSize: profile.sampleSize,
      sharePercent: finalShare,
    });
  }

  const conventional: Array<["fixer" | "builder" | "refactorer", string, number]> = [
    ["refactorer", "refactor", profile.refactor],
    ["builder", "feat", profile.feat],
    ["fixer", "fix", profile.fix],
  ];
  for (const [archetype, keyword, count] of conventional) {
    const percent = share(count, profile.sampleSize);
    if (percent >= STORY_INTELLIGENCE.commitPersonalityMinShare) {
      candidates.push({
        archetype,
        keyword,
        matchCount: count,
        sampleSize: profile.sampleSize,
        sharePercent: percent,
      });
    }
  }

  const keyword = profile.topKeyword;
  if (
    keyword &&
    keyword.count >= STORY_INTELLIGENCE.commitPersonalityKeywordMinCount &&
    share(keyword.count, profile.sampleSize) >= STORY_INTELLIGENCE.commitPersonalityKeywordMinShare
  ) {
    candidates.push({
      archetype: "keyword",
      keyword: keyword.word,
      matchCount: keyword.count,
      sampleSize: profile.sampleSize,
      sharePercent: share(keyword.count, profile.sampleSize),
    });
  }

  if (candidates.length === 0) return null;
  const rarity: Record<CommitPersonalitySignal["archetype"], number> = {
    "final-final": 0,
    refactorer: 1,
    builder: 2,
    fixer: 3,
    keyword: 4,
  };
  return (
    candidates.sort(
      (left, right) =>
        rarity[left.archetype] - rarity[right.archetype] ||
        right.sharePercent - left.sharePercent ||
        left.keyword.localeCompare(right.keyword),
    )[0] ?? null
  );
}

export function detectCommitPersonality(analytics: AnalyticsResult): CommitPersonalitySignal | null {
  if (!isAvailable(analytics.availability.commitTimestamps) && analytics.activity.commits.totalCount === 0) {
    return null;
  }
  if (analytics.activity.commits.totalCount === 0) return null;
  return classifyCommitPersonality(analytics.activity.commits.messageProfile);
}
