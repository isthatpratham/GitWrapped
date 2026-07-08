// ---------------------------------------------------------------------------
// Domain Model: Language
// ---------------------------------------------------------------------------
// Represents aggregated language usage across a user's entire repository
// portfolio. This model is the input to the Analytics Engine's language
// breakdown calculations.
//
// Unlike the per-repository language data in `Repository`, this model
// holds portfolio-level aggregates ready for presentation.
//
// No calculation is performed in this model — it stores raw measurements.
// The Analytics Engine derives percentages, rankings, and trends.
// ---------------------------------------------------------------------------

/**
 * Aggregated usage of a single programming language across all repositories.
 */
export interface LanguageUsage {
  /** Language name, e.g. "TypeScript". */
  readonly name: string;
  /**
   * Hex color assigned to this language by GitHub, e.g. "#3178c6".
   * Null for languages without an assigned colour.
   */
  readonly color: string | null;
  /**
   * Total bytes of code written in this language across all repositories.
   * Used by the Analytics Engine to compute usage percentage.
   */
  readonly totalBytes: number;
  /**
   * Number of repositories in the user's portfolio that use this language.
   */
  readonly repositoryCount: number;
}

/**
 * Portfolio-level language data for a user.
 * Contains per-language usage aggregated across all repositories.
 *
 * @example
 * const languages: LanguageProfile = {
 *   totalBytes: 450000,
 *   usages: [
 *     { name: "TypeScript", color: "#3178c6", totalBytes: 300000, repositoryCount: 12 },
 *     { name: "Python",     color: "#3572A5", totalBytes: 120000, repositoryCount: 5  },
 *     { name: "CSS",        color: "#563d7c", totalBytes: 30000,  repositoryCount: 8  },
 *   ],
 * };
 */
export interface LanguageProfile {
  /**
   * Total bytes across all languages across all repositories.
   * Used as the denominator when computing per-language percentage.
   */
  readonly totalBytes: number;
  /**
   * Per-language usage entries, ordered by `totalBytes` descending
   * (most-used language first).
   */
  readonly usages: ReadonlyArray<LanguageUsage>;
}
