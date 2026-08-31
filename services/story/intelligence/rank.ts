import { STORY_INTELLIGENCE } from "./constants";
import type { RankedInsight, StoryInsight } from "./types";

export function rankScoreFor(insight: StoryInsight): number {
  const availabilityBonus =
    insight.availability.status === "available" && insight.availability.confidence === "measured"
      ? STORY_INTELLIGENCE.measuredAvailabilityBonus
      : STORY_INTELLIGENCE.estimatedAvailabilityBonus;

  const shareable = insight.shareable ? STORY_INTELLIGENCE.shareableBonus : 0;

  return (
    (insight.strength * 45 +
      insight.uniqueness * 15 +
      insight.narrativeValue * 15 +
      insight.surprise * 10 +
      shareable * 10 +
      availabilityBonus * 5) /
    100
  );
}

export function rankStoryInsights(insights: ReadonlyArray<StoryInsight>): RankedInsight[] {
  const ranked: RankedInsight[] = insights
    .filter((insight) => insight.availability.status === "available")
    .map((insight) => ({
      ...insight,
      rankScore: rankScoreFor(insight),
    }));

  ranked.sort((a, b) => {
    if (b.rankScore !== a.rankScore) return b.rankScore - a.rankScore;
    if (a.kind !== b.kind) return a.kind.localeCompare(b.kind);
    return a.id.localeCompare(b.id);
  });

  return ranked;
}
