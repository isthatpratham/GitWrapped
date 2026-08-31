import { describe, expect, it } from "vitest";
import {
  canNavigate,
  clampPlayerIndex,
  keyboardNavAction,
  nextPlayerIndex,
  playerPhase,
  prevPlayerIndex,
  replayPlayerIndex,
  swipeNavDirection,
  wheelNavDirection,
} from "./navigation";

describe("story player navigation", () => {
  it("advances through splash, dynamic slides, and share without a fixed length", () => {
    expect(playerPhase(-1, 4)).toBe("splash");
    expect(playerPhase(0, 4)).toBe("slide");
    expect(playerPhase(3, 4)).toBe("slide");
    expect(playerPhase(4, 4)).toBe("share");
    expect(nextPlayerIndex(-1, 3)).toBe(0);
    expect(nextPlayerIndex(2, 3)).toBe(3);
    expect(nextPlayerIndex(3, 3)).toBe(3);
    expect(prevPlayerIndex(0, 3)).toBe(-1);
    expect(prevPlayerIndex(-1, 3)).toBe(-1);
  });

  it("clamps indexes for short and long stories", () => {
    expect(clampPlayerIndex(99, 2)).toBe(2);
    expect(clampPlayerIndex(-8, 2)).toBe(-1);
    expect(nextPlayerIndex(0, 1)).toBe(1);
  });

  it("maps keyboard controls to next, previous, and close", () => {
    expect(keyboardNavAction("ArrowRight")).toBe("next");
    expect(keyboardNavAction("Space")).toBe("next");
    expect(keyboardNavAction("Enter")).toBe("next");
    expect(keyboardNavAction("ArrowLeft")).toBe("prev");
    expect(keyboardNavAction("Escape")).toBe("close");
    expect(keyboardNavAction("KeyP")).toBeNull();
  });

  it("replays from the opening without requiring a new story", () => {
    expect(replayPlayerIndex()).toBe(-1);
    expect(playerPhase(replayPlayerIndex(), 9)).toBe("splash");
  });

  it("locks double navigation during the transition window", () => {
    expect(canNavigate(1000, 600, 500)).toBe(false);
    expect(canNavigate(1100, 600, 500)).toBe(true);
  });

  it("reads wheel and swipe direction without diagonal noise", () => {
    expect(wheelNavDirection(80)).toBe("next");
    expect(wheelNavDirection(-80)).toBe("prev");
    expect(wheelNavDirection(10)).toBeNull();
    expect(swipeNavDirection(-80, 10)).toBe("next");
    expect(swipeNavDirection(80, 10)).toBe("prev");
    expect(swipeNavDirection(-80, 90)).toBeNull();
  });
});
