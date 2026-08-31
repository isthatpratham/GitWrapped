export const SLIDE_TRANSITION_MS = 500;
export const REDUCED_TRANSITION_MS = 150;

export interface SlideMotion {
  readonly initial: { readonly opacity: number; readonly y?: number; readonly scale?: number };
  readonly animate: { readonly opacity: number; readonly y?: number; readonly scale?: number };
  readonly exit: { readonly opacity: number; readonly y?: number; readonly scale?: number };
  readonly durationSec: number;
}

export function slideMotion(reducedMotion: boolean): SlideMotion {
  if (reducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      durationSec: REDUCED_TRANSITION_MS / 1000,
    };
  }
  return {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    durationSec: SLIDE_TRANSITION_MS / 1000,
  };
}

export function chapterChanged(
  previousChapter: string | null | undefined,
  nextChapter: string | null | undefined,
): boolean {
  if (!previousChapter || !nextChapter) return false;
  return previousChapter !== nextChapter;
}

export function isUnavailableMoment(slide: {
  readonly insightId: string | null;
  readonly availability: { readonly status: string };
}): boolean {
  return Boolean(slide.insightId) && slide.availability.status !== "available";
}
