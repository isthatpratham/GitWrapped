import { describe, expect, it } from "vitest";

import type { ContributionHistory, Repository } from "@/domain/models";
import { calculateRepositories } from "./index";

function repo(overrides: Pick<Repository, "name" | "ownerName" | "starCount" | "url"> & Partial<Repository>): Repository {
  return {
    id: `${overrides.ownerName}/${overrides.name}`,
    description: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    lastPushedAt: "2026-08-31T00:00:00.000Z",
    lastUpdatedAt: "2026-08-31T00:00:00.000Z",
    forkCount: 0,
    watcherCount: 0,
    openIssueCount: 0,
    openPullRequestCount: 0,
    isFork: false,
    isArchived: false,
    visibility: "PUBLIC",
    defaultBranch: "main",
    homepageUrl: null,
    diskUsageKilobytes: null,
    primaryLanguage: null,
    languageUsage: [],
    totalLanguageBytes: 0,
    topics: [],
    ...overrides,
  };
}

function history(peakPath: string | null): ContributionHistory {
  return {
    calendar: { totalCount: 18, weeks: [] },
    commitCount: 18,
    pullRequestCount: 0,
    issueCount: 0,
    reviewCount: 0,
    activeRepositoryCount: 2,
    privateContributionCount: 0,
    repositoryActivity: [
      { repositoryPath: "isthatpratham/DeadDrop", commitCount: 12, primaryLanguage: null },
      { repositoryPath: "isthatpratham/pratham-folio", commitCount: 4, primaryLanguage: null },
    ],
    peakDay: peakPath
      ? { date: "2026-08-31", commitCount: 12, repositoryPath: peakPath }
      : null,
  };
}

describe("calculateRepositories peak-day vs most-starred", () => {
  const deadDrop = repo({
    name: "DeadDrop",
    ownerName: "isthatpratham",
    starCount: 3,
    url: "https://github.com/isthatpratham/DeadDrop",
  });
  const folio = repo({
    name: "pratham-folio",
    ownerName: "isthatpratham",
    starCount: 22,
    url: "https://github.com/isthatpratham/pratham-folio",
  });

  it("looks up peak-day repository independently of the most-starred repository", () => {
    const result = calculateRepositories([deadDrop, folio], history("isthatpratham/DeadDrop"));

    expect(result.peakDayRepository).toEqual({
      name: "DeadDrop",
      ownerName: "isthatpratham",
      starCount: 3,
      url: "https://github.com/isthatpratham/DeadDrop",
    });
    expect(result.favoriteRepository).toEqual({
      name: "pratham-folio",
      ownerName: "isthatpratham",
      starCount: 22,
      url: "https://github.com/isthatpratham/pratham-folio",
    });
    expect(result.peakDayRepository?.starCount).not.toBe(result.favoriteRepository?.starCount);
  });

  it("keeps peak-day identity when that repository is missing from the user list", () => {
    const result = calculateRepositories([folio], history("isthatpratham/DeadDrop"));

    expect(result.peakDayRepository).toEqual({
      name: "DeadDrop",
      ownerName: "isthatpratham",
      starCount: null,
      url: null,
    });
    expect(result.favoriteRepository?.name).toBe("pratham-folio");
    expect(result.favoriteRepository?.starCount).toBe(22);
  });

  it("allows the same repository to be both peak-day and most-starred", () => {
    const result = calculateRepositories([deadDrop], history("isthatpratham/DeadDrop"));

    expect(result.peakDayRepository?.name).toBe("DeadDrop");
    expect(result.favoriteRepository?.name).toBe("DeadDrop");
    expect(result.peakDayRepository?.starCount).toBe(3);
    expect(result.favoriteRepository?.starCount).toBe(3);
  });

  it("does not invent a peak-day repository from the most-starred repository", () => {
    const result = calculateRepositories([deadDrop, folio], history(null));
    expect(result.peakDayRepository).toBeNull();
    expect(result.favoriteRepository?.name).toBe("pratham-folio");
  });
});
