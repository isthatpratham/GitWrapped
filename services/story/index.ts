// ---------------------------------------------------------------------------
// Story Engine — Barrel Export
// ---------------------------------------------------------------------------
// Single import point for all Story Engine services, registries, and types.
// Import from "@/services/story" — never from internal modules.
// ---------------------------------------------------------------------------

export { generateStoryDeck } from "./story.service";

export { compileStoryDeck } from "./story-engine";

export { composeStory } from "./compose";

export { generateStoryInsights } from "./intelligence/generate";

export { rankStoryInsights, rankScoreFor } from "./intelligence/rank";

export { collapseRedundantInsights } from "./intelligence/redundancy";

export { selectStoryInsights, buildStoryIntelligence } from "./intelligence/select";

export { classifyDeveloperRhythm } from "./intelligence/rhythm";

export { deriveStoryAchievements } from "./intelligence/achievements";

export { STORY_CONFIG } from "./story.constants";

export { STORY_REGISTRY } from "./story.registry";

export {
  StoryEngineError,
  StoryBuilderError,
  InvalidStoryDeckError,
} from "./story.errors";

export type {
  Story,
  StorySlide,
  StorySlideType,
  StoryChapter,
  StoryChapterBlock,
  StoryDeveloper,
  DeveloperRhythm,
  StoryTheme,
  MotionPreset,
  SlideTransition,
  StoryMetadata,
  StoryOverview,
  StoryProgression,
  StoryNavigation,
  StorySharing,
  StoryEvidence,
} from "./story.types";

export type {
  StoryInsight,
  RankedInsight,
  InsightKind,
  InsightFamily,
} from "./intelligence/types";

export { CHAPTER_ORDER, CHAPTER_TITLES } from "./intelligence/types";
