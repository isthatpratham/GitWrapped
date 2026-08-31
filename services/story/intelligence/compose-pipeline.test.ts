import { describe, expect, it } from "vitest";
import { composeStory } from "../compose";
import { CHAPTER_ORDER } from "./types";
import { richAnalytics } from "../test-fixtures";

describe("story composition", () => {
  it("always opens and closes the story", () => {
    const story = composeStory(richAnalytics());
    expect(story.slides[0]?.type).toBe("Welcome");
    expect(story.slides[0]?.chapter).toBe("OPENING");
    expect(story.slides[story.slides.length - 1]?.type).toBe("Closing");
    expect(story.slides[story.slides.length - 1]?.chapter).toBe("FINALE");
  });

  it("orders chapters along the narrative arc", () => {
    const story = composeStory(richAnalytics());
    const indexes = story.slides.map((slide) => CHAPTER_ORDER.indexOf(slide.chapter));
    const sorted = [...indexes].sort((a, b) => a - b);
    expect(indexes).toEqual(sorted);
  });

  it("does not emit unavailable or invalid slide types", () => {
    const story = composeStory(richAnalytics());
    const allowed = new Set([
      "Welcome",
      "Overview",
      "Contributions",
      "Consistency",
      "Productivity",
      "Languages",
      "Repositories",
      "Organizations",
      "Achievements",
      "Timeline",
      "Highlights",
      "Closing",
    ]);
    for (const slide of story.slides) {
      expect(allowed.has(slide.type)).toBe(true);
      expect(slide.headline.length).toBeGreaterThan(0);
    }
  });

  it("is deterministic for the same analytics snapshot", () => {
    const analytics = richAnalytics();
    const first = composeStory(analytics);
    const second = composeStory(analytics);
    expect(first.slides.map((slide) => slide.id)).toEqual(second.slides.map((slide) => slide.id));
    expect(first.slides.map((slide) => slide.headline)).toEqual(second.slides.map((slide) => slide.headline));
    expect(first.metadata.generatedAt).toBe(analytics.computedAt);
    expect(first.rhythm).toBe(second.rhythm);
  });
});
