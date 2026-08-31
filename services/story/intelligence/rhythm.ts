import { isAvailable } from "@/domain/models";
import type { AnalyticsResult } from "@/services/analytics";
import type { DeveloperRhythm } from "../story.types";
import { STORY_INTELLIGENCE } from "./constants";
import { detectComeback } from "./signals";

export interface RhythmClassification {
  readonly rhythm: DeveloperRhythm;
  readonly strength: number;
  readonly reason: string;
}

function candidates(analytics: AnalyticsResult): RhythmClassification[] {
  const result: RhythmClassification[] = [];
  const night = analytics.activity.timeAnalysis.nightOwlScore;
  const languages = analytics.languages.languageDistribution.length;
  const favoriteShare = analytics.languages.favoriteLanguage?.percentage ?? 0;
  const orgs = analytics.organizations.organizationContributionsCount;
  const comeback = detectComeback(analytics);
  const peakWeek = analytics.productivity.mostProductiveWeek?.count ?? 0;
  const avgWeek = analytics.productivity.averageContributionsPerWeek;

  if (isAvailable(analytics.availability.codingHours) && night && night.percentage >= 35) {
    result.push({
      rhythm: "Night Builder",
      strength: Math.min(100, night.percentage + 20),
      reason: `${night.percentage}% of timed commits happened during late hours UTC.`,
    });
  }

  if (comeback) {
    result.push({
      rhythm: "Comeback Builder",
      strength: Math.min(100, 40 + comeback.reboundCount),
      reason: `After ${comeback.quietDays} quiet days, ${comeback.reboundCount} contributions returned in a week.`,
    });
  }

  if (
    analytics.overview.totalContributions >= 30 &&
    analytics.consistency.consecutiveActiveWeeks < 4 &&
    peakWeek >= avgWeek * 3 &&
    avgWeek > 0
  ) {
    result.push({
      rhythm: "Sprint Builder",
      strength: Math.min(100, 35 + peakWeek),
      reason: `Activity concentrated in short bursts, with a peak week of ${peakWeek} contributions.`,
    });
  }

  if (analytics.consistency.activeDaysCount >= 80 || analytics.consistency.averageWeeklyConsistency >= 55) {
    result.push({
      rhythm: "Consistent Builder",
      strength: Math.min(100, analytics.consistency.activeDaysRatio * 100),
      reason: `Contributed on ${analytics.consistency.activeDaysCount} days, with ${analytics.consistency.averageWeeklyConsistency}% of weeks active.`,
    });
  }

  if (isAvailable(analytics.availability.languages) && favoriteShare >= STORY_INTELLIGENCE.specialistPercent) {
    result.push({
      rhythm: "Specialist",
      strength: Math.min(100, favoriteShare),
      reason: `${analytics.languages.favoriteLanguage?.name ?? "One language"} made up ${favoriteShare}% of detected language volume.`,
    });
  }

  if (isAvailable(analytics.availability.languages) && languages >= STORY_INTELLIGENCE.explorerLanguageCount) {
    result.push({
      rhythm: "Explorer",
      strength: Math.min(100, 40 + languages * 8),
      reason: `Detected ${languages} languages across the repository portfolio.`,
    });
  }

  if (
    isAvailable(analytics.availability.organizations) &&
    orgs >= STORY_INTELLIGENCE.openSourceOrgCount
  ) {
    result.push({
      rhythm: "Open Source Builder",
      strength: Math.min(100, 35 + orgs * 10),
      reason: `Public member of ${orgs} GitHub organization${orgs === 1 ? "" : "s"}.`,
    });
  }

  return result;
}

const TIE_ORDER: readonly DeveloperRhythm[] = [
  "Night Builder",
  "Comeback Builder",
  "Sprint Builder",
  "Consistent Builder",
  "Specialist",
  "Explorer",
  "Open Source Builder",
];

/**
 * Picks the strongest valid rhythm, or none when signals are ambiguous/weak.
 */
export function classifyDeveloperRhythm(analytics: AnalyticsResult): RhythmClassification | null {
  if (analytics.overview.totalContributions <= 0) return null;
  const options = candidates(analytics).filter(
    (option) => option.strength >= STORY_INTELLIGENCE.rhythmMinStrength,
  );
  if (options.length === 0) return null;

  options.sort((a, b) => {
    if (b.strength !== a.strength) return b.strength - a.strength;
    return TIE_ORDER.indexOf(a.rhythm) - TIE_ORDER.indexOf(b.rhythm);
  });

  const winner = options[0];
  const runnerUp = options[1];
  if (winner && runnerUp && winner.strength === runnerUp.strength) {
    return winner;
  }
  return winner ?? null;
}
