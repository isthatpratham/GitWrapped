import { describe, expect, it } from "vitest";
import { chapterChanged, isUnavailableMoment, slideMotion } from "./motion";

describe("player motion", () => {
  it("uses a simple fade when reduced motion is requested", () => {
    const motion = slideMotion(true);
    expect(motion.initial).toEqual({ opacity: 0 });
    expect(motion.animate).toEqual({ opacity: 1 });
    expect(motion.exit).toEqual({ opacity: 0 });
    expect(motion.durationSec).toBeLessThan(0.3);
  });

  it("uses a vertical fade for the default cinematic transition", () => {
    const motion = slideMotion(false);
    expect(motion.initial.y).toBe(12);
    expect(motion.durationSec).toBe(0.5);
  });

  it("detects chapter changes for cinematic cues", () => {
    expect(chapterChanged("OPENING", "YOUR_YEAR")).toBe(true);
    expect(chapterChanged("YOUR_YEAR", "YOUR_YEAR")).toBe(false);
    expect(chapterChanged(null, "OPENING")).toBe(false);
  });

  it("treats insight slides without available data as untellable moments", () => {
    expect(
      isUnavailableMoment({
        insightId: "night-activity",
        availability: { status: "unavailable" },
      }),
    ).toBe(true);
    expect(
      isUnavailableMoment({
        insightId: null,
        availability: { status: "unavailable" },
      }),
    ).toBe(false);
  });
});
