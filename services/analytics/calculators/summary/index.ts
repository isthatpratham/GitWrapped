// ---------------------------------------------------------------------------
// Calculator: Summary
// ---------------------------------------------------------------------------
// Synthesizes top metrics, achievements, and timelines into human-readable
// summaries, highlights, share statistics, and interesting facts.
// ---------------------------------------------------------------------------

import type { AnalyticsSummary } from "@/services/analytics/analytics.types";

interface SummaryInputs {
  readonly handle: string;
  readonly totalContributions: number;
  readonly commitCount: number;
  readonly prCount: number;
  readonly issueCount: number;
  readonly longestStreak: number;
  readonly favoriteLanguageName: string | null;
  readonly achievementCount: number;
  readonly publicRepos: number;
}

export function calculateSummary(inputs: SummaryInputs): AnalyticsSummary {
  const {
    totalContributions,
    commitCount,
    prCount,
    issueCount,
    longestStreak,
    favoriteLanguageName,
    achievementCount,
    publicRepos,
  } = inputs;

  const highlights: string[] = [];
  const interestingFacts: string[] = [];
  const bestMoments: Array<{ title: string; value: string; subtitle: string }> = [];

  // Generate highlights
  if (totalContributions > 500) {
    highlights.push("Supercharged coding year: Crossed 500 total contributions!");
  } else if (totalContributions > 100) {
    highlights.push("Steady year: Logged over 100 coding contributions!");
  }

  if (longestStreak >= 10) {
    highlights.push(`Consistency master: Maintained a streak of ${longestStreak} straight days!`);
  }

  if (favoriteLanguageName) {
    highlights.push(`Language champion: Focused heavily on building with ${favoriteLanguageName}.`);
  }

  // Generate interesting facts
  interestingFacts.push(`On average, you made ${parseFloat((totalContributions / 365).toFixed(2))} contributions per day.`);
  if (prCount > 0) {
    interestingFacts.push(`You authored and pushed forward ${prCount} pull requests this year.`);
  }
  if (issueCount > 0) {
    interestingFacts.push(`You raised and participated in resolving ${issueCount} issues.`);
  }
  interestingFacts.push(`You unlocked a total of ${achievementCount} developer achievements.`);

  // Best Moments
  if (longestStreak > 0) {
    bestMoments.push({
      title: "Longest Streak",
      value: `${longestStreak} Days`,
      subtitle: "Unstoppable momentum",
    });
  }

  if (favoriteLanguageName) {
    bestMoments.push({
      title: "Core Language",
      value: favoriteLanguageName,
      subtitle: "Your tool of choice",
    });
  }

  bestMoments.push({
    title: "OS Portfolio",
    value: `${publicRepos} Repos`,
    subtitle: "Public code footprints",
  });

  // Top Metrics
  const topMetrics = [
    { name: "Total Contributions", value: totalContributions },
    { name: "Commits", value: commitCount },
    { name: "Pull Requests", value: prCount },
    { name: "Issues Opened", value: issueCount },
    { name: "Longest Streak", value: `${longestStreak} Days` },
  ];

  // Share Stats
  const shareStatistics = {
    formattedTotalContributions: totalContributions.toLocaleString(),
    topLanguageName: favoriteLanguageName ?? "Code",
    longestStreakDays: longestStreak,
    globalRankPercentage: Math.max(1, 100 - Math.min(99, Math.floor((totalContributions / 1000) * 100))), // simple mock rank
  };

  // Milestones
  const milestonesList = [
    {
      title: "First contribution of the year",
      reachedAt: "January",
    },
  ];

  if (totalContributions >= 100) {
    milestonesList.push({
      title: "Crossed 100 contributions milestone",
      reachedAt: "Year Mid",
    });
  }

  if (longestStreak >= 7) {
    milestonesList.push({
      title: "Earned 1-Week consistency badge",
      reachedAt: "Active Period",
    });
  }

  return {
    highlights,
    bestMoments,
    interestingFacts,
    topMetrics,
    shareStatistics,
    milestones: milestonesList,
  };
}
