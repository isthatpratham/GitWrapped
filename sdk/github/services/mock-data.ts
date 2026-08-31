/**
 * Isolated mock generator. Do not import from production runtime paths
 * (`fetchAnnualData`, server actions, or the SDK public barrel).
 */
import type {
  GitHubAnnualData,
  GitHubUserProfile,
  ContributionCollection,
  GitHubRepository,
  GitHubPullRequest,
  GitHubIssue,
  GitHubOrganization,
} from "../types";

/**
 * Simple deterministic seeded random generator based on username hash.
 * This guarantees the mock data is fully reproducible for the same username.
 */
class SeededRandom {
  private seed: number;

  constructor(str: string) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    this.seed = Math.abs(hash) || 1;
  }

  // Returns a number between 0 and 1
  next(): number {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  // Returns integer in [min, max]
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Pick random element
  pick<T>(arr: readonly T[]): T {
    if (arr.length === 0) {
      throw new Error("Cannot pick from an empty array");
    }
    const idx = this.nextInt(0, arr.length - 1);
    const item = arr[idx];
    if (item === undefined) {
      throw new Error("SeededRandom.pick: index out of range");
    }
    return item;
  }
}

/**
 * Generates deterministic, highly realistic mock GitHub annual data.
 * Used for offline showcases and robust fallbacks when tokens are missing.
 */
export function generateMockAnnualData(username: string, year: number): GitHubAnnualData {
  const rand = new SeededRandom(username);

  // 1. User profile
  const user: GitHubUserProfile = {
    id: `mock-user-${username}`,
    login: username,
    name: username.charAt(0).toUpperCase() + username.slice(1) + " Coder",
    avatarUrl: `https://avatars.githubusercontent.com/u/${rand.nextInt(1000000, 9999999)}?v=4`,
    bio: "Building premium experiences and writing clean systems.",
    company: rand.next() > 0.4 ? "GitWrapped Tech" : null,
    location: rand.next() > 0.3 ? "San Francisco, CA" : null,
    websiteUrl: rand.next() > 0.5 ? "https://gitwrapped.dev" : null,
    twitterUsername: rand.next() > 0.5 ? username : null,
    createdAt: new Date(year - rand.nextInt(3, 8), rand.nextInt(0, 11), rand.nextInt(1, 28)).toISOString(),
    publicRepos: rand.nextInt(20, 120),
    followers: rand.nextInt(50, 1200),
    following: rand.nextInt(50, 400),
  };

  // 2. Repositories
  const languagesList = [
    { name: "TypeScript", color: "#3178c6" },
    { name: "JavaScript", color: "#f1e05a" },
    { name: "Rust", color: "#dea584" },
    { name: "Go", color: "#00add8" },
    { name: "Python", color: "#3572a5" },
    { name: "HTML", color: "#e34c26" },
    { name: "CSS", color: "#563d7c" },
  ];

  const repoNames = [
    "react-hooks", "compiler-core", "vector-db", "rust-interpreter", "antigravity",
    "story-builder", "recap-player", "framer-slider", "metrics-dashboard", "astropy-helper"
  ];

  const repositories: GitHubRepository[] = [];
  const repoCount = rand.nextInt(6, 12);

  for (let i = 0; i < repoCount; i++) {
    const rName = repoNames[i] ?? `repo-${i}`;
    const stars = rand.nextInt(0, 450);
    const primaryLang = rand.pick(languagesList);

    const repoLangs = [
      { size: rand.nextInt(10000, 120000), node: primaryLang },
      { size: rand.nextInt(1000, 15000), node: rand.pick(languagesList) },
    ];

    repositories.push({
      id: `repo-${i}`,
      name: rName,
      nameWithOwner: `${username}/${rName}`,
      description: `A premium modular repository for ${rName}.`,
      createdAt: new Date(year - rand.nextInt(0, 2), rand.nextInt(0, 11), rand.nextInt(1, 28)).toISOString(),
      pushedAt: new Date(year, rand.nextInt(8, 11), rand.nextInt(1, 28)).toISOString(),
      updatedAt: new Date(year, rand.nextInt(8, 11), rand.nextInt(1, 28)).toISOString(),
      stargazerCount: stars,
      forkCount: Math.floor(stars * rand.next() * 0.3),
      watcherCount: Math.floor(stars * 0.1) + 1,
      openIssueCount: rand.nextInt(0, 15),
      openPullRequestCount: rand.nextInt(0, 5),
      isPrivate: rand.next() > 0.8,
      isFork: rand.next() > 0.9,
      isArchived: rand.next() > 0.95,
      primaryLanguage: primaryLang,
      languages: {
        totalSize: repoLangs.reduce((sum, l) => sum + l.size, 0),
        edges: repoLangs,
      },
      diskUsage: rand.nextInt(200, 8000),
      url: `https://github.com/${username}/${rName}`,
      defaultBranch: "main",
      homepageUrl: rand.next() > 0.7 ? "https://gitwrapped.dev" : null,
      visibility: "PUBLIC",
      topics: ["nextjs", "typescript", "oss", "premium"],
    });
  }

  // 3. Pull Requests
  const pullRequests: GitHubPullRequest[] = [];
  const prCount = rand.nextInt(15, 60);
  const prStates = ["OPEN", "CLOSED", "MERGED"] as const;

  for (let i = 0; i < prCount; i++) {
    const prState = rand.pick(prStates);
    const date = new Date(year, rand.nextInt(0, 11), rand.nextInt(1, 28));
    const targetRepo = rand.pick(repositories);

    pullRequests.push({
      id: `pr-${i}`,
      title: `feat: add modular structure part ${i + 1}`,
      state: prState,
      createdAt: date.toISOString(),
      mergedAt: prState === "MERGED" ? new Date(date.getTime() + 86400000 * 2).toISOString() : null,
      closedAt: prState === "CLOSED" ? new Date(date.getTime() + 86400000).toISOString() : null,
      url: `${targetRepo.url}/pull/${i + 1}`,
      additions: rand.nextInt(10, 800),
      deletions: rand.nextInt(5, 400),
      changedFiles: rand.nextInt(1, 12),
      commentCount: rand.nextInt(0, 8),
      reviewRequestCount: rand.nextInt(0, 3),
      baseRepository: {
        nameWithOwner: targetRepo.nameWithOwner,
        isPrivate: targetRepo.isPrivate,
      },
      labels: [
        { name: "enhancement", color: "a2eeef" },
        { name: "recap-engine", color: "8b5cf6" },
      ],
    });
  }

  // 4. Issues
  const issues: GitHubIssue[] = [];
  const issueCount = rand.nextInt(10, 40);

  for (let i = 0; i < issueCount; i++) {
    const isClosed = rand.next() > 0.4;
    const date = new Date(year, rand.nextInt(0, 11), rand.nextInt(1, 28));
    const targetRepo = rand.pick(repositories);

    issues.push({
      id: `issue-${i}`,
      title: `bug: layout overflow on index slide ${i + 1}`,
      state: isClosed ? "CLOSED" : "OPEN",
      createdAt: date.toISOString(),
      closedAt: isClosed ? new Date(date.getTime() + 86400000 * 3).toISOString() : null,
      url: `${targetRepo.url}/issues/${i + 1}`,
      commentCount: rand.nextInt(0, 10),
      reactionCount: rand.nextInt(0, 8),
      labels: [{ name: "bug", color: "f43f5e" }],
      repository: {
        nameWithOwner: targetRepo.nameWithOwner,
        isPrivate: targetRepo.isPrivate,
      },
    });
  }

  // 5. Organizations
  const organizations: GitHubOrganization[] = [
    {
      login: "vercel",
      name: "Vercel",
      avatarUrl: "https://avatars.githubusercontent.com/u/14985020?v=4",
      description: "Develop. Preview. Ship.",
      url: "https://github.com/vercel",
      websiteUrl: "https://vercel.com",
      memberCount: 230,
      repositoryCount: 840,
    },
    {
      login: "gitwrapped-org",
      name: "GitWrapped",
      avatarUrl: user.avatarUrl,
      description: "Handcrafted coding recap builders.",
      url: "https://github.com/gitwrapped-org",
      websiteUrl: "https://gitwrapped.dev",
      memberCount: 3,
      repositoryCount: 4,
    },
  ];

  // 6. Contributions Calendar
  const weeks: ContributionCollection["contributionCalendar"]["weeks"][number][] = [];
  let currentDay = new Date(year, 0, 1);
  // Find preceding Sunday to align calendar weeks
  while (currentDay.getDay() !== 0) {
    currentDay = new Date(currentDay.getTime() - 86400000);
  }

  let totalCalendarContributions = 0;
  const commitContributionsByRepository: ContributionCollection["repositoryActivity"][number][] =
    [];
  let peakDayCommitCount = 0;
  let peakDayOccurredAt = "";

  for (let w = 0; w < 53; w++) {
    const weekDays: ContributionCollection["contributionCalendar"]["weeks"][number]["contributionDays"][number][] = [];
    const firstDay = currentDay.toISOString().slice(0, 10);

    for (let d = 0; d < 7; d++) {
      const dateStr = currentDay.toISOString().slice(0, 10);
      const isCurrentYear = currentDay.getFullYear() === year;

      // Seed higher probability of coding on weekdays and certain months (like Oct/Nov)
      const dayOfWeek = currentDay.getDay();
      const month = currentDay.getMonth();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

      let chanceOfCoding = isWeekend ? 0.3 : 0.65;
      if (month >= 9 && month <= 10) chanceOfCoding += 0.15; // end-of-year push

      const hasCoded = isCurrentYear && rand.next() < chanceOfCoding;
      const count = hasCoded ? rand.nextInt(1, 14) : 0;
      totalCalendarContributions += count;

      let level: "NONE" | "FIRST_QUARTILE" | "SECOND_QUARTILE" | "THIRD_QUARTILE" | "FOURTH_QUARTILE" = "NONE";
      if (count >= 10) level = "FOURTH_QUARTILE";
      else if (count >= 6) level = "THIRD_QUARTILE";
      else if (count >= 3) level = "SECOND_QUARTILE";
      else if (count >= 1) level = "FIRST_QUARTILE";

      // Color spectrum for heatmap
      let color = "#161b22";
      if (level === "FIRST_QUARTILE") color = "#0e4429";
      else if (level === "SECOND_QUARTILE") color = "#006d32";
      else if (level === "THIRD_QUARTILE") color = "#26a641";
      else if (level === "FOURTH_QUARTILE") color = "#39d353";

      weekDays.push({
        date: dateStr,
        contributionCount: count,
        contributionLevel: level,
        color,
      });

      // Update Peak Day
      if (count > peakDayCommitCount) {
        peakDayCommitCount = count;
        peakDayOccurredAt = dateStr;
      }

      currentDay = new Date(currentDay.getTime() + 86400000);
    }

    weeks.push({
      firstDay,
      contributionDays: weekDays,
    });
  }

  // Seed repositoryActivity commit breakdown
  for (const repo of repositories) {
    commitContributionsByRepository.push({
      repositoryPath: repo.nameWithOwner,
      commitCount: rand.nextInt(10, 180),
      primaryLanguage: repo.primaryLanguage
        ? { name: repo.primaryLanguage.name, color: repo.primaryLanguage.color }
        : null,
    });
  }

  const contributionCollection: ContributionCollection = {
    contributionCalendar: {
      totalContributions: totalCalendarContributions,
      weeks,
    },
    totalCommitContributions: Math.floor(totalCalendarContributions * 0.8),
    totalPullRequestContributions: prCount,
    totalIssueContributions: issueCount,
    totalPullRequestReviewContributions: rand.nextInt(2, 20),
    totalRepositoriesWithContributedCommits: repositories.length,
    restrictedContributionsCount: Math.floor(totalCalendarContributions * 0.15),
    repositoryActivity: commitContributionsByRepository,
    peakDay: peakDayOccurredAt
      ? {
          date: peakDayOccurredAt,
          commitCount: peakDayCommitCount,
          repositoryPath: null,
        }
      : null,
  };

  return {
    user,
    contributions: contributionCollection,
    repositories,
    pullRequests,
    issues,
    organizations,
    commits: [],
    sources: {
      pullRequests: { status: "fetched" },
      issues: { status: "fetched" },
      organizations: { status: "fetched" },
      commits: { status: "unavailable", reason: "not_fetched" },
      repositories: { status: "fetched" },
    },
    achievementSignals: {
      login: user.login,
      followers: user.followers,
      following: user.following,
      publicRepositoryCount: user.publicRepos,
      starredRepositoryCount: rand.nextInt(5, 50),
      publicGistCount: 0,
      packageCount: 0,
      sponsoringCount: 0,
      sponsorCount: 0,
      totalMergedPullRequests: prCount,
      totalIssues: issueCount,
    },
    year,
    fetchedAt: new Date().toISOString(),
  };
}
