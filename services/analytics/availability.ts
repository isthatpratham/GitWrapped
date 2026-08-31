import type { DataAvailability, FetchStatus } from "@/domain/models";
import {
  availableEstimated,
  availableMeasured,
  unavailable,
} from "@/domain/models";
import type {
  AnalyticsEngineInput,
  AnalyticsAvailability,
  AnalyticsActivity,
  AnalyticsLanguages,
} from "./analytics.types";

function collectionAvailability(status: FetchStatus): DataAvailability {
  if (status.status === "unavailable") {
    return unavailable(status.reason);
  }
  if (status.status === "partial") {
    return availableEstimated();
  }
  return availableMeasured();
}

export function deriveAnalyticsAvailability(
  input: AnalyticsEngineInput,
  activity: AnalyticsActivity,
  languages: AnalyticsLanguages,
): AnalyticsAvailability {
  const commitTimestamps =
    input.sources.commits.status === "unavailable"
      ? unavailable(input.sources.commits.reason)
      : activity.timeAnalysis.mostActiveHour === null
        ? unavailable("no_commit_timestamps")
        : input.sources.commits.status === "partial"
          ? availableEstimated()
          : availableMeasured();

  const peakDay = input.contributions.peakDay;
  const peakDayRepository =
    peakDay === null
      ? unavailable("empty_result")
      : peakDay.repositoryPath
        ? availableMeasured()
        : unavailable("no_repository_attribution");

  const languagesAvailability =
    input.sources.repositories.status === "unavailable"
      ? unavailable(input.sources.repositories.reason)
      : languages.favoriteLanguage
        ? input.sources.repositories.status === "partial"
          ? availableEstimated()
          : availableMeasured()
        : unavailable("no_language_bytes");

  return {
    contributions: availableMeasured(),
    commitTimestamps,
    codingHours: commitTimestamps,
    pullRequests: collectionAvailability(input.sources.pullRequests),
    issues: collectionAvailability(input.sources.issues),
    organizations: collectionAvailability(input.sources.organizations),
    languages: languagesAvailability,
    repositories: collectionAvailability(input.sources.repositories),
    peakDayRepository,
  };
}

/**
 * Prefer a fetched/partial list length (including real zeros).
 * Fall back to contribution-calendar counts when the list was not retrieved.
 */
export function resolvedCollectionCount(
  status: FetchStatus,
  listLength: number,
  calendarCount: number,
): number {
  if (status.status === "fetched" || status.status === "partial") {
    return listLength;
  }
  return calendarCount;
}
