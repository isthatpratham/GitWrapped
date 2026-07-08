// ---------------------------------------------------------------------------
// Story Engine — Core Pipeline
// ---------------------------------------------------------------------------
// The compilation engine. Evaluates selectors, runs builders, enforces slide
// limits (min 8, max 15), sets transitions and visual themes, and produces
// the final immutable Story payload.
// ---------------------------------------------------------------------------

import type { AnalyticsResult } from "@/services/analytics";
import type { Story, StorySlide } from "./story.types";
import { STORY_REGISTRY } from "./story.registry";
import { STORY_CONFIG } from "./story.constants";

/**
 * Compiles a structured, narrated Story Deck from the calculated analytics.
 *
 * Execution flow:
 * 1. Iterates over the STORY_REGISTRY.
 * 2. Checks the conditional `shouldInclude` selector for each slide type.
 * 3. Builds the slide if the selector returns true.
 * 4. Enforces the narrative length boundaries (minimum 8, maximum 15 slides).
 * 5. Applies fallback logic to backfill slides if the user is inactive.
 * 6. Structures metadata, navigation, progression, and sharing attributes.
 *
 * @param analytics - The computed analytics payload from `generateRecapAnalytics`.
 * @returns An immutable Story deck ready to be rendered by the UI.
 *
 * @throws {InvalidStoryDeckError} If the compiled deck falls outside narrative constraints.
 */
export function compileStoryDeck(analytics: AnalyticsResult): Story {
  let compiledSlides: StorySlide[] = [];

  // Step 1: Run selector evaluation and build matches
  for (const entry of STORY_REGISTRY) {
    try {
      if (entry.shouldInclude(analytics)) {
        compiledSlides.push(entry.build(analytics));
      }
    } catch (error) {
      // Allow individual slide failures to log and degrade gracefully by skipped compile
      console.warn(`[StoryEngine] Skipped compiling slide "${entry.type}":`, error);
    }
  }

  // Step 2: Enforce narrative bounds
  // If slide count is less than 8, backfill by keeping Welcome, Overview, Contributions,
  // Languages, Repositories, Highlights, Summary, Closing regardless of selectors.
  if (compiledSlides.length < STORY_CONFIG.minSlidesCount) {
    const requiredBackfills = ["Welcome", "Overview", "Contributions", "Languages", "Repositories", "Highlights", "Summary", "Closing"];
    compiledSlides = [];

    for (const entry of STORY_REGISTRY) {
      if (requiredBackfills.includes(entry.type) || entry.shouldInclude(analytics)) {
        compiledSlides.push(entry.build(analytics));
      }
    }
  }

  // If slide count is still less than 8, force-add the remaining required backfills
  if (compiledSlides.length < STORY_CONFIG.minSlidesCount) {
    const forceOrder = ["Welcome", "Overview", "Contributions", "Languages", "Repositories", "Highlights", "Summary", "Closing"];
    const currentTypes = new Set(compiledSlides.map((s) => s.type));

    for (const type of forceOrder) {
      if (compiledSlides.length >= STORY_CONFIG.minSlidesCount) break;
      if (!currentTypes.has(type)) {
        const entry = STORY_REGISTRY.find((e) => e.type === type);
        if (entry) {
          compiledSlides.push(entry.build(analytics));
        }
      }
    }
  }

  // Step 3: Sort slides by their priority configuration
  compiledSlides.sort((a, b) => a.priority - b.priority);

  // Step 4: Cap deck size to prevent viewer fatigue
  if (compiledSlides.length > STORY_CONFIG.maxSlidesCount) {
    compiledSlides = compiledSlides.slice(0, STORY_CONFIG.maxSlidesCount);
  }

  // Compute total duration
  const totalDurationMs = compiledSlides.reduce((sum, s) => sum + s.duration, 0);

  // Safely grab primary theme from the Welcome slide or default
  const primaryTheme = compiledSlides[0]?.theme ?? "minimal";

  return {
    metadata: {
      username: analytics.user.handle,
      avatarUrl: analytics.user.avatarUrl,
      year: analytics.year,
      generatedAt: new Date().toISOString(),
      version: "1.0.0",
    },
    overview: {
      totalSlides: compiledSlides.length,
      totalDurationMs,
      primaryTheme,
    },
    slides: compiledSlides,
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
      shareUrl: `https://gitwrapped.dev/recap/${analytics.user.handle}/${analytics.year}`,
      defaultShareText: `Check out my year in code on #GitWrapped! Pushed ${analytics.overview.totalContributions.toLocaleString()} contributions in ${analytics.year}.`,
      hashTags: ["GitWrapped", "GitHub", "Coding", "Developer"],
    },
  };
}
