import type { AnalyticsEngineInput, AnalyticsResult } from "./analytics.types";
import { computeAnnualAnalytics } from "./analytics-engine";
import { CalculationError } from "./analytics.errors";

/**
 * Calculates a complete annual developer recap from domain inputs.
 *
 * Zero contributions is a valid measured result and does not throw.
 *
 * @throws {CalculationError} If any sub-calculator fails during execution.
 */
export function generateRecapAnalytics(input: AnalyticsEngineInput): AnalyticsResult {
  try {
    return computeAnnualAnalytics(input);
  } catch (error) {
    throw new CalculationError("Core Pipeline", error);
  }
}
