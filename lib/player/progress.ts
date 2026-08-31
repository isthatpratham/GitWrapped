import { CHAPTER_TITLES, type StoryChapter } from "@/services/story";

export interface ProgressSlide {
  readonly chapter: StoryChapter;
}

export interface ProgressSegment {
  readonly index: number;
  readonly fill: number;
  readonly chapter: StoryChapter;
}

export interface ChapterProgressGroup {
  readonly chapter: StoryChapter;
  readonly title: string;
  readonly startIndex: number;
  readonly segments: readonly ProgressSegment[];
}

export function segmentFill(index: number, activeIndex: number, slideProgress: number): number {
  if (index < activeIndex) return 100;
  if (index === activeIndex) return Math.max(0, Math.min(100, slideProgress));
  return 0;
}

/**
 * Overall story completion, 0–100.
 * Splash (index < 0) is 0. Share (index >= slideCount) is 100.
 * No off-by-one: slide N of C at p% is ((N + p/100) / C) * 100.
 */
export function storyProgressPercent(
  activeIndex: number,
  slideCount: number,
  slideProgress: number,
): number {
  if (slideCount <= 0) return 0;
  if (activeIndex < 0) return 0;
  if (activeIndex >= slideCount) return 100;
  const filled = activeIndex + Math.max(0, Math.min(100, slideProgress)) / 100;
  return Math.max(0, Math.min(100, (filled / slideCount) * 100));
}

export function flattenProgressSegments(
  groups: readonly ChapterProgressGroup[],
): readonly ProgressSegment[] {
  return groups.flatMap((group) => group.segments);
}

export function buildChapterProgress(
  slides: ReadonlyArray<ProgressSlide>,
  activeIndex: number,
  slideProgress: number,
): {
  readonly groups: readonly ChapterProgressGroup[];
  readonly currentChapter: StoryChapter | null;
  readonly currentTitle: string;
  readonly storyLabel: string;
  readonly chapterLabel: string;
} {
  const groups: ChapterProgressGroup[] = [];

  for (let index = 0; index < slides.length; index += 1) {
    const slide = slides[index];
    if (!slide) continue;
    const last = groups[groups.length - 1];
    const segment: ProgressSegment = {
      index,
      fill: segmentFill(index, activeIndex, slideProgress),
      chapter: slide.chapter,
    };
    if (last && last.chapter === slide.chapter) {
      groups[groups.length - 1] = {
        ...last,
        segments: [...last.segments, segment],
      };
    } else {
      groups.push({
        chapter: slide.chapter,
        title: CHAPTER_TITLES[slide.chapter],
        startIndex: index,
        segments: [segment],
      });
    }
  }

  const current = slides[activeIndex];
  const currentChapter = current?.chapter ?? null;
  const currentTitle = currentChapter ? CHAPTER_TITLES[currentChapter] : "";
  const group = groups.find((item) => item.chapter === currentChapter);
  const chapterPosition = group ? activeIndex - group.startIndex + 1 : 0;
  const chapterCount = group?.segments.length ?? 0;

  return {
    groups,
    currentChapter,
    currentTitle,
    storyLabel: slides.length === 0 ? "No slides" : `Slide ${activeIndex + 1} of ${slides.length}`,
    chapterLabel:
      currentTitle && chapterCount > 0
        ? `${currentTitle}, part ${chapterPosition} of ${chapterCount}`
        : currentTitle,
  };
}
