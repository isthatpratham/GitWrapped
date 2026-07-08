// ---------------------------------------------------------------------------
// Analytics Engine — Errors
// ---------------------------------------------------------------------------
// Typed errors specific to the Analytics Engine.
// ---------------------------------------------------------------------------

export class AnalyticsEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AnalyticsEngineError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class ZeroContributionsError extends AnalyticsEngineError {
  constructor(username: string) {
    super(`Cannot run analytics: User "${username}" has zero contributions in the period.`);
    this.name = "ZeroContributionsError";
  }
}

export class CalculationError extends AnalyticsEngineError {
  constructor(calculatorName: string, cause: unknown) {
    super(`Failure in calculator "${calculatorName}": ${cause instanceof Error ? cause.message : String(cause)}`);
    this.name = "CalculationError";
  }
}
