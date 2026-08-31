import { STORY_INTELLIGENCE } from "./constants";
import { generateStoryInsights } from "./generate";
import { rankStoryInsights } from "./rank";
import { collapseRedundantInsights } from "./redundancy";
import type { RankedInsight } from "./types";
import { CHAPTER_ORDER } from "./types";
import type { AnalyticsResult } from "@/services/analytics";

function preferChapterDiversity(insights: ReadonlyArray<RankedInsight>, limit: number): RankedInsight[] {
  const selected: RankedInsight[] = [];
  const remaining = [...insights];

  while (selected.length < limit && remaining.length > 0) {
    const lastChapter = selected[selected.length - 1]?.chapter;
    const nextIndex = remaining.findIndex((insight) => insight.chapter !== lastChapter);
    const pickAt = nextIndex === -1 ? 0 : nextIndex;
    const picked = remaining.splice(pickAt, 1)[0];
    if (picked) selected.push(picked);
  }

  selected.sort((a, b) => CHAPTER_ORDER.indexOf(a.chapter) - CHAPTER_ORDER.indexOf(b.chapter) || b.rankScore - a.rankScore || a.id.localeCompare(b.id));
  return selected;
}

export function selectStoryInsights(analytics: AnalyticsResult): readonly RankedInsight[] {
  const generated = generateStoryInsights(analytics);
  const ranked = rankStoryInsights(generated);
  const unique = collapseRedundantInsights(ranked);

  const structural = unique.filter((insight) => insight.kind === "contribution-total");
  const body = unique.filter((insight) => insight.kind !== "contribution-total");

  const reserved = 2 + structural.length; // Welcome + Closing + Overview
  const bodyLimit = Math.max(0, STORY_INTELLIGENCE.maxSlides - reserved);
  const selectedBody = preferChapterDiversity(body, bodyLimit);

  return [...structural, ...selectedBody];
}

export function buildStoryIntelligence(analytics: AnalyticsResult) {
  const generated = generateStoryInsights(analytics);
  const ranked = rankStoryInsights(generated);
  const unique = collapseRedundantInsights(ranked);
  const selected = selectStoryInsights(analytics);
  return { generated, ranked, unique, selected };
}
