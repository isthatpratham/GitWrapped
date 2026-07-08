// ---------------------------------------------------------------------------
// Story Engine — Selectors
// ---------------------------------------------------------------------------
// Reusable selector functions to determine if a slide has sufficient and
// meaningful analytics context to exist in the deck.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics";

export const StorySelectors = {
  /**
   * Welcome slide should always be displayed.
   */
  shouldIncludeWelcome: (): boolean => true,

  /**
   * Overview slide should always be displayed as the main aggregate summary.
   */
  shouldIncludeOverview: (): boolean => true,

  /**
   * Contributions slide needs at least 1 contribution in the calendar.
   */
  shouldIncludeContributions: (analytics: AnalyticsResult): boolean => {
    return analytics.overview.totalContributions > 0;
  },

  /**
   * Consistency slide is only displayed if the user has a streak record.
   */
  shouldIncludeConsistency: (analytics: AnalyticsResult): boolean => {
    return analytics.consistency.longestStreak >= 3;
  },

  /**
   * Productivity slide is displayed if the user has active coding days.
   */
  shouldIncludeProductivity: (analytics: AnalyticsResult): boolean => {
    return analytics.productivity.averageContributionsPerDay > 0;
  },

  /**
   * Languages slide is displayed if the user has at least one active language.
   */
  shouldIncludeLanguages: (analytics: AnalyticsResult): boolean => {
    return analytics.languages.languageDistribution.length > 0;
  },

  /**
   * Repositories slide is displayed if the user has at least one owned public repository.
   */
  shouldIncludeRepositories: (analytics: AnalyticsResult): boolean => {
    return analytics.overview.totalRepositories > 0;
  },

  /**
   * Organizations slide is displayed only if the user belongs to at least one organization.
   */
  shouldIncludeOrganizations: (analytics: AnalyticsResult): boolean => {
    return analytics.organizations.organizationContributionsCount > 0;
  },

  /**
   * Achievements slide is displayed if the user has unlocked at least one achievement.
   */
  shouldIncludeAchievements: (analytics: AnalyticsResult): boolean => {
    return analytics.achievements.count > 0;
  },

  /**
   * Timeline slide is displayed if there is daily activity data.
   */
  shouldIncludeTimeline: (analytics: AnalyticsResult): boolean => {
    return analytics.timeline.daily.length > 0;
  },

  /**
   * Highlights slide is displayed if there are interesting facts or highlights generated.
   */
  shouldIncludeHighlights: (analytics: AnalyticsResult): boolean => {
    return analytics.summary.highlights.length > 0 || analytics.summary.interestingFacts.length > 0;
  },

  /**
   * Summary slide should always be displayed.
   */
  shouldIncludeSummary: (): boolean => true,

  /**
   * Closing slide should always be displayed.
   */
  shouldIncludeClosing: (): boolean => true,
} as const;
