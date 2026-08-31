import type { DataAvailability } from "@/domain/models";
import type { DeveloperRhythm, StoryChapter, StorySlideType } from "../story.types";

export type InsightKind =
  | "contribution-total"
  | "longest-streak"
  | "peak-day"
  | "peak-repository"
  | "most-starred-repository"
  | "night-activity"
  | "weekend-activity"
  | "language-dominance"
  | "language-evolution"
  | "repository-concentration"
  | "monthly-growth"
  | "comeback"
  | "final-push"
  | "contribution-milestone"
  | "first-repository"
  | "open-source"
  | "commit-personality"
  | "activity-spike"
  | "developer-rhythm"
  | "achievements"
  | "organizations";

export type InsightFamily =
  | "year"
  | "streak"
  | "peak-day"
  | "coding-time"
  | "language"
  | "repository"
  | "most-starred"
  | "momentum"
  | "comeback"
  | "final-push"
  | "contribution-milestone"
  | "first-repository"
  | "open-source"
  | "commit-voice"
  | "achievement"
  | "organization"
  | "rhythm"
  | "anomaly";

export interface InsightEvidence {
  readonly label: string;
  readonly value: string;
}

export type InsightPayload =
  | { readonly kind: "contribution-total"; readonly total: number; readonly year: number }
  | {
      readonly kind: "longest-streak";
      readonly days: number;
      readonly startDate: string | null;
      readonly endDate: string | null;
      readonly activeDays: number;
    }
  | {
      readonly kind: "peak-day";
      readonly date: string;
      readonly count: number;
      readonly repositoryPath: string | null;
    }
  | {
      readonly kind: "peak-repository";
      readonly repositoryPath: string;
      readonly date: string;
      readonly count: number;
      readonly ownerName: string;
      readonly name: string;
      readonly starCount: number | null;
      readonly url: string | null;
    }
  | {
      readonly kind: "most-starred-repository";
      readonly ownerName: string;
      readonly name: string;
      readonly starCount: number;
      readonly url: string;
    }
  | {
      readonly kind: "night-activity";
      readonly percentage: number;
      readonly mostActiveHour: number;
      readonly session: "MORNING" | "AFTERNOON" | "EVENING" | "NIGHT";
    }
  | {
      readonly kind: "weekend-activity";
      readonly percentage: number;
    }
  | {
      readonly kind: "language-dominance";
      readonly name: string;
      readonly color: string | null;
      readonly percentage: number;
      readonly totalBytes: number;
    }
  | {
      readonly kind: "language-evolution";
      readonly fromLanguage: string;
      readonly toLanguage: string;
      readonly recapYear: number;
    }
  | {
      readonly kind: "repository-concentration";
      readonly repositoryName: string;
      readonly commitCount: number;
      readonly sharePercent: number;
      readonly owned: boolean;
    }
  | {
      readonly kind: "monthly-growth";
      readonly trend: "UPWARD" | "DOWNWARD" | "STABLE";
      readonly momentum: number;
      readonly peakMonthName: string;
    }
  | {
      readonly kind: "comeback";
      readonly quietDays: number;
      readonly reboundCount: number;
      readonly reboundStart: string;
      readonly typicalWeekly: number;
    }
  | {
      readonly kind: "final-push";
      readonly windowStart: string;
      readonly windowEnd: string;
      readonly windowCount: number;
      readonly restAverageDaily: number;
      readonly windowAverageDaily: number;
      readonly yearSharePercent: number;
    }
  | {
      readonly kind: "contribution-milestone";
      readonly threshold: number;
      readonly crossedOn: string;
      readonly total: number;
    }
  | {
      readonly kind: "first-repository";
      readonly name: string;
      readonly ownerName: string;
      readonly createdAt: string;
      readonly url: string | null;
      readonly ownedByUser: boolean;
    }
  | {
      readonly kind: "open-source";
      readonly pullRequestCount: number;
      readonly commitCount: number;
      readonly issueCount: number;
      readonly uniqueRepositoryCount: number;
      readonly featuredRepositoryPath: string | null;
    }
  | {
      readonly kind: "commit-personality";
      readonly archetype: "fixer" | "builder" | "refactorer" | "final-final" | "keyword";
      readonly keyword: string;
      readonly matchCount: number;
      readonly sampleSize: number;
      readonly sharePercent: number;
    }
  | {
      readonly kind: "activity-spike";
      readonly date: string;
      readonly count: number;
      readonly average: number;
    }
  | {
      readonly kind: "developer-rhythm";
      readonly rhythm: DeveloperRhythm;
      readonly reason: string;
    }
  | {
      readonly kind: "achievements";
      readonly achievements: ReadonlyArray<{ readonly id: string; readonly title: string; readonly reason: string }>;
    }
  | {
      readonly kind: "organizations";
      readonly count: number;
      readonly featuredHandle: string;
      readonly featuredName: string | null;
    };

export interface StoryInsight {
  readonly id: string;
  readonly kind: InsightKind;
  readonly family: InsightFamily;
  readonly chapter: StoryChapter;
  readonly slideType: StorySlideType;
  readonly availability: DataAvailability;
  readonly strength: number;
  readonly uniqueness: number;
  readonly narrativeValue: number;
  readonly surprise: number;
  readonly shareable: boolean;
  readonly heroValue: string | number | null;
  readonly evidence: readonly InsightEvidence[];
  readonly payload: InsightPayload;
}

export interface RankedInsight extends StoryInsight {
  readonly rankScore: number;
}

export const CHAPTER_ORDER: readonly StoryChapter[] = [
  "OPENING",
  "YOUR_YEAR",
  "YOUR_RHYTHM",
  "YOUR_BUILD",
  "MILESTONES",
  "REFLECTION",
  "FINALE",
] as const;

export const CHAPTER_TITLES: Record<StoryChapter, string> = {
  OPENING: "Opening",
  YOUR_YEAR: "Your Year",
  YOUR_RHYTHM: "Your Rhythm",
  YOUR_BUILD: "Your Build",
  MILESTONES: "Milestones",
  REFLECTION: "Reflection",
  FINALE: "Finale",
};
