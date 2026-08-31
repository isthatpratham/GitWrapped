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
