// ---------------------------------------------------------------------------
// Calculator: Repositories
// ---------------------------------------------------------------------------
// Computes repository-level highlights such as favorite, fastest growing,
// most active, oldest active, and newest.
// ---------------------------------------------------------------------------

import type { Repository, ContributionHistory } from "@/domain/models";
import type { AnalyticsRepositories, PeakDayRepositoryHighlight } from "@/services/analytics/analytics.types";
import { utcYear } from "@/lib/time/utc";

function parseRepositoryPath(path: string): { ownerName: string; name: string } {
  const slash = path.indexOf("/");
  if (slash <= 0 || slash === path.length - 1) {
    return { ownerName: "", name: path };
  }
  return {
    ownerName: path.slice(0, slash),
    name: path.slice(slash + 1),
  };
}

function resolvePeakDayRepository(
  repositories: ReadonlyArray<Repository>,
  contributions: ContributionHistory,
): PeakDayRepositoryHighlight | null {
  const path = contributions.peakDay?.repositoryPath;
  if (!path) return null;

  const match = repositories.find((repository) => `${repository.ownerName}/${repository.name}` === path);
  if (match) {
    return {
      name: match.name,
      ownerName: match.ownerName,
      starCount: match.starCount,
      url: match.url,
    };
  }

  const identity = parseRepositoryPath(path);
  return {
    name: identity.name,
    ownerName: identity.ownerName,
    starCount: null,
    url: null,
  };
}

function emptyHighlights(peakDayRepository: PeakDayRepositoryHighlight | null): AnalyticsRepositories {
  return {
    favoriteRepository: null,
    peakDayRepository,
    fastestGrowingRepository: null,
    mostActiveRepository: null,
    oldestActiveRepository: null,
    newestRepository: null,
    firstRepositoryCreatedInYear: null,
    repositoryGrowthTimeline: [],
  };
}

function resolveFirstRepositoryCreatedInYear(
  repositories: ReadonlyArray<Repository>,
  year: number | undefined,
): AnalyticsRepositories["firstRepositoryCreatedInYear"] {
  if (year === undefined) return null;

  const createdThisYear = repositories
    .filter((repository) => repository.createdAt && utcYear(repository.createdAt) === year)
    .sort((left, right) => {
      const byDate = left.createdAt.localeCompare(right.createdAt);
      if (byDate !== 0) return byDate;
      return `${left.ownerName}/${left.name}`.localeCompare(`${right.ownerName}/${right.name}`);
    });

  const first = createdThisYear[0];
  if (!first) return null;
  return {
    name: first.name,
    ownerName: first.ownerName,
    createdAt: first.createdAt,
    url: first.url,
  };
}

export function calculateRepositories(
  repositories: ReadonlyArray<Repository>,
  contributions: ContributionHistory,
  year?: number,
): AnalyticsRepositories {
  const peakDayRepository = resolvePeakDayRepository(repositories, contributions);
  const firstRepositoryCreatedInYear = resolveFirstRepositoryCreatedInYear(repositories, year);

  if (repositories.length === 0) {
    return emptyHighlights(peakDayRepository);
  }

  // Favorite Repository: Highest starCount. Fallback to forkCount.
  const sortedByStars = [...repositories].sort((a, b) => {
    if (b.starCount !== a.starCount) return b.starCount - a.starCount;
    return b.forkCount - a.forkCount;
  });
  const favoriteRepo = sortedByStars[0] ?? null;

  // Fastest Growing Repository: Highest stars per day since creation
  // Or starCount if created this year. Let's calculate: stars / (days since created)
  const sortedByGrowth = [...repositories].sort((a, b) => {
    const ageA = Math.max(1, (Date.now() - new Date(a.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    const ageB = Math.max(1, (Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    return (b.starCount / ageB) - (a.starCount / ageA);
  });
  const fastestGrowing = sortedByGrowth[0] ?? null;

  // Most Active Repository: Sourced from contribution repository commit counts.
  const sortedByCommits = [...contributions.repositoryActivity].sort((a, b) => b.commitCount - a.commitCount);
  const topActiveRepoPath = sortedByCommits[0]?.repositoryPath ?? null;
  const mostActive = topActiveRepoPath
    ? repositories.find((r) => r.ownerName + "/" + r.name === topActiveRepoPath) ?? null
    : null;

  // Oldest Active Repository: Earliest createdAt, with pushes in the recap year.
  // Wait, let's filter repositories pushed to in the recap year.
  const activeThisYear = repositories.filter((r) => r.lastPushedAt !== null);
  const sortedByAge = [...activeThisYear].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const oldestActive = sortedByAge[0] ?? null;

  // Newest Repository: Latest createdAt.
  const sortedByNewest = [...repositories].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const newest = sortedByNewest[0] ?? null;

  // Repository Growth Timeline: Stars over time grouped by creation month/day.
  // We can map repository creation dates and cumulative star count.
  const sortedChronologically = [...repositories].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  let starAccumulator = 0;
  const growthTimeline = sortedChronologically.map((r) => {
    starAccumulator += r.starCount;
    return {
      date: r.createdAt.split("T")[0] ?? r.createdAt,
      totalStars: starAccumulator,
    };
  });

  return {
    favoriteRepository: favoriteRepo
      ? {
          name: favoriteRepo.name,
          ownerName: favoriteRepo.ownerName,
          starCount: favoriteRepo.starCount,
          url: favoriteRepo.url,
        }
      : null,
    peakDayRepository,
    fastestGrowingRepository: fastestGrowing
      ? {
          name: fastestGrowing.name,
          starGrowth: parseFloat(
            (
              fastestGrowing.starCount /
              Math.max(1, (Date.now() - new Date(fastestGrowing.createdAt).getTime()) / (1000 * 60 * 60 * 24))
            ).toFixed(3),
          ),
        }
      : null,
    mostActiveRepository: mostActive
      ? {
          name: mostActive.name,
          commitCount: sortedByCommits[0]?.commitCount ?? 0,
        }
      : topActiveRepoPath
        ? {
            // Fallback if repository is not owned by user (e.g. contribution to external org repo)
            name: topActiveRepoPath.split("/")[1] ?? topActiveRepoPath,
            commitCount: sortedByCommits[0]?.commitCount ?? 0,
          }
        : null,
    oldestActiveRepository: oldestActive
      ? {
          name: oldestActive.name,
          ageDays: Math.floor((Date.now() - new Date(oldestActive.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
        }
      : null,
    newestRepository: newest
      ? {
          name: newest.name,
          createdAt: newest.createdAt,
        }
      : null,
    firstRepositoryCreatedInYear,
    repositoryGrowthTimeline: growthTimeline,
  };
}
