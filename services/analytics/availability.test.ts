import { describe, expect, it } from "vitest";

import type { AnalyticsEngineInput } from "./analytics.types";
import { FETCHED_ANALYTICS_SOURCES } from "./analytics.types";
import { calculateActivity } from "./calculators/activity";
import { calculateLanguages } from "./calculators/languages";
import { mapRepositoriesToLanguageProfile } from "./calculators/languages/profile";
import { deriveAnalyticsAvailability, resolvedCollectionCount } from "./availability";
import type { ContributionHistory, UserProfile } from "@/domain/models";

const user: UserProfile = {
  handle: "octocat",
  displayName: "Octo Cat",
  avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
  bio: null,
  company: null,
  location: null,
  websiteUrl: null,
  twitterHandle: null,
  accountCreatedAt: "2011-01-01T00:00:00.000Z",
  publicRepositoryCount: 0,
  followerCount: 0,
  followingCount: 0,
};

const emptyContributions: ContributionHistory = {
  calendar: { totalCount: 0, weeks: [] },
  commitCount: 0,
  pullRequestCount: 0,
  issueCount: 0,
  reviewCount: 0,
  activeRepositoryCount: 0,
  privateContributionCount: 0,
  repositoryActivity: [],
  peakDay: null,
};

function input(overrides: Partial<AnalyticsEngineInput> = {}): AnalyticsEngineInput {
  return {
    user,
    contributions: emptyContributions,
    repositories: [],
    pullRequests: [],
    issues: [],
    organizations: [],
    commits: [],
    year: 2026,
    sources: FETCHED_ANALYTICS_SOURCES,
    ...overrides,
  };
}

describe("analytics availability", () => {
  it("treats a fetched empty PR list as available zero, not missing data", () => {
    expect(resolvedCollectionCount({ status: "fetched" }, 0, 12)).toBe(0);
    expect(
      resolvedCollectionCount({ status: "unavailable", reason: "fetch_failed" }, 0, 12),
    ).toBe(12);

    const activity = calculateActivity([], [], []);
    const languages = calculateLanguages(mapRepositoriesToLanguageProfile([]), [], 2026);
    const availability = deriveAnalyticsAvailability(input(), activity, languages);

    expect(availability.pullRequests.status).toBe("available");
    expect(availability.commitTimestamps.status).toBe("unavailable");
    if (availability.commitTimestamps.status === "unavailable") {
      expect(availability.commitTimestamps.reason).toBe("no_commit_timestamps");
    }
  });

  it("marks languages unavailable when no language bytes exist", () => {
    const activity = calculateActivity([], [], []);
    const languages = calculateLanguages(mapRepositoriesToLanguageProfile([]), [], 2026);
    const availability = deriveAnalyticsAvailability(input(), activity, languages);
    expect(availability.languages).toEqual({
      status: "unavailable",
      reason: "no_language_bytes",
    });
  });

  it("marks peak-day repository unavailable when the date is known but unattributed", () => {
    const activity = calculateActivity([], [], []);
    const languages = calculateLanguages(mapRepositoriesToLanguageProfile([]), [], 2026);
    const availability = deriveAnalyticsAvailability(
      input({
        contributions: {
          ...emptyContributions,
          peakDay: { date: "2026-06-15", commitCount: 8, repositoryPath: null },
        },
      }),
      activity,
      languages,
    );

    expect(availability.peakDayRepository).toEqual({
      status: "unavailable",
      reason: "no_repository_attribution",
    });
  });
});
