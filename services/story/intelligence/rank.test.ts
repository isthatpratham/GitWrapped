import { describe, expect, it } from "vitest";
import { availableMeasured, unavailable } from "@/domain/models";
import { rankScoreFor, rankStoryInsights } from "./rank";
import type { StoryInsight } from "./types";

function insight(overrides: Partial<StoryInsight> & Pick<StoryInsight, "id" | "kind" | "strength" | "shareable">): StoryInsight {
  return {
    family: "year",
    chapter: "YOUR_YEAR",
    slideType: "Overview",
    availability: availableMeasured(),
    uniqueness: 40,
    narrativeValue: 40,
    surprise: 10,
    heroValue: null,
    evidence: [],
    payload: { kind: "contribution-total", total: 10, year: 2026 },
    ...overrides,
  };
}

describe("rankStoryInsights", () => {
  it("ranks a stronger insight above a weaker one", () => {
    const ranked = rankStoryInsights([
      insight({ id: "weak", kind: "contribution-total", strength: 20, shareable: false }),
      insight({ id: "strong", kind: "longest-streak", family: "streak", strength: 90, shareable: false }),
    ]);
    expect(ranked[0]?.id).toBe("strong");
  });

  it("lets shareability lift an otherwise equal insight", () => {
    const shared = insight({ id: "shared", kind: "peak-day", strength: 50, shareable: true, uniqueness: 50, narrativeValue: 50, surprise: 50 });
    const privateInsight = insight({ id: "private", kind: "peak-day", strength: 50, shareable: false, uniqueness: 50, narrativeValue: 50, surprise: 50 });
    expect(rankScoreFor(shared)).toBeGreaterThan(rankScoreFor(privateInsight));
  });

  it("is deterministic for the same input order-independently after sort", () => {
    const a = insight({ id: "a", kind: "comeback", strength: 40, shareable: true });
    const b = insight({ id: "b", kind: "monthly-growth", strength: 40, shareable: true });
    const left = rankStoryInsights([a, b]).map((item) => item.id);
    const right = rankStoryInsights([b, a]).map((item) => item.id);
    expect(left).toEqual(right);
  });

  it("excludes unavailable insights from ranking", () => {
    const ranked = rankStoryInsights([
      insight({
        id: "gone",
        kind: "peak-day",
        strength: 99,
        shareable: true,
        availability: unavailable("insufficient_data"),
      }),
      insight({ id: "kept", kind: "contribution-total", strength: 10, shareable: false }),
    ]);
    expect(ranked.map((item) => item.id)).toEqual(["kept"]);
  });
});
