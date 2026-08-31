import { describe, expect, it } from "vitest";
import { buildChapterProgress, flattenProgressSegments, segmentFill, storyProgressPercent } from "./progress";

describe("story progress", () => {
  const slides = [
    { chapter: "OPENING" as const },
    { chapter: "YOUR_YEAR" as const },
    { chapter: "YOUR_YEAR" as const },
    { chapter: "FINALE" as const },
  ];

  it("fills completed slides and the active slide by elapsed progress", () => {
    expect(segmentFill(0, 2, 40)).toBe(100);
    expect(segmentFill(2, 2, 40)).toBe(40);
    expect(segmentFill(3, 2, 40)).toBe(0);
  });

  it("clears later segments when moving backward so state is not stale", () => {
    expect(segmentFill(2, 1, 10)).toBe(0);
    expect(segmentFill(1, 1, 10)).toBe(10);
    expect(segmentFill(0, 1, 10)).toBe(100);
  });

  it("groups segments by chapter for a dynamic story length", () => {
    const progress = buildChapterProgress(slides, 2, 25);
    expect(progress.groups).toHaveLength(3);
    expect(progress.currentTitle).toBe("Your Year");
    expect(progress.chapterLabel).toBe("Your Year, part 2 of 2");
    expect(progress.storyLabel).toBe("Slide 3 of 4");
    expect(progress.groups[1]?.segments.map((segment) => segment.fill)).toEqual([100, 25]);
  });

  it("flattens every slide to an equal-weight track regardless of chapter size", () => {
    const progress = buildChapterProgress(slides, 0, 0);
    const flat = flattenProgressSegments(progress.groups);
    expect(flat.map((segment) => segment.index)).toEqual([0, 1, 2, 3]);
    expect(progress.groups[0]?.segments).toHaveLength(1);
    expect(progress.groups[1]?.segments).toHaveLength(2);
    expect(flat).toHaveLength(slides.length);
  });

  it("keeps overall progress aligned with the current slide, including splash and share", () => {
    expect(storyProgressPercent(-1, 8, 40)).toBe(0);
    expect(storyProgressPercent(0, 8, 0)).toBe(0);
    expect(storyProgressPercent(0, 8, 50)).toBe(6.25);
    expect(storyProgressPercent(3, 8, 0)).toBe(37.5);
    expect(storyProgressPercent(7, 8, 100)).toBe(100);
    expect(storyProgressPercent(8, 8, 0)).toBe(100);
    expect(storyProgressPercent(0, 0, 50)).toBe(0);
  });

  it("handles an empty story without inventing slides", () => {
    const progress = buildChapterProgress([], -1, 0);
    expect(progress.groups).toEqual([]);
    expect(flattenProgressSegments(progress.groups)).toEqual([]);
    expect(progress.currentChapter).toBeNull();
    expect(progress.storyLabel).toBe("No slides");
  });
});
