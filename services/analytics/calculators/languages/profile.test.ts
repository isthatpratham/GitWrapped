import { describe, expect, it } from "vitest";

import type { Repository } from "@/domain/models";
import { mapRepositoriesToLanguageProfile } from "./profile";

const typescript = { name: "TypeScript", color: "#3178c6" };
const rust = { name: "Rust", color: "#dea584" };

function repo(
  languageBytes: ReadonlyArray<{ language: { name: string; color: string | null }; bytes: number }>,
): Repository {
  return {
    id: "1",
    name: "app",
    ownerName: "acme",
    description: null,
    url: "https://github.com/acme/app",
    createdAt: "2024-01-01T00:00:00.000Z",
    lastPushedAt: "2026-01-01T00:00:00.000Z",
    lastUpdatedAt: "2026-01-01T00:00:00.000Z",
    starCount: 0,
    forkCount: 0,
    watcherCount: 0,
    openIssueCount: 0,
    openPullRequestCount: 0,
    isFork: false,
    isArchived: false,
    primaryLanguage: languageBytes[0]?.language ?? null,
    languageUsage: languageBytes,
    totalLanguageBytes: languageBytes.reduce((sum, item) => sum + item.bytes, 0),
    defaultBranch: "main",
    homepageUrl: null,
    visibility: "PUBLIC",
    diskUsageKilobytes: null,
    topics: [],
  };
}

describe("mapRepositoriesToLanguageProfile", () => {
  it("aggregates language bytes across repositories once", () => {
    const profile = mapRepositoriesToLanguageProfile([
      repo([
        { language: typescript, bytes: 100 },
        { language: rust, bytes: 40 },
      ]),
      repo([{ language: typescript, bytes: 50 }]),
    ]);

    expect(profile.totalBytes).toBe(190);
    expect(profile.usages[0]).toMatchObject({
      name: "TypeScript",
      totalBytes: 150,
      repositoryCount: 2,
    });
    expect(profile.usages[1]).toMatchObject({
      name: "Rust",
      totalBytes: 40,
      repositoryCount: 1,
    });
  });
});
