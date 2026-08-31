import { describe, expect, it } from "vitest";
import { buildChapterProgress, segmentFill } from "./progress";

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

  it("groups segments by chapter for a dynamic story length", () => {
    const progress = buildChapterProgress(slides, 2, 25);
    expect(progress.groups).toHaveLength(3);
    expect(progress.currentTitle).toBe("Your Year");
    expect(progress.chapterLabel).toBe("Your Year, part 2 of 2");
    expect(progress.storyLabel).toBe("Slide 3 of 4");
    expect(progress.groups[1]?.segments.map((segment) => segment.fill)).toEqual([100, 25]);
  });

  it("handles an empty story without inventing slides", () => {
    const progress = buildChapterProgress([], -1, 0);
    expect(progress.groups).toEqual([]);
    expect(progress.currentChapter).toBeNull();
    expect(progress.storyLabel).toBe("No slides");
  });
});
