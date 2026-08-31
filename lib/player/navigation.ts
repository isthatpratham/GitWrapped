export const PLAYER_SPLASH_INDEX = -1;
export const NAV_LOCK_MS = 500;
export const WHEEL_THRESHOLD = 48;
export const SWIPE_MIN_DISTANCE = 56;

export type PlayerPhase = "splash" | "slide" | "share";
export type NavDirection = "next" | "prev";
export type KeyboardNavAction = "next" | "prev" | "close";

export function shareIndex(slideCount: number): number {
  return Math.max(0, slideCount);
}

export function playerPhase(index: number, slideCount: number): PlayerPhase {
  if (index < 0) return "splash";
  if (index >= slideCount) return "share";
  return "slide";
}

export function clampPlayerIndex(index: number, slideCount: number): number {
  const max = shareIndex(slideCount);
  if (index < PLAYER_SPLASH_INDEX) return PLAYER_SPLASH_INDEX;
  if (index > max) return max;
  return index;
}

export function nextPlayerIndex(index: number, slideCount: number): number {
  return clampPlayerIndex(index + 1, slideCount);
}

export function prevPlayerIndex(index: number, slideCount: number): number {
  return clampPlayerIndex(index - 1, slideCount);
}

export function replayPlayerIndex(): number {
  return PLAYER_SPLASH_INDEX;
}

export function canNavigate(nowMs: number, lastNavAtMs: number, lockMs: number = NAV_LOCK_MS): boolean {
  return nowMs - lastNavAtMs >= lockMs;
}

export function keyboardNavAction(code: string): KeyboardNavAction | null {
  if (code === "ArrowRight" || code === "Space" || code === "Enter") return "next";
  if (code === "ArrowLeft") return "prev";
  if (code === "Escape") return "close";
  return null;
}

const INTERACTIVE_PLAYER_SELECTOR = "button, a, input, textarea, select, [role='button']";

/**
 * True when a key event originated on a control that must keep Space/Enter.
 * Duck-typed so unit tests can run in the Node environment.
 */
export function isInteractivePlayerTarget(target: EventTarget | null): boolean {
  if (target == null || typeof target !== "object") return false;
  const node = target as {
    closest?: (selector: string) => unknown;
    matches?: (selector: string) => boolean;
  };
  if (typeof node.closest === "function") {
    return Boolean(node.closest(INTERACTIVE_PLAYER_SELECTOR));
  }
  if (typeof node.matches === "function") {
    return Boolean(node.matches(INTERACTIVE_PLAYER_SELECTOR));
  }
  return false;
}

/**
 * Resolve a player shortcut, leaving Space/Enter on focused chrome (close, pause, share).
 * Escape always closes.
 */
export function resolvePlayerKeyAction(
  code: string,
  target: EventTarget | null,
): KeyboardNavAction | null {
  const action = keyboardNavAction(code);
  if (!action) return null;
  if (action === "close") return "close";
  if ((code === "Space" || code === "Enter") && isInteractivePlayerTarget(target)) {
    return null;
  }
  return action;
}

export function wheelNavDirection(deltaY: number, threshold: number = WHEEL_THRESHOLD): NavDirection | null {
  if (deltaY >= threshold) return "next";
  if (deltaY <= -threshold) return "prev";
  return null;
}

export function swipeNavDirection(
  deltaX: number,
  deltaY: number,
  minDistance: number = SWIPE_MIN_DISTANCE,
): NavDirection | null {
  if (Math.abs(deltaX) < minDistance) return null;
  if (Math.abs(deltaX) < Math.abs(deltaY)) return null;
  return deltaX < 0 ? "next" : "prev";
}
