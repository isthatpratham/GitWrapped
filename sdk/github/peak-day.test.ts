import { describe, expect, it } from "vitest";

import {
  attributePeakDayRepository,
  selectPeakContributionDay,
} from "./peak-day";

describe("selectPeakContributionDay", () => {
  it("returns null when every day has zero contributions", () => {
    expect(
      selectPeakContributionDay([
        { date: "2026-01-01", contributionCount: 0 },
        { date: "2026-01-02", contributionCount: 0 },
      ]),
    ).toBeNull();
  });

  it("selects the day with the highest contribution count", () => {
    const peak = selectPeakContributionDay([
      { date: "2026-03-01", contributionCount: 4 },
      { date: "2026-06-15", contributionCount: 12 },
      { date: "2026-09-02", contributionCount: 7 },
    ]);

    expect(peak).toEqual({
      date: "2026-06-15",
      commitCount: 12,
      repositoryPath: null,
    });
  });

  it("breaks count ties with the later calendar date", () => {
    const peak = selectPeakContributionDay([
      { date: "2026-02-01", contributionCount: 9 },
      { date: "2026-11-20", contributionCount: 9 },
      { date: "2026-05-04", contributionCount: 9 },
    ]);

    expect(peak?.date).toBe("2026-11-20");
    expect(peak?.commitCount).toBe(9);
  });
});

describe("attributePeakDayRepository", () => {
  it("returns the repository that produced the peak day's commits", () => {
    const path = attributePeakDayRepository("2026-06-15", [
      { committedDate: "2026-06-15T08:00:00.000Z", repositoryPath: "acme/alpha" },
      { committedDate: "2026-06-15T09:00:00.000Z", repositoryPath: "acme/beta" },
      { committedDate: "2026-06-15T10:00:00.000Z", repositoryPath: "acme/beta" },
      { committedDate: "2026-06-14T23:00:00.000Z", repositoryPath: "acme/alpha" },
    ]);

    expect(path).toBe("acme/beta");
  });

  it("does not use a yearly ranking repository when no commits fall on the peak date", () => {
    expect(
      attributePeakDayRepository("2026-06-15", [
        { committedDate: "2026-01-01T00:00:00.000Z", repositoryPath: "first/in-array" },
      ]),
    ).toBeNull();
  });

  it("breaks repository ties with the lexicographically smaller path", () => {
    const path = attributePeakDayRepository("2026-06-15", [
      { committedDate: "2026-06-15T01:00:00.000Z", repositoryPath: "zeta/repo" },
      { committedDate: "2026-06-15T02:00:00.000Z", repositoryPath: "alpha/repo" },
    ]);

    expect(path).toBe("alpha/repo");
  });
});
