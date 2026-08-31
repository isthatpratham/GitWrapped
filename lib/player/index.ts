export {
  PLAYER_SPLASH_INDEX,
  NAV_LOCK_MS,
  WHEEL_THRESHOLD,
  SWIPE_MIN_DISTANCE,
  shareIndex,
  playerPhase,
  clampPlayerIndex,
  nextPlayerIndex,
  prevPlayerIndex,
  replayPlayerIndex,
  canNavigate,
  keyboardNavAction,
  wheelNavDirection,
  swipeNavDirection,
} from "./navigation";
export type { PlayerPhase, NavDirection, KeyboardNavAction } from "./navigation";

export { segmentFill, buildChapterProgress } from "./progress";
export type { ProgressSlide, ProgressSegment, ChapterProgressGroup } from "./progress";

export { LOADING_LINES, READY_LINE, loadingLine, shouldEnterStory } from "./loading";

export { recapErrorCopy, recapErrorCode } from "./errors";
export type { RecapErrorCopy } from "./errors";

export {
  recapShareUrl,
  shareCardStats,
  buildShareRequest,
  nativeShareSupported,
} from "./share";
export type { ShareRequest, ShareCardStats, ShareMethod } from "./share";

export { escapeXml, shareCardFileStem, buildShareCardSvg } from "./share-card";

export { SLIDE_TRANSITION_MS, REDUCED_TRANSITION_MS, slideMotion, chapterChanged, isUnavailableMoment } from "./motion";
export type { SlideMotion } from "./motion";
