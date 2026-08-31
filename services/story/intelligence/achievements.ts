import { isAvailable } from "@/domain/models";
import type { AnalyticsResult } from "@/services/analytics";
import { STORY_INTELLIGENCE } from "./constants";
import { detectComeback } from "./signals";

export interface StoryAchievement {
  readonly id: string;
  readonly title: string;
  readonly reason: string;
}

export function deriveStoryAchievements(analytics: AnalyticsResult): readonly StoryAchievement[] {
  const unlocked: StoryAchievement[] = [];
  const night = analytics.activity.timeAnalysis.nightOwlScore;
  const languages = analytics.languages.languageDistribution.length;
  const share = analytics.repositories.mostActiveRepository;
  const comeback = detectComeback(analytics);

  if (isAvailable(analytics.availability.codingHours) && night && night.percentage >= 35) {
    unlocked.push({
      id: "night-builder",
      title: "Night Builder",
      reason: `${night.percentage}% of timed commits landed in late hours UTC.`,
    });
  }

  if (analytics.consistency.longestStreak >= 14) {
    unlocked.push({
      id: "streak-keeper",
      title: "Streak Keeper",
      reason: `Longest streak reached ${analytics.consistency.longestStreak} days.`,
    });
  }

  if (
    isAvailable(analytics.availability.pullRequests) &&
    analytics.activity.pullRequests.merged >= 20
  ) {
    unlocked.push({
      id: "shipper",
      title: "Shipper",
      reason: `Merged ${analytics.activity.pullRequests.merged} pull requests.`,
    });
  } else if (analytics.overview.totalPullRequests >= 20) {
    unlocked.push({
      id: "shipper",
      title: "Shipper",
      reason: `Opened ${analytics.overview.totalPullRequests} pull requests.`,
    });
  }

  if (isAvailable(analytics.availability.languages) && languages >= 5) {
    unlocked.push({
      id: "polyglot",
      title: "Polyglot",
      reason: `Detected ${languages} languages in the portfolio.`,
    });
  }

  if (isAvailable(analytics.availability.languages) && analytics.languages.newLanguagesLearned.length >= 2) {
    unlocked.push({
      id: "explorer",
      title: "Explorer",
      reason: `First appeared in ${analytics.languages.newLanguagesLearned.length} languages on repositories created this year.`,
    });
  }

  if (share && analytics.overview.totalCommits > 0) {
    const percent = (share.commitCount / analytics.overview.totalCommits) * 100;
    if (percent >= 50) {
      unlocked.push({
        id: "one-project-army",
        title: "One-Project Army",
        reason: `${share.name} accounted for ${percent.toFixed(0)}% of recorded commits.`,
      });
    }
  }

  if (
    isAvailable(analytics.availability.organizations) &&
    analytics.organizations.organizationContributionsCount >= 1
  ) {
    unlocked.push({
      id: "open-source-builder",
      title: "Open Source Builder",
      reason: `Public member of ${analytics.organizations.organizationContributionsCount} organization${analytics.organizations.organizationContributionsCount === 1 ? "" : "s"}.`,
    });
  }

  if (comeback) {
    unlocked.push({
      id: "comeback",
      title: "Comeback",
      reason: `Returned with ${comeback.reboundCount} contributions after ${comeback.quietDays} quiet days.`,
    });
  }

  return unlocked.slice(0, STORY_INTELLIGENCE.achievementMax);
}
