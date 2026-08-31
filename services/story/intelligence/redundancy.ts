import { STORY_INTELLIGENCE } from "./constants";
import type { InsightFamily, RankedInsight } from "./types";

const ACHIEVEMENT_FAMILY_OVERLAP: ReadonlyArray<{
  readonly achievementId: string;
  readonly families: readonly InsightFamily[];
}> = [
  { achievementId: "night-builder", families: ["coding-time"] },
  { achievementId: "streak-keeper", families: ["streak"] },
  { achievementId: "one-project-army", families: ["repository"] },
  { achievementId: "polyglot", families: ["language"] },
  { achievementId: "explorer", families: ["language"] },
  { achievementId: "comeback", families: ["comeback"] },
  { achievementId: "open-source-builder", families: ["organization"] },
];

function isWeakBodyInsight(insight: RankedInsight): boolean {
  return insight.kind !== "contribution-total" && insight.strength < STORY_INTELLIGENCE.minBodyStrength;
}

function rhythmOverlapsSelected(insight: RankedInsight, usedFamilies: ReadonlySet<InsightFamily>): boolean {
  if (insight.kind !== "developer-rhythm" || insight.payload.kind !== "developer-rhythm") {
    return false;
  }
  const rhythm = insight.payload.rhythm;
  if (rhythm === "Night Builder" && usedFamilies.has("coding-time")) return true;
  if (rhythm === "Comeback Builder" && usedFamilies.has("comeback")) return true;
  if (rhythm === "Specialist" && usedFamilies.has("language")) return true;
  if (rhythm === "Explorer" && usedFamilies.has("language")) return true;
  if (rhythm === "Open Source Builder" && usedFamilies.has("organization")) return true;
  if (rhythm === "Consistent Builder" && usedFamilies.has("streak")) return true;
  if (rhythm === "Sprint Builder" && usedFamilies.has("anomaly")) return true;
  return false;
}

export function collapseRedundantInsights(ranked: ReadonlyArray<RankedInsight>): RankedInsight[] {
  const kept: RankedInsight[] = [];
  const usedFamilies = new Set<InsightFamily>();
  const originalOrder = new Map(ranked.map((insight, index) => [insight.id, index]));

  for (const insight of ranked) {
    if (insight.kind === "achievements") continue;
    if (isWeakBodyInsight(insight)) continue;
    if (rhythmOverlapsSelected(insight, usedFamilies)) continue;
    if (usedFamilies.has(insight.family)) continue;
    usedFamilies.add(insight.family);
    kept.push(insight);
  }

  for (const insight of ranked) {
    if (insight.kind !== "achievements") continue;
    if (isWeakBodyInsight(insight)) continue;
    const payload = insight.payload.kind === "achievements" ? insight.payload : null;
    if (!payload) continue;
    const remaining = payload.achievements.filter((achievement) => {
      const overlap = ACHIEVEMENT_FAMILY_OVERLAP.find((item) => item.achievementId === achievement.id);
      if (!overlap) return true;
      return !overlap.families.some((family) => usedFamilies.has(family));
    });
    if (remaining.length === 0) continue;
    kept.push({
      ...insight,
      evidence: remaining.map((item) => ({ label: item.title, value: item.reason })),
      heroValue: remaining.length,
      payload: { kind: "achievements", achievements: remaining },
    });
    usedFamilies.add("achievement");
  }

  kept.sort((a, b) => (originalOrder.get(a.id) ?? 0) - (originalOrder.get(b.id) ?? 0));
  return kept;
}
