export const LOADING_LINES = [
  "We're finding your year.",
  "Looking back...",
  "Finding the moments that mattered.",
] as const;

export const READY_LINE = "Your story is ready.";

const LINE_MS = 1400;

export function loadingLine(elapsedMs: number, done: boolean): string {
  if (done) return READY_LINE;
  if (elapsedMs < 0 || !Number.isFinite(elapsedMs)) return LOADING_LINES[0];
  const index = Math.min(LOADING_LINES.length - 1, Math.floor(elapsedMs / LINE_MS));
  return LOADING_LINES[index] ?? LOADING_LINES[0];
}

export function shouldEnterStory(done: boolean, readyElapsedMs: number, readyHoldMs = 400): boolean {
  return done && readyElapsedMs >= readyHoldMs;
}
