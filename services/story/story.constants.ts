// ---------------------------------------------------------------------------
// Story Engine — Constants
// ---------------------------------------------------------------------------
// Configuration parameters for default durations, prioritisation rules,
// motion presets, transition styles, and standard visual themes.
// ---------------------------------------------------------------------------

import type { StoryTheme, MotionPreset, SlideTransition } from "./story.types";

export const STORY_CONFIG = {
  /** Default duration for standard slide presentation (in milliseconds). */
  defaultDurationMs: 6000,

  /** Maximum count of slides allowed in a story deck to prevent viewer fatigue. */
  maxSlidesCount: 15,
  /** Opening + year + finale is enough for low-data recaps. Do not pad. */
  minSlidesCount: 3,

  // Priority ranking for slide types (lower values are positioned earlier)
  priorities: {
    Welcome: 10,
    Overview: 20,
    Contributions: 30,
    Consistency: 40,
    Productivity: 50,
    Languages: 60,
    Repositories: 70,
    Organizations: 80,
    Achievements: 90,
    Timeline: 100,
    Highlights: 110,
    Summary: 120,
    Closing: 130,
  } as Record<string, number>,

  // Visual Themes mapping for each slide
  themes: {
    Welcome: "minimal" as StoryTheme,
    Overview: "focus" as StoryTheme,
    Contributions: "highlight" as StoryTheme,
    Consistency: "reflection" as StoryTheme,
    Productivity: "highlight" as StoryTheme,
    Languages: "focus" as StoryTheme,
    Repositories: "focus" as StoryTheme,
    Organizations: "minimal" as StoryTheme,
    Achievements: "celebration" as StoryTheme,
    Timeline: "reflection" as StoryTheme,
    Highlights: "celebration" as StoryTheme,
    Summary: "summary" as StoryTheme,
    Closing: "celebration" as StoryTheme,
  } as Record<string, StoryTheme>,

  // Motion preset mapping for each slide
  motion: {
    Welcome: "heroReveal" as MotionPreset,
    Overview: "fadeUp" as MotionPreset,
    Contributions: "chartReveal" as MotionPreset,
    Consistency: "counterReveal" as MotionPreset,
    Productivity: "chartReveal" as MotionPreset,
    Languages: "fadeUp" as MotionPreset,
    Repositories: "fadeUp" as MotionPreset,
    Organizations: "fade" as MotionPreset,
    Achievements: "heroReveal" as MotionPreset,
    Timeline: "timelineReveal" as MotionPreset,
    Highlights: "summaryReveal" as MotionPreset,
    Summary: "summaryReveal" as MotionPreset,
    Closing: "heroReveal" as MotionPreset,
  } as Record<string, MotionPreset>,

  // Transition mapping for each slide
  transitions: {
    Welcome: "crossfade" as SlideTransition,
    Overview: "slide" as SlideTransition,
    Contributions: "slide" as SlideTransition,
    Consistency: "slide" as SlideTransition,
    Productivity: "slide" as SlideTransition,
    Languages: "slide" as SlideTransition,
    Repositories: "slide" as SlideTransition,
    Organizations: "slide" as SlideTransition,
    Achievements: "shared" as SlideTransition,
    Timeline: "slide" as SlideTransition,
    Highlights: "shared" as SlideTransition,
    Summary: "crossfade" as SlideTransition,
    Closing: "crossfade" as SlideTransition,
  } as Record<string, SlideTransition>,
} as const;
