// ---------------------------------------------------------------------------
// Analytics Engine — Barrel Export
// ---------------------------------------------------------------------------
// Single import point for all Analytics Engine services and types.
// Import from "@/services/analytics" — never from internal modules.
// ---------------------------------------------------------------------------

export { generateRecapAnalytics } from "./analytics.service";

export { computeAnnualAnalytics } from "./analytics-engine";

export { ANALYTICS_CONFIG } from "./analytics.constants";

export {
  AnalyticsEngineError,
  ZeroContributionsError,
  CalculationError,
} from "./analytics.errors";

export { FETCHED_ANALYTICS_SOURCES } from "./analytics.types";

export type {
  AnalyticsEngineInput,
  AnalyticsResult,
  AnalyticsAvailability,
  NormalizedScore,
  AnalyticsOverview,
  AnalyticsProductivity,
  AnalyticsConsistency,
  AnalyticsActivity,
  AnalyticsLanguages,
  AnalyticsRepositories,
  AnalyticsOrganizations,
  AnalyticsAchievements,
  AnalyticsAchievement,
  AnalyticsSummary,
  AnalyticsTimeline,
  TimelineDataPoint,
} from "./analytics.types";
