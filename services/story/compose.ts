import { availableMeasured } from "@/domain/models";
import type { AnalyticsResult } from "@/services/analytics";
import { STORY_CONFIG } from "./story.constants";
import { closingCopy, copyForInsight, welcomeCopy } from "./copy/templates";
import { classifyDeveloperRhythm } from "./intelligence/rhythm";
import { selectStoryInsights } from "./intelligence/select";
import { CHAPTER_ORDER, CHAPTER_TITLES } from "./intelligence/types";
import type { RankedInsight } from "./intelligence/types";
import type {
  Story,
  StoryChapter,
  StoryChapterBlock,
  StorySlide,
  StorySlideType,
  StoryTheme,
  MotionPreset,
  SlideTransition,
} from "./story.types";

function presentationFor(type: StorySlideType): {
  theme: StoryTheme;
  motion: MotionPreset;
  transition: SlideTransition;
  priority: number;
} {
  return {
    theme: STORY_CONFIG.themes[type] ?? "minimal",
    motion: STORY_CONFIG.motion[type] ?? "fadeUp",
    transition: STORY_CONFIG.transitions[type] ?? "slide",
    priority: STORY_CONFIG.priorities[type] ?? 100,
  };
}

function toSlide(params: {
  readonly id: string;
  readonly type: StorySlideType;
  readonly chapter: StoryChapter;
  readonly copy: ReturnType<typeof welcomeCopy>;
  readonly insight: RankedInsight | null;
  readonly analyticsReference: string;
  readonly shareable: boolean;
  readonly metadata: Record<string, unknown>;
  readonly heroValue?: string | number | null;
}): StorySlide {
  const presentation = presentationFor(params.type);
  return {
    id: params.id,
    type: params.type,
    chapter: params.chapter,
    title: params.copy.title,
    subtitle: params.copy.subtitle,
    headline: params.copy.headline,
    description: params.copy.description,
    heroValue: params.heroValue ?? params.insight?.heroValue ?? null,
    icon: params.type === "Welcome" ? "wave" : params.insight?.kind ?? params.type,
    priority: presentation.priority,
    duration: STORY_CONFIG.defaultDurationMs,
    theme: presentation.theme,
    motion: presentation.motion,
    transition: presentation.transition,
    analyticsReference: params.analyticsReference,
    insightId: params.insight?.id ?? null,
    availability: params.insight?.availability ?? availableMeasured(),
    evidence: params.insight?.evidence ?? [],
    shareable: params.shareable,
    metadata: params.metadata,
  };
}

function metadataFor(insight: RankedInsight, analytics: AnalyticsResult): Record<string, unknown> {
  const payload = insight.payload;
  switch (payload.kind) {
    case "contribution-total":
      return {
        totalContributions: analytics.overview.totalContributions,
        totalCommits: analytics.overview.totalCommits,
        totalPullRequests: analytics.overview.totalPullRequests,
        totalIssues: analytics.overview.totalIssues,
        shareStatistics: {
          formattedTotalContributions: analytics.overview.totalContributions.toLocaleString(),
          topLanguageName: analytics.languages.favoriteLanguage?.name ?? null,
          longestStreakDays: analytics.consistency.longestStreak,
        },
        topMetrics: [{ name: "Commits", value: analytics.overview.totalCommits }],
      };
    case "longest-streak":
      return {
        longestStreak: payload.days,
        streakStartDate: payload.startDate,
        streakEndDate: payload.endDate,
      };
    case "peak-day":
    case "activity-spike":
      return { weeks: analytics.timeline.weekly.slice(0, 10) };
    case "night-activity":
      return {
        preferredSession: payload.session,
        mostActiveHour: payload.mostActiveHour,
      };
    case "weekend-activity":
      return {
        preferredSession: "WEEKEND",
        mostActiveHour: analytics.activity.timeAnalysis.mostActiveHour,
      };
    case "language-dominance":
    case "language-evolution":
      return { breakdown: analytics.languages.languageDistribution };
    case "repository-concentration":
      return {
        mostActiveRepository: analytics.repositories.mostActiveRepository,
      };
    case "peak-repository":
      return {
        peakDayRepository: analytics.repositories.peakDayRepository ?? {
          name: payload.name,
          ownerName: payload.ownerName,
          starCount: payload.starCount,
          url: payload.url,
        },
      };
    case "most-starred-repository":
      return {
        mostStarredRepository: {
          name: payload.name,
          ownerName: payload.ownerName,
          starCount: payload.starCount,
          url: payload.url,
        },
      };
    case "monthly-growth":
      return { quarters: analytics.timeline.quarterly };
    case "comeback":
    case "developer-rhythm":
      return { highlights: [insight.evidence[0]?.value ?? insight.payload.kind] };
    case "achievements":
      return { achievementsList: payload.achievements };
    case "organizations":
      return { organizationList: analytics.organizations.organizationList };
  }
}

function buildChapters(slides: ReadonlyArray<StorySlide>): readonly StoryChapterBlock[] {
  return CHAPTER_ORDER.flatMap((chapter) => {
    const slideIds = slides.filter((slide) => slide.chapter === chapter).map((slide) => slide.id);
    if (slideIds.length === 0) return [];
    return [{ id: chapter, title: CHAPTER_TITLES[chapter], slideIds }];
  });
}

export function composeStory(analytics: AnalyticsResult): Story {
  const selected = selectStoryInsights(analytics);
  const handle = analytics.user.handle;
  const slides: StorySlide[] = [];

  slides.push(
    toSlide({
      id: `welcome-${handle}-${analytics.year}`,
      type: "Welcome",
      chapter: "OPENING",
      copy: welcomeCopy(handle, analytics.user.displayName, analytics.year),
      insight: null,
      analyticsReference: "user",
      shareable: false,
      metadata: { username: handle, year: analytics.year },
    }),
  );

  for (const insight of selected) {
    slides.push(
      toSlide({
        id: `${insight.id}-${analytics.year}`,
        type: insight.slideType,
        chapter: insight.chapter,
        copy: copyForInsight(insight, handle),
        insight,
        analyticsReference: insight.kind,
        shareable: insight.shareable,
        metadata: metadataFor(insight, analytics),
      }),
    );
  }

  slides.push(
    toSlide({
      id: `closing-${handle}-${analytics.year}`,
      type: "Closing",
      chapter: "FINALE",
      copy: closingCopy(analytics.year),
      insight: null,
      analyticsReference: "user",
      shareable: false,
      metadata: { year: analytics.year },
    }),
  );

  if (slides.length > STORY_CONFIG.maxSlidesCount) {
    const opening = slides[0];
    const finale = slides[slides.length - 1];
    const body = slides.slice(1, -1).slice(0, STORY_CONFIG.maxSlidesCount - 2);
    slides.length = 0;
    if (opening) slides.push(opening);
    slides.push(...body);
    if (finale) slides.push(finale);
  }

  const totalDurationMs = slides.reduce((sum, slide) => sum + slide.duration, 0);
  const rhythm = classifyDeveloperRhythm(analytics)?.rhythm ?? null;

  return {
    year: analytics.year,
    developer: {
      handle,
      displayName: analytics.user.displayName,
      avatarUrl: analytics.user.avatarUrl,
    },
    chapters: buildChapters(slides),
    metadata: {
      username: handle,
      avatarUrl: analytics.user.avatarUrl,
      year: analytics.year,
      generatedAt: analytics.computedAt,
      version: "3.0.0",
    },
    overview: {
      totalSlides: slides.length,
      totalDurationMs,
      primaryTheme: slides[0]?.theme ?? "minimal",
    },
    slides,
    rhythm,
    progression: {
      autoPlay: true,
      defaultSlideDurationMs: STORY_CONFIG.defaultDurationMs,
    },
    navigation: {
      keyboardShortcuts: true,
      touchSwipe: true,
      scrollSnapping: true,
    },
    sharing: {
      shareUrl: `https://gitwrapped.dev/recap/${handle}/${analytics.year}`,
      defaultShareText: `Check out my year in code on #GitWrapped! ${analytics.overview.totalContributions.toLocaleString()} contributions in ${analytics.year}.`,
      hashTags: ["GitWrapped", "GitHub", "Coding", "Developer"],
    },
  };
}
