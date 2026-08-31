import { describe, expect, it } from "vitest";
import { LOADING_LINES, READY_LINE, loadingLine, shouldEnterStory } from "./loading";

describe("cinematic loading copy", () => {
  it("walks through narrative lines while the story is still loading", () => {
    expect(loadingLine(0, false)).toBe(LOADING_LINES[0]);
    expect(loadingLine(1500, false)).toBe(LOADING_LINES[1]);
    expect(loadingLine(4000, false)).toBe(LOADING_LINES[2]);
  });

  it("shows the ready line as soon as generation succeeds", () => {
    expect(loadingLine(50, true)).toBe(READY_LINE);
    expect(shouldEnterStory(true, 399)).toBe(false);
    expect(shouldEnterStory(true, 400)).toBe(true);
    expect(shouldEnterStory(false, 4000)).toBe(false);
  });
});
