// ---------------------------------------------------------------------------
// Story Engine — Builders
// ---------------------------------------------------------------------------
// Pure builder functions that transform computed analytics metrics into
// strictly structured Slide objects.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics";
import type { StorySlide, StorySlideType } from "./story.types";
import { STORY_CONFIG } from "./story.constants";
import { availableMeasured } from "@/domain/models";

/**
 * Common layout generator for constructing a Slide object.
 */
function createSlide(params: {
  readonly id: string;
  readonly type: StorySlideType;
  readonly title: string;
  readonly subtitle: string | null;
  readonly headline: string;
  readonly description: string;
  readonly icon: string | null;
  readonly analyticsReference: string;
  readonly shareable: boolean;
  readonly metadata: Record<string, unknown>;
}): StorySlide {
  const type = params.type;
  const theme = STORY_CONFIG.themes[type] ?? "minimal";
  const motion = STORY_CONFIG.motion[type] ?? "fadeUp";
  const transition = STORY_CONFIG.transitions[type] ?? "slide";
  const priority = STORY_CONFIG.priorities[type] ?? 100;

  return {
    id: params.id,
    type,
    chapter: "YOUR_YEAR",
    title: params.title,
    subtitle: params.subtitle,
    headline: params.headline,
    description: params.description,
    heroValue: null,
    icon: params.icon,
    priority,
    duration: STORY_CONFIG.defaultDurationMs,
    theme,
    motion,
    transition,
    analyticsReference: params.analyticsReference,
    insightId: null,
    availability: availableMeasured(),
    evidence: [],
    shareable: params.shareable,
    metadata: params.metadata,
  };
}

export const StoryBuilders = {
  buildWelcome: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: `${analytics.overview.totalContributions}-welcome`,
      type: "Welcome",
      title: "Welcome",
      subtitle: `Your Year in Code`,
      headline: analytics.summary.shareStatistics.topLanguageName
        ? `Hey ${analytics.summary.shareStatistics.topLanguageName} Dev, let's look back at ${analytics.year}.`
        : `Hey ${analytics.user.displayName ?? analytics.user.handle}, let's look back at ${analytics.year}.`,
      description: "Welcome to your GitWrapped annual recap. Get ready to scroll through your coding journey.",
      icon: "wave",
      analyticsReference: "user",
      shareable: false,
      metadata: {
        username: analytics.user.handle,
        year: analytics.year,
      },
    });
  },

  buildOverview: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "overview-slide",
      type: "Overview",
      title: "The Big Picture",
      subtitle: "Annual Impact Summary",
      headline: `You logged ${analytics.overview.totalContributions.toLocaleString()} total contributions across ${analytics.overview.totalRepositories} repositories.`,
      description: `Pushed commits, merged PRs, opened issues, and collaborated with developers around the globe.`,
      icon: "globe",
      analyticsReference: "overview",
      shareable: true,
      metadata: {
        totalContributions: analytics.overview.totalContributions,
        totalCommits: analytics.overview.totalCommits,
        totalPullRequests: analytics.overview.totalPullRequests,
        totalIssues: analytics.overview.totalIssues,
      },
    });
  },

  buildContributions: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "contributions-slide",
      type: "Contributions",
      title: "Contributions Heatmap",
      subtitle: "Daily Coding Heatmap",
      headline: `Your busiest day was ${analytics.productivity.mostProductiveDay?.date ?? "a peak day"} with ${analytics.productivity.mostProductiveDay?.count ?? 0} events.`,
      description: "Look at your daily commit rhythm across seasons. Warm colors represent peak coding momentum.",
      icon: "heatmap",
      analyticsReference: "productivity.mostProductiveDay",
      shareable: true,
      metadata: {
        weeks: analytics.timeline.weekly.slice(0, 10), // lightweight preview
      },
    });
  },

  buildConsistency: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "consistency-slide",
      type: "Consistency",
      title: "Coding Consistency",
      subtitle: "Unstoppable Momentum",
      headline: `Consistency Champion: Your longest streak was ${analytics.consistency.longestStreak} days in a row!`,
      description: `Active weeks consistency is at ${analytics.consistency.averageWeeklyConsistency}%, showing persistent focus.`,
      icon: "consistency",
      analyticsReference: "consistency",
      shareable: true,
      metadata: {
        longestStreak: analytics.consistency.longestStreak,
        streakStartDate: analytics.consistency.longestStreakStartDate,
        streakEndDate: analytics.consistency.longestStreakEndDate,
      },
    });
  },

  buildProductivity: (analytics: AnalyticsResult): StorySlide => {
    const time = analytics.activity.timeAnalysis;
    const session = time.preferredCodingSession;
    const hour = time.mostActiveHour;
    const nightOwl = time.nightOwlScore;

    return createSlide({
      id: "productivity-slide",
      type: "Productivity",
      title: "Peak Productivity",
      subtitle: "Coding Schedule Analysis",
      headline: session
        ? `Your favorite session is the ${session} window.`
        : "Hour-of-day coding patterns need real commit timestamps.",
      description:
        hour !== null && nightOwl
          ? `You committed most at ${hour}:00 UTC. Night Owl Score is ${nightOwl.percentage}%.`
          : "GitHub did not provide enough commit timestamps to measure coding hours for this recap.",
      icon: "clock",
      analyticsReference: "activity.timeAnalysis",
      shareable: true,
      metadata: {
        preferredSession: session,
        mostActiveHour: hour,
      },
    });
  },

  buildLanguages: (analytics: AnalyticsResult): StorySlide => {
    const favoriteLang = analytics.languages.favoriteLanguage;
    return createSlide({
      id: "languages-slide",
      type: "Languages",
      title: "Technology Arsenal",
      subtitle: "Language Breakdown",
      headline: favoriteLang
        ? `You built mostly using ${favoriteLang.name}, representing ${favoriteLang.percentage}% of your code.`
        : "You worked across multiple technologies this year.",
      description: `Used ${analytics.languages.languageDiversityScore.value} languages. Diversity Score: ${analytics.languages.languageDiversityScore.percentage}%.`,
      icon: "code",
      analyticsReference: "languages",
      shareable: true,
      metadata: {
        breakdown: analytics.languages.languageDistribution,
      },
    });
  },

  buildRepositories: (analytics: AnalyticsResult): StorySlide => {
    const favoriteRepo = analytics.repositories.favoriteRepository;
    return createSlide({
      id: "repositories-slide",
      type: "Repositories",
      title: "Code Portfolio",
      subtitle: "Favorite Repositories",
      headline: favoriteRepo
        ? `Your most starred repository was ${favoriteRepo.ownerName}/${favoriteRepo.name}.`
        : "You managed multiple codebases this year.",
      description: `Created new code repositories and maintained public projects with total stars earned.`,
      icon: "repo",
      analyticsReference: "repositories",
      shareable: true,
      metadata: {
        favoriteRepository: favoriteRepo,
        mostActiveRepository: analytics.repositories.mostActiveRepository,
      },
    });
  },

  buildOrganizations: (analytics: AnalyticsResult): StorySlide => {
    const activeOrg = analytics.organizations.mostActiveOrganization;
    return createSlide({
      id: "organizations-slide",
      type: "Organizations",
      title: "Collaborations",
      subtitle: "Organization Memberships",
      headline: activeOrg
        ? `Collaborating at scale: Most active organization is ${activeOrg.displayName ?? activeOrg.handle}.`
        : "You collaborated with open-source teams.",
      description: "Contributing to collaborative repositories, building together with team members.",
      icon: "org",
      analyticsReference: "organizations",
      shareable: false,
      metadata: {
        organizationList: analytics.organizations.organizationList,
      },
    });
  },

  buildAchievements: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "achievements-slide",
      type: "Achievements",
      title: "Milestones Reached",
      subtitle: "Developer Badges",
      headline: `You unlocked ${analytics.achievements.count} developer achievements!`,
      description: `Recognized for consistency, night-owl coding sessions, and repository contributions.`,
      icon: "badge",
      analyticsReference: "achievements",
      shareable: true,
      metadata: {
        achievementsList: analytics.achievements.unlockedList,
      },
    });
  },

  buildTimeline: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "timeline-slide",
      type: "Timeline",
      title: "Coding Journey",
      subtitle: "Timeline Trends",
      headline: `Your productivity trended ${analytics.productivity.productivityTrend} during the final months.`,
      description: `Momentum score of ${analytics.productivity.contributionMomentum} comparing fourth quarter to first quarter.`,
      icon: "timeline",
      analyticsReference: "productivity",
      shareable: true,
      metadata: {
        quarters: analytics.timeline.quarterly,
      },
    });
  },

  buildHighlights: (analytics: AnalyticsResult): StorySlide => {
    const primaryHighlight = analytics.summary.highlights[0] ?? "Logged impressive milestones this year.";
    return createSlide({
      id: "highlights-slide",
      type: "Highlights",
      title: "Key Highlights",
      subtitle: "Best Coding Moments",
      headline: primaryHighlight,
      description: "A summary of your major achievements, contributions, and streaks this year.",
      icon: "star",
      analyticsReference: "summary.highlights",
      shareable: true,
      metadata: {
        highlights: analytics.summary.highlights,
        bestMoments: analytics.summary.bestMoments,
      },
    });
  },

  buildSummary: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "summary-slide",
      type: "Summary",
      title: "Your Wrapped Summary",
      subtitle: "Annual Infocard",
      headline: `Here is your year in code, beautifully summarized.`,
      description: "This is your shareable infographic. Share it on Twitter/X, LinkedIn, and GitHub.",
      icon: "summary",
      analyticsReference: "summary",
      shareable: true,
      metadata: {
        shareStatistics: analytics.summary.shareStatistics,
        topMetrics: analytics.summary.topMetrics,
      },
    });
  },

  buildClosing: (analytics: AnalyticsResult): StorySlide => {
    return createSlide({
      id: "closing-slide",
      type: "Closing",
      title: "Wrapping Up",
      subtitle: "Until Next Year",
      headline: `Keep building, keep shipping. See you in ${analytics.year + 1}!`,
      description: "GitWrapped recap generated successfully. Thank you for using GitWrapped.",
      icon: "closing",
      analyticsReference: "user",
      shareable: false,
      metadata: {
        year: analytics.year,
      },
    });
  },
} as const;
