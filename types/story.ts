// ---------------------------------------------------------------------------
// Compatibility exports for legacy story types
// ---------------------------------------------------------------------------
// These types are kept for legacy compatibility but the canonical models
// have moved to `domain/models/`.
//
// New features should import directly from `@/domain/models`.
// ---------------------------------------------------------------------------

export type { StoryDeck, Slide as SlideData } from "@/domain/models/story";
export type { SlideTheme } from "@/domain/models/story"; // Wait, SlideTheme is not in the new story.ts, let's keep it or declare it
