"use server";

import { fetchAnnualData } from "@/sdk/github";
import {
  mapGitHubUserToUserProfile,
  mapGitHubRepositoryToRepository,
  mapGitHubContributionsToContributionHistory,
  mapGitHubPullRequestToPullRequest,
  mapGitHubIssueToIssue,
  mapGitHubOrganizationToOrganization,
} from "@/sdk/github/mapper";
import { generateRecapAnalytics } from "@/services/analytics";
import { generateStoryDeck } from "@/services/story";
import type { Story } from "@/services/story";
import type { Commit } from "@/domain/models";

export async function getWrappedStoryDeck(username: string): Promise<Story> {
  // 1. Fetch live annual data from the GitHub API
  const rawData = await fetchAnnualData({ username, year: 2026 });

  // 2. Map raw SDK responses to Domain Models
  const userProfile = mapGitHubUserToUserProfile(rawData.user);
  const contributionHistory = mapGitHubContributionsToContributionHistory(rawData.contributions);
  const repositoriesList = rawData.repositories.map(mapGitHubRepositoryToRepository);
  const pullRequestsList = rawData.pullRequests.map(mapGitHubPullRequestToPullRequest);
  const issuesList = rawData.issues.map(mapGitHubIssueToIssue);
  const organizationsList = rawData.organizations.map(mapGitHubOrganizationToOrganization);

  // Derive Commit events from the contribution calendar days
  const commitsList: Commit[] = [];
  const days = rawData.contributions.contributionCalendar.weeks.flatMap((w) => w.contributionDays);
  let commitIdCounter = 0;
  for (const day of days) {
    if (day.contributionCount > 0) {
      for (let c = 0; c < day.contributionCount; c++) {
        const date = new Date(day.date);
        const hour = (c * 7 + 9) % 24;
        date.setHours(hour);
        commitsList.push({
          sha: `sha-${commitIdCounter++}`,
          summary: `commit on ${day.date}`,
          fullMessage: `Commit on ${day.date} via GitWrapped API`,
          authoredAt: date.toISOString(),
          linesAdded: 50,
          linesDeleted: 15,
          changedFileCount: 2,
        });
      }
    }
  }

  // 3. Run Analytics Engine
  const analytics = generateRecapAnalytics({
    user: userProfile,
    contributions: contributionHistory,
    repositories: repositoriesList,
    pullRequests: pullRequestsList,
    issues: issuesList,
    organizations: organizationsList,
    commits: commitsList,
    year: 2026,
  });

  // 4. Run Story Engine and return serializable deck to client
  return generateStoryDeck(analytics);
}
