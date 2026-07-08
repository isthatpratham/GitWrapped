// ---------------------------------------------------------------------------
// Story Engine — Registry
// ---------------------------------------------------------------------------
// A slide registry mapping slide types to their conditional selectors and
// builder mapping functions. This supports the open-closed principle: new
// slides can be registered without modifying the compilation pipeline.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics";
import type { StorySlide } from "./story.types";
import { StorySelectors } from "./story.selector";
import { StoryBuilders } from "./story.builder";

export interface RegistryEntry {
  readonly type: string;
  readonly shouldInclude: (analytics: AnalyticsResult) => boolean;
  readonly build: (analytics: AnalyticsResult) => StorySlide;
}

/**
 * Registry containing all slide builders in chronological narrative order.
 * Slides will be evaluated and compiled according to this registry order.
 */
export const STORY_REGISTRY: readonly RegistryEntry[] = [
  {
    type: "Welcome",
    shouldInclude: StorySelectors.shouldIncludeWelcome,
    build: StoryBuilders.buildWelcome,
  },
  {
    type: "Overview",
    shouldInclude: StorySelectors.shouldIncludeOverview,
    build: StoryBuilders.buildOverview,
  },
  {
    type: "Contributions",
    shouldInclude: StorySelectors.shouldIncludeContributions,
    build: StoryBuilders.buildContributions,
  },
  {
    type: "Consistency",
    shouldInclude: StorySelectors.shouldIncludeConsistency,
    build: StoryBuilders.buildConsistency,
  },
  {
    type: "Productivity",
    shouldInclude: StorySelectors.shouldIncludeProductivity,
    build: StoryBuilders.buildProductivity,
  },
  {
    type: "Languages",
    shouldInclude: StorySelectors.shouldIncludeLanguages,
    build: StoryBuilders.buildLanguages,
  },
  {
    type: "Repositories",
    shouldInclude: StorySelectors.shouldIncludeRepositories,
    build: StoryBuilders.buildRepositories,
  },
  {
    type: "Organizations",
    shouldInclude: StorySelectors.shouldIncludeOrganizations,
    build: StoryBuilders.buildOrganizations,
  },
  {
    type: "Achievements",
    shouldInclude: StorySelectors.shouldIncludeAchievements,
    build: StoryBuilders.buildAchievements,
  },
  {
    type: "Timeline",
    shouldInclude: StorySelectors.shouldIncludeTimeline,
    build: StoryBuilders.buildTimeline,
  },
  {
    type: "Highlights",
    shouldInclude: StorySelectors.shouldIncludeHighlights,
    build: StoryBuilders.buildHighlights,
  },
  {
    type: "Summary",
    shouldInclude: StorySelectors.shouldIncludeSummary,
    build: StoryBuilders.buildSummary,
  },
  {
    type: "Closing",
    shouldInclude: StorySelectors.shouldIncludeClosing,
    build: StoryBuilders.buildClosing,
  },
];
