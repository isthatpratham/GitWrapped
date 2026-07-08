// ---------------------------------------------------------------------------
// Analytics Constants
// ---------------------------------------------------------------------------
// Centrally defines all configurable business rules and thresholds for the
// Analytics Engine. Magic numbers are strictly forbidden.
// ---------------------------------------------------------------------------

export const ANALYTICS_CONFIG = {
  // Time ranges for productivity and schedule analysis
  time: {
    /** Hour (0-23) when the "Night" coding window starts. */
    nightStartHour: 22,
    /** Hour (0-23) when the "Night" coding window ends. */
    nightEndHour: 5,
    /** Hour (0-23) when the "Early Bird" coding window starts. */
    earlyBirdStartHour: 5,
    /** Hour (0-23) when the "Early Bird" coding window ends. */
    earlyBirdEndHour: 9,
    /** Day indices (0 = Sunday, 6 = Saturday) representing the weekend. */
    weekendDays: [0, 6] as readonly number[],
  },

  // Consistency & Streak thresholds
  consistency: {
    /** Minimum streak duration in days to be considered significant. */
    minimumStreakLength: 3,
    /** Target consistency score maximum. */
    maxConsistencyScore: 100,
    /** Target number of days of activity for 100% consistency score (e.g. 150 days). */
    targetActiveDays: 150,
  },

  // Language analysis thresholds
  languages: {
    /** Minimum byte count for a language to be considered active. */
    activeByteThreshold: 1000,
    /** Threshold of unique languages for high diversity rating. */
    diversityHighThreshold: 5,
    /** Threshold of unique languages for medium diversity rating. */
    diversityMediumThreshold: 3,
  },

  // Scoring maximums (for normalization)
  scoring: {
    maxActivityScore: 1000,
    maxConsistencyScore: 100,
    maxRepositoryScore: 100,
    maxLanguageScore: 100,
    maxGrowthScore: 100,
    maxProductivityScore: 100,
  },

  // Achievement thresholds
  achievements: {
    nightOwlCommitCount: 30,
    weekendWarriorCommitCount: 50,
    marathonCoderStreakDays: 14,
    openSourceExplorerForkCount: 10,
    languageHopperCount: 5,
    consistencyChampionActiveDays: 200,
    repositoryCreatorCount: 10,
    pullRequestHeroCount: 50,
    issueHunterCount: 25,
  },
} as const;
