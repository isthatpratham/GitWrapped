import type { AnalyticsResult } from "@/services/analytics";
import type { Story } from "./story.types";
import { composeStory } from "./compose";

/**
 * Compiles a dynamic story from an analytics snapshot.
 *
 * Analytics → insights → rank → redundancy control → selection → composition.
 * The same snapshot always produces the same story.
 */
export function compileStoryDeck(analytics: AnalyticsResult): Story {
  return composeStory(analytics);
}
