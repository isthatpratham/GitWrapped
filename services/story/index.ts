// ---------------------------------------------------------------------------
// Story Engine — Barrel Export
// ---------------------------------------------------------------------------
// Single import point for all Story Engine services, registries, and types.
// Import from "@/services/story" — never from internal modules.
// ---------------------------------------------------------------------------

export { generateStoryDeck } from "./story.service";

export { compileStoryDeck } from "./story-engine";

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
  StoryTheme,
  MotionPreset,
  SlideTransition,
  StoryMetadata,
  StoryOverview,
  StoryProgression,
  StoryNavigation,
  StorySharing,
} from "./story.types";
