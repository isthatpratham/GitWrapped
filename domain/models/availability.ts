// ---------------------------------------------------------------------------
// Domain Model: Data Availability
// ---------------------------------------------------------------------------
// Distinguishes measured values from missing ones. Later Story Intelligence
// must skip insights whose status is not "available".
//
// Confidence is categorical on purpose:
// - "measured"  — derived from GitHub fields that actually exist
// - "estimated" — derived from a documented proxy (never invented timestamps)
// Numeric 0–1 confidence scores are not used; they would be arbitrary.
// ---------------------------------------------------------------------------

/**
 * Why a field cannot be used for storytelling.
 * Keep reasons stable — story selectors will switch on these strings.
 */
export const UNAVAILABILITY_REASONS = [
  "not_fetched",
  "fetch_failed",
  "no_commit_timestamps",
  "empty_result",
  "no_language_bytes",
  "no_repository_attribution",
  "insufficient_data",
] as const;

export type UnavailabilityReason = (typeof UNAVAILABILITY_REASONS)[number];

export function isUnavailabilityReason(value: string): value is UnavailabilityReason {
  return (UNAVAILABILITY_REASONS as readonly string[]).includes(value);
}

export type DataAvailability =
  | {
      readonly status: "available";
      readonly confidence: "measured" | "estimated";
    }
  | {
      readonly status: "unavailable";
      readonly reason: UnavailabilityReason;
    }
  | {
      readonly status: "not_calculated";
      readonly reason: UnavailabilityReason;
    };

export type FetchStatus =
  | { readonly status: "fetched" }
  | { readonly status: "partial"; readonly reason: UnavailabilityReason }
  | { readonly status: "unavailable"; readonly reason: UnavailabilityReason };

export function availableMeasured(): DataAvailability {
  return { status: "available", confidence: "measured" };
}

export function availableEstimated(): DataAvailability {
  return { status: "available", confidence: "estimated" };
}

export function unavailable(reason: UnavailabilityReason): DataAvailability {
  return { status: "unavailable", reason };
}

export function notCalculated(reason: UnavailabilityReason): DataAvailability {
  return { status: "not_calculated", reason };
}

export function isAvailable(
  availability: DataAvailability,
): availability is Extract<DataAvailability, { status: "available" }> {
  return availability.status === "available";
}

/**
 * Maps a GitHub fetch result into the domain FetchStatus used by analytics.
 * Unknown reason strings become `fetch_failed` so callers never invent values.
 */
export function toFetchStatus(source: {
  readonly status: "fetched" | "partial" | "unavailable";
  readonly reason?: string;
}): FetchStatus {
  if (source.status === "fetched") {
    return { status: "fetched" };
  }

  const reason =
    source.reason && isUnavailabilityReason(source.reason) ? source.reason : "fetch_failed";

  if (source.status === "partial") {
    return { status: "partial", reason };
  }

  return { status: "unavailable", reason };
}
