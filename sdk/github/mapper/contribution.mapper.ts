// ---------------------------------------------------------------------------
// Mapper: GitHub Contribution Collection → Domain ContributionHistory
// ---------------------------------------------------------------------------
// Converts the raw SDK `ContributionCollection` into the domain
// `ContributionHistory` model.
//
// Rules:
// - Removes GraphQL structures.
// - Normalises fields to business terminology.
// ---------------------------------------------------------------------------

import type { ContributionCollection } from "@/sdk/github/types";
import type { ContributionHistory } from "@/domain/models/contribution";

/**
 * Maps a raw `ContributionCollection` from the GitHub SDK into the domain
 * `ContributionHistory` model.
 *
 * @param raw - The SDK-level contribution collection returned by `fetchUserContributions`.
 * @returns An immutable `ContributionHistory` domain model.
 */
export function mapGitHubContributionsToContributionHistory(
  raw: ContributionCollection,
): ContributionHistory {
  return {
    calendar: {
      totalCount: raw.contributionCalendar.totalContributions,
      weeks: raw.contributionCalendar.weeks.map((week) => ({
        weekStartDate: week.firstDay,
        days: week.contributionDays.map((day) => ({
          date: day.date,
          count: day.contributionCount,
          intensity: day.contributionLevel,
          color: day.color,
        })),
      })),
    },
    commitCount: raw.totalCommitContributions,
    pullRequestCount: raw.totalPullRequestContributions,
    issueCount: raw.totalIssueContributions,
    reviewCount: raw.totalPullRequestReviewContributions,
    activeRepositoryCount: raw.totalRepositoriesWithContributedCommits,
    privateContributionCount: raw.restrictedContributionsCount,
    repositoryActivity: raw.repositoryActivity.map((activity) => ({
      repositoryPath: activity.repositoryPath,
      commitCount: activity.commitCount,
      primaryLanguage: activity.primaryLanguage
        ? {
            name: activity.primaryLanguage.name,
            color: activity.primaryLanguage.color,
          }
        : null,
    })),
    peakDay: raw.peakDay
      ? {
          date: raw.peakDay.date,
          commitCount: raw.peakDay.commitCount,
          repositoryPath: raw.peakDay.repositoryPath,
        }
      : null,
  };
}
