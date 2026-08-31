import type { CommitMessageProfile } from "@/services/analytics/analytics.types";

const SECRET_PATTERN = new RegExp(
  ["ghp_", "github" + "_pat_", "akia[a-z0-9]", "xox[baprs]-"].join("|"),
  "i",
);
const CONVENTIONAL =
  /^(feat|fix|docs|style|refactor|test|chore|build|ci|perf|revert)(!)?(\([^)]*\))?:/i;
const FINAL_PATTERN = /\bfinal(?:[-_\s]*final)*\d*\b/i;
const WORD_PATTERN = /[a-z][a-z0-9]{2,}/g;
const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "into",
  "this",
  "that",
  "was",
  "are",
  "you",
  "our",
  "add",
  "added",
  "more",
  "some",
  "just",
  "use",
  "using",
  "make",
  "made",
  "new",
  "fix",
  "feat",
  "docs",
  "chore",
  "refactor",
  "update",
  "final",
]);

export function looksLikeSecretText(text: string): boolean {
  const lower = text.toLowerCase();
  if (SECRET_PATTERN.test(text)) return true;
  if (lower.includes("-----begin")) return true;
  return false;
}

export function analyzeCommitMessageProfile(summaries: ReadonlyArray<string>): CommitMessageProfile {
  let sampleSize = 0;
  let feat = 0;
  let fix = 0;
  let refactor = 0;
  let docs = 0;
  let chore = 0;
  let update = 0;
  let finalCount = 0;
  const keywordCounts = new Map<string, number>();

  for (const raw of summaries) {
    const summary = raw.trim();
    if (!summary || looksLikeSecretText(summary)) continue;

    sampleSize += 1;
    const lower = summary.toLowerCase();
    const conventional = CONVENTIONAL.exec(summary);
    const prefix = conventional?.[1]?.toLowerCase();

    if (prefix === "feat") feat += 1;
    if (prefix === "fix") fix += 1;
    if (prefix === "refactor") refactor += 1;
    if (prefix === "docs") docs += 1;
    if (prefix === "chore") chore += 1;
    if (/\bupdate\b/.test(lower) || prefix === "perf") update += 1;
    if (FINAL_PATTERN.test(lower)) finalCount += 1;

    const remainder = conventional ? summary.slice(conventional[0].length) : summary;
    const words = remainder.toLowerCase().match(WORD_PATTERN) ?? [];
    for (const word of words) {
      if (STOPWORDS.has(word) || looksLikeSecretText(word)) continue;
      keywordCounts.set(word, (keywordCounts.get(word) ?? 0) + 1);
    }
  }

  let topKeyword: CommitMessageProfile["topKeyword"] = null;
  for (const [word, count] of keywordCounts) {
    if (
      topKeyword === null ||
      count > topKeyword.count ||
      (count === topKeyword.count && word < topKeyword.word)
    ) {
      topKeyword = { word, count };
    }
  }

  return {
    sampleSize,
    feat,
    fix,
    refactor,
    docs,
    chore,
    update,
    final: finalCount,
    topKeyword,
  };
}
