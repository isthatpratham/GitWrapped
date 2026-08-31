import { isAvailable, type DataAvailability } from "@/domain/models";
import type { AnalyticsResult } from "@/services/analytics";
import { STORY_INTELLIGENCE } from "./constants";
import { deriveStoryAchievements } from "./achievements";
import { classifyDeveloperRhythm } from "./rhythm";
import {
  clampScore,
  detectActivitySpike,
  detectComeback,
  formatCalendarDate,
  languageShift,
  repositoryShare,
} from "./signals";
import type { InsightEvidence, StoryInsight } from "./types";

function insight(partial: StoryInsight): StoryInsight {
  return partial;
}

function measured(analyticsAvailability: DataAvailability): DataAvailability {
  return analyticsAvailability;
}

export function generateStoryInsights(analytics: AnalyticsResult): readonly StoryInsight[] {
  const insights: StoryInsight[] = [];
  const contributionsAvailable = isAvailable(analytics.availability.contributions);

  if (contributionsAvailable) {
    const total = analytics.overview.totalContributions;
    insights.push(
      insight({
        id: "contribution-total",
        kind: "contribution-total",
        family: "year",
        chapter: "YOUR_YEAR",
        slideType: "Overview",
        availability: measured(analytics.availability.contributions),
        strength: clampScore(Math.min(100, total / 8)),
        uniqueness: clampScore(total / 12),
        narrativeValue: total === 0 ? 40 : 80,
        surprise: 0,
        shareable: true,
        heroValue: total,
        evidence: [{ label: "Contributions", value: String(total) }],
        payload: { kind: "contribution-total", total, year: analytics.year },
      }),
    );
  }

  const peak = analytics.productivity.peakContributionDay ?? analytics.productivity.mostProductiveDay;
  if (contributionsAvailable && peak && peak.count > 0) {
    const avg = analytics.productivity.averageContributionsPerDay;
    const ratio = avg > 0 ? peak.count / avg : peak.count;
    insights.push(
      insight({
        id: "peak-day",
        kind: "peak-day",
        family: "peak-day",
        chapter: "YOUR_YEAR",
        slideType: "Contributions",
        availability: analytics.availability.contributions,
        strength: clampScore(20 + peak.count * 2),
        uniqueness: clampScore(ratio * 12),
        narrativeValue: 78,
        surprise: clampScore(ratio * 10),
        shareable: true,
        heroValue: peak.count,
        evidence: [
          { label: "Date", value: formatCalendarDate(peak.date) },
          { label: "Contributions", value: String(peak.count) },
        ],
        payload: {
          kind: "peak-day",
          date: peak.date,
          count: peak.count,
          repositoryPath:
            analytics.productivity.peakContributionDay &&
            isAvailable(analytics.availability.peakDayRepository)
              ? analytics.productivity.peakContributionDay.repositoryPath
              : null,
        },
      }),
    );
  }

  const attributedPeakDay = analytics.productivity.peakContributionDay;
  const attributedPeakRepository = attributedPeakDay?.repositoryPath ?? null;
  if (
    attributedPeakDay &&
    attributedPeakRepository &&
    isAvailable(analytics.availability.peakDayRepository)
  ) {
    insights.push(
      insight({
        id: "peak-repository",
        kind: "peak-repository",
        family: "repository",
        chapter: "YOUR_BUILD",
        slideType: "Repositories",
        availability: analytics.availability.peakDayRepository,
        strength: clampScore(30 + attributedPeakDay.count),
        uniqueness: 55,
        narrativeValue: 70,
        surprise: 20,
        shareable: true,
        heroValue: attributedPeakRepository,
        evidence: [
          { label: "Repository", value: attributedPeakRepository },
          { label: "Peak day", value: formatCalendarDate(attributedPeakDay.date) },
        ],
        payload: {
          kind: "peak-repository",
          repositoryPath: attributedPeakRepository,
          date: attributedPeakDay.date,
          count: attributedPeakDay.count,
        },
      }),
    );
  }

  if (
    contributionsAvailable &&
    analytics.consistency.longestStreak >= STORY_INTELLIGENCE.streakMinDays
  ) {
    insights.push(
      insight({
        id: "longest-streak",
        kind: "longest-streak",
        family: "streak",
        chapter: "YOUR_RHYTHM",
        slideType: "Consistency",
        availability: analytics.availability.contributions,
        strength: clampScore(30 + analytics.consistency.longestStreak * 3),
        uniqueness: clampScore(analytics.consistency.longestStreak * 2),
        narrativeValue: 75,
        surprise: analytics.consistency.longestStreak >= 21 ? 40 : 10,
        shareable: true,
        heroValue: analytics.consistency.longestStreak,
        evidence: [
          { label: "Longest streak", value: `${analytics.consistency.longestStreak} days` },
          { label: "Active days", value: String(analytics.consistency.activeDaysCount) },
        ],
        payload: {
          kind: "longest-streak",
          days: analytics.consistency.longestStreak,
          startDate: analytics.consistency.longestStreakStartDate,
          endDate: analytics.consistency.longestStreakEndDate,
          activeDays: analytics.consistency.activeDaysCount,
        },
      }),
    );
  }

  const night = analytics.activity.timeAnalysis.nightOwlScore;
  const hour = analytics.activity.timeAnalysis.mostActiveHour;
  const session = analytics.activity.timeAnalysis.preferredCodingSession;
  if (
    isAvailable(analytics.availability.codingHours) &&
    night &&
    hour !== null &&
    session &&
    night.percentage >= STORY_INTELLIGENCE.nightActivityPercent
  ) {
    insights.push(
      insight({
        id: "night-activity",
        kind: "night-activity",
        family: "coding-time",
        chapter: "YOUR_RHYTHM",
        slideType: "Productivity",
        availability: analytics.availability.codingHours,
        strength: clampScore(night.percentage),
        uniqueness: clampScore(night.percentage),
        narrativeValue: 82,
        surprise: clampScore(night.percentage - 20),
        shareable: true,
        heroValue: `${hour}:00`,
        evidence: [
          { label: "Night share", value: `${night.percentage}%` },
          { label: "Most active hour UTC", value: `${hour}:00` },
        ],
        payload: {
          kind: "night-activity",
          percentage: night.percentage,
          mostActiveHour: hour,
          session,
        },
      }),
    );
  }

  const weekend = analytics.activity.timeAnalysis.weekendActivity;
  if (
    isAvailable(analytics.availability.codingHours) &&
    weekend !== null &&
    weekend >= STORY_INTELLIGENCE.weekendUnusualPercent
  ) {
    insights.push(
      insight({
        id: "weekend-activity",
        kind: "weekend-activity",
        family: "coding-time",
        chapter: "YOUR_RHYTHM",
        slideType: "Productivity",
        availability: analytics.availability.codingHours,
        strength: clampScore(weekend),
        uniqueness: clampScore(weekend),
        narrativeValue: 70,
        surprise: clampScore(weekend),
        shareable: true,
        heroValue: `${weekend}%`,
        evidence: [{ label: "Weekend share", value: `${weekend}% of timed commits` }],
        payload: { kind: "weekend-activity", percentage: weekend },
      }),
    );
  }

  if (
    analytics.overview.totalContributions > 0 &&
    isAvailable(analytics.availability.languages) &&
    analytics.languages.favoriteLanguage &&
    analytics.languages.favoriteLanguage.percentage >= STORY_INTELLIGENCE.languageDominancePercent
  ) {
    const favorite = analytics.languages.favoriteLanguage;
    insights.push(
      insight({
        id: "language-dominance",
        kind: "language-dominance",
        family: "language",
        chapter: "YOUR_BUILD",
        slideType: "Languages",
        availability: analytics.availability.languages,
        strength: clampScore(favorite.percentage),
        uniqueness: clampScore(favorite.percentage - 20),
        narrativeValue: 80,
        surprise: favorite.percentage >= 75 ? 35 : 10,
        shareable: true,
        heroValue: favorite.name,
        evidence: [
          { label: "Language", value: favorite.name },
          { label: "Detected volume", value: `${favorite.percentage}%` },
        ],
        payload: {
          kind: "language-dominance",
          name: favorite.name,
          color: favorite.color,
          percentage: favorite.percentage,
          totalBytes: favorite.totalBytes,
        },
      }),
    );
  }

  const shift = languageShift(analytics);
  if (shift && analytics.overview.totalContributions > 0) {
    insights.push(
      insight({
        id: "language-evolution",
        kind: "language-evolution",
        family: "language",
        chapter: "YOUR_BUILD",
        slideType: "Languages",
        availability: analytics.availability.languages,
        strength: 62,
        uniqueness: 72,
        narrativeValue: 76,
        surprise: 55,
        shareable: true,
        heroValue: shift.toLanguage,
        evidence: [
          { label: "Earlier primary", value: shift.fromLanguage },
          { label: "This year", value: shift.toLanguage },
        ],
        payload: {
          kind: "language-evolution",
          fromLanguage: shift.fromLanguage,
          toLanguage: shift.toLanguage,
          recapYear: analytics.year,
        },
      }),
    );
  }

  const concentration = repositoryShare(analytics);
  if (concentration && isAvailable(analytics.availability.repositories)) {
    insights.push(
      insight({
        id: "repository-concentration",
        kind: "repository-concentration",
        family: "repository",
        chapter: "YOUR_BUILD",
        slideType: "Repositories",
        availability: analytics.availability.repositories,
        strength: clampScore(concentration.sharePercent),
        uniqueness: clampScore(concentration.sharePercent),
        narrativeValue: 77,
        surprise: concentration.sharePercent >= 60 ? 40 : 15,
        shareable: true,
        heroValue: concentration.repositoryName,
        evidence: [
          { label: "Repository", value: concentration.repositoryName },
          { label: "Commit share", value: `${concentration.sharePercent}%` },
        ],
        payload: { kind: "repository-concentration", ...concentration },
      }),
    );
  }

  if (
    contributionsAvailable &&
    analytics.productivity.productivityTrend === "UPWARD" &&
    analytics.productivity.contributionMomentum >= STORY_INTELLIGENCE.momentumUpwardRatio &&
    analytics.overview.totalContributions > 0
  ) {
    insights.push(
      insight({
        id: "monthly-growth",
        kind: "monthly-growth",
        family: "momentum",
        chapter: "YOUR_YEAR",
        slideType: "Timeline",
        availability: analytics.availability.contributions,
        strength: clampScore(analytics.productivity.contributionMomentum * 40),
        uniqueness: 48,
        narrativeValue: 68,
        surprise: 25,
        shareable: false,
        heroValue: analytics.productivity.mostProductiveMonth?.monthName ?? null,
        evidence: [
          { label: "Trend", value: analytics.productivity.productivityTrend },
          { label: "Q4/Q1 momentum", value: String(analytics.productivity.contributionMomentum) },
        ],
        payload: {
          kind: "monthly-growth",
          trend: analytics.productivity.productivityTrend,
          momentum: analytics.productivity.contributionMomentum,
          peakMonthName: analytics.productivity.mostProductiveMonth?.monthName ?? "the year",
        },
      }),
    );
  }

  const comeback = detectComeback(analytics);
  if (contributionsAvailable && comeback) {
    insights.push(
      insight({
        id: "comeback",
        kind: "comeback",
        family: "comeback",
        chapter: "MILESTONES",
        slideType: "Highlights",
        availability: analytics.availability.contributions,
        strength: clampScore(35 + comeback.reboundCount),
        uniqueness: 74,
        narrativeValue: 84,
        surprise: 70,
        shareable: true,
        heroValue: comeback.reboundCount,
        evidence: [
          { label: "Quiet stretch", value: `${comeback.quietDays} days` },
          { label: "Rebound week", value: String(comeback.reboundCount) },
        ],
        payload: { kind: "comeback", ...comeback },
      }),
    );
  }

  const spike = detectActivitySpike(analytics);
  if (contributionsAvailable && spike && peak?.date !== spike.date) {
    insights.push(
      insight({
        id: "activity-spike",
        kind: "activity-spike",
        family: "anomaly",
        chapter: "MILESTONES",
        slideType: "Contributions",
        availability: analytics.availability.contributions,
        strength: clampScore(25 + spike.count),
        uniqueness: clampScore((spike.count / Math.max(0.1, spike.average)) * 15),
        narrativeValue: 66,
        surprise: 68,
        shareable: true,
        heroValue: spike.count,
        evidence: [
          { label: "Date", value: formatCalendarDate(spike.date) },
          { label: "That day", value: String(spike.count) },
          { label: "Typical active day", value: String(spike.average) },
        ],
        payload: { kind: "activity-spike", ...spike },
      }),
    );
  }

  const rhythm = classifyDeveloperRhythm(analytics);
  if (rhythm) {
    insights.push(
      insight({
        id: "developer-rhythm",
        kind: "developer-rhythm",
        family: "rhythm",
        chapter: "REFLECTION",
        slideType: "Highlights",
        availability: analytics.availability.contributions,
        strength: clampScore(rhythm.strength),
        uniqueness: 50,
        narrativeValue: 72,
        surprise: 15,
        shareable: false,
        heroValue: rhythm.rhythm,
        evidence: [{ label: "Why", value: rhythm.reason }],
        payload: { kind: "developer-rhythm", rhythm: rhythm.rhythm, reason: rhythm.reason },
      }),
    );
  }

  const achievements = deriveStoryAchievements(analytics);
  if (achievements.length > 0) {
    insights.push(
      insight({
        id: "achievements",
        kind: "achievements",
        family: "achievement",
        chapter: "MILESTONES",
        slideType: "Achievements",
        availability: analytics.availability.contributions,
        strength: clampScore(30 + achievements.length * 12),
        uniqueness: 40,
        narrativeValue: 60,
        surprise: 10,
        shareable: true,
        heroValue: achievements.length,
        evidence: achievements.map((item) => ({ label: item.title, value: item.reason })),
        payload: { kind: "achievements", achievements },
      }),
    );
  }

  if (
    isAvailable(analytics.availability.organizations) &&
    analytics.organizations.organizationContributionsCount > 0 &&
    analytics.organizations.mostActiveOrganization
  ) {
    const featured = analytics.organizations.mostActiveOrganization;
    insights.push(
      insight({
        id: "organizations",
        kind: "organizations",
        family: "organization",
        chapter: "YOUR_BUILD",
        slideType: "Organizations",
        availability: analytics.availability.organizations,
        strength: clampScore(25 + analytics.organizations.organizationContributionsCount * 8),
        uniqueness: 35,
        narrativeValue: 50,
        surprise: 0,
        shareable: false,
        heroValue: analytics.organizations.organizationContributionsCount,
        evidence: [
          { label: "Public memberships", value: String(analytics.organizations.organizationContributionsCount) },
        ],
        payload: {
          kind: "organizations",
          count: analytics.organizations.organizationContributionsCount,
          featuredHandle: featured.handle,
          featuredName: featured.displayName,
        },
      }),
    );
  }

  return insights;
}

export type { InsightEvidence };
