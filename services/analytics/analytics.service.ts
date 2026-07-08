// ---------------------------------------------------------------------------
// Analytics Service — Public Interface
// ---------------------------------------------------------------------------
// High-level service wrapper for calculating GitWrapped developer recaps.
// Handles error mapping, parameter checking, and orchestration.
// ---------------------------------------------------------------------------

import type { AnalyticsEngineInput, AnalyticsResult } from "./analytics.types";
import { computeAnnualAnalytics } from "./analytics-engine";
import { ZeroContributionsError, CalculationError } from "./analytics.errors";

/**
 * Calculates a complete annual developer recap from domain inputs.
 *
 * @param input - The raw domain data structures.
 * @returns The computed annual analytics payload.
 *
 * @throws {ZeroContributionsError} When the user has zero contributions in the period.
 * @throws {CalculationError} If any sub-calculator fails during execution.
 */
export function generateRecapAnalytics(input: AnalyticsEngineInput): AnalyticsResult {
  // Validate inputs
  if (input.contributions.calendar.totalCount === 0) {
    throw new ZeroContributionsError(input.user.handle);
  }

  try {
    return computeAnnualAnalytics(input);
  } catch (error) {
    throw new CalculationError("Core Pipeline", error);
  }
}
