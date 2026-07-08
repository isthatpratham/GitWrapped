// ---------------------------------------------------------------------------
// Story Service — Public Interface
// ---------------------------------------------------------------------------
// High-level service wrapper for compiling developer narratives.
// Handles validation checks and translates exceptions.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics";
import type { Story } from "./story.types";
import { compileStoryDeck } from "./story-engine";
import { StoryBuilderError } from "./story.errors";

/**
 * Transforms calculated developer analytics into a completed Story recap deck.
 *
 * @param analytics - The calculated annual analytics result.
 * @returns The narrated and sequenced Story Deck.
 *
 * @throws {StoryBuilderError} If slide generation fails.
 */
export function generateStoryDeck(analytics: AnalyticsResult): Story {
  try {
    return compileStoryDeck(analytics);
  } catch (error) {
    throw new StoryBuilderError("Core Pipeline", error);
  }
}
