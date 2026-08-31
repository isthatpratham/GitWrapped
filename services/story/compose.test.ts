import { describe, expect, it } from "vitest";
import { composeStory } from "./compose";
import { baseAnalytics, moderateAnalytics, richAnalytics } from "./test-fixtures";

describe("dynamic story length", () => {
  it("keeps a low-data story short without padding", () => {
    const story = composeStory(baseAnalytics());
    expect(story.slides[0]?.type).toBe("Welcome");
    expect(story.slides[story.slides.length - 1]?.type).toBe("Closing");
    expect(story.slides.length).toBeLessThanOrEqual(5);
    expect(story.slides.some((slide) => slide.type === "Productivity")).toBe(false);
  });

  it("gives a high-signal user a richer story than a low-data user", () => {
    const low = composeStory(baseAnalytics());
    const moderate = composeStory(moderateAnalytics());
    const rich = composeStory(richAnalytics());
    expect(moderate.slides.length).toBeGreaterThanOrEqual(low.slides.length);
    expect(rich.slides.length).toBeGreaterThan(moderate.slides.length);
    expect(rich.slides.length).toBeLessThanOrEqual(15);
    expect(rich.slides.some((slide) => slide.type === "Welcome")).toBe(true);
    expect(rich.slides.some((slide) => slide.type === "Closing")).toBe(true);
  });

  it("omits a Night Owl slide when night activity is not supported", () => {
    const story = composeStory(moderateAnalytics());
    expect(story.slides.some((slide) => slide.type === "Productivity")).toBe(false);
    expect(story.slides.some((slide) => slide.insightId === "night-activity")).toBe(false);
  });

  it("does not insert a By The Numbers summary slide by default", () => {
    expect(composeStory(richAnalytics()).slides.some((slide) => slide.type === "Summary")).toBe(false);
  });
});
