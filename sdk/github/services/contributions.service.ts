import { z } from "zod";

import { executeQuery } from "../client";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import type { ContributionCollection } from "../types";
import {
  GET_USER_CONTRIBUTIONS,
  type GetUserContributionsData,
  type GetUserContributionsVariables,
} from "../queries";
import { getYearDateRange } from "./user.service";

// ---------------------------------------------------------------------------
// Zod schema: Contribution data
// ---------------------------------------------------------------------------

const contributionDaySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Must be YYYY-MM-DD"),
  contributionCount: z.number().int().nonnegative(),
  contributionLevel: z.enum([
    "NONE",
    "FIRST_QUARTILE",
    "SECOND_QUARTILE",
    "THIRD_QUARTILE",
    "FOURTH_QUARTILE",
  ]),
  color: z.string(),
});

const contributionWeekSchema = z.object({
  firstDay: z.string(),
  contributionDays: z.array(contributionDaySchema),
});

const contributionCalendarSchema = z.object({
  totalContributions: z.number().int().nonnegative(),
  weeks: z.array(contributionWeekSchema),
});

const repositoryLanguageSchema = z.object({
  name: z.string().min(1),
  color: z.string().nullable(),
});

const repositoryCommitActivitySchema = z.object({
  repository: z.object({
    nameWithOwner: z.string(),
    primaryLanguage: repositoryLanguageSchema.nullable(),
  }),
  contributions: z.object({
    totalCount: z.number().int().nonnegative(),
  }),
});

const contributionCollectionSchema = z.object({
  totalCommitContributions: z.number().int().nonnegative(),
  totalPullRequestContributions: z.number().int().nonnegative(),
  totalIssueContributions: z.number().int().nonnegative(),
  totalPullRequestReviewContributions: z.number().int().nonnegative(),
  totalRepositoriesWithContributedCommits: z.number().int().nonnegative(),
  restrictedContributionsCount: z.number().int().nonnegative(),
  contributionCalendar: contributionCalendarSchema,
  commitContributionsByRepository: z.array(repositoryCommitActivitySchema),
});

// ---------------------------------------------------------------------------
// Normaliser
// ---------------------------------------------------------------------------

function normaliseContributions(
  raw: NonNullable<GetUserContributionsData["user"]>["contributionsCollection"],
): ContributionCollection {
  let peakDay: { date: string; commitCount: number; repositoryPath: string | null } | null = null;
  let maxCount = 0;

  for (const week of raw.contributionCalendar.weeks) {
    for (const day of week.contributionDays) {
      if (day.contributionCount > maxCount) {
        maxCount = day.contributionCount;
        peakDay = {
          date: day.date,
          commitCount: day.contributionCount,
          repositoryPath: raw.commitContributionsByRepository[0]?.repository?.nameWithOwner ?? null,
        };
      }
    }
  }

  return {
    totalCommitContributions: raw.totalCommitContributions,
    totalPullRequestContributions: raw.totalPullRequestContributions,
    totalIssueContributions: raw.totalIssueContributions,
    totalPullRequestReviewContributions: raw.totalPullRequestReviewContributions,
    totalRepositoriesWithContributedCommits: raw.totalRepositoriesWithContributedCommits,
    restrictedContributionsCount: raw.restrictedContributionsCount,
    contributionCalendar: {
      totalContributions: raw.contributionCalendar.totalContributions,
      weeks: raw.contributionCalendar.weeks.map((week) => ({
        firstDay: week.firstDay,
        contributionDays: week.contributionDays.map((day) => ({
          date: day.date,
          contributionCount: day.contributionCount,
          contributionLevel: day.contributionLevel,
          color: day.color,
        })),
      })),
    },
    repositoryActivity: raw.commitContributionsByRepository.map((item) => ({
      repositoryPath: item.repository.nameWithOwner,
      commitCount: item.contributions.totalCount,
      primaryLanguage: item.repository.primaryLanguage
        ? {
            name: item.repository.primaryLanguage.name,
            color: item.repository.primaryLanguage.color,
          }
        : null,
    })),
    peakDay,
  };
}

// ---------------------------------------------------------------------------
// Public service function
// ---------------------------------------------------------------------------

/**
 * Fetches and validates the contribution collection for a GitHub user
 * within a specific calendar year.
 *
 * @param username - The GitHub login handle.
 * @param year - The calendar year to fetch contributions for.
 * @returns A validated `ContributionCollection` object.
 *
 * @throws {GitHubUserNotFoundError} When the username does not exist.
 * @throws {GitHubResponseValidationError} When the response fails schema validation.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL failure.
 */
export async function fetchUserContributions(
  username: string,
  year: number,
): Promise<ContributionCollection> {
  const { from, to } = getYearDateRange(year);

  const data = await executeQuery<GetUserContributionsData>({
    query: GET_USER_CONTRIBUTIONS,
    variables: { login: username, from, to } satisfies GetUserContributionsVariables,
    operationName: "GetUserContributions",
  });

  if (data.user === null) {
    throw new GitHubUserNotFoundError(username);
  }

  const validation = contributionCollectionSchema.safeParse(
    data.user.contributionsCollection,
  );
  if (!validation.success) {
    throw new GitHubResponseValidationError("GetUserContributions", validation.error);
  }

  return normaliseContributions(data.user.contributionsCollection);
}

// ---------------------------------------------------------------------------
// Contribution helpers
// ---------------------------------------------------------------------------

/**
 * Flattens all contribution days from a `ContributionCollection` into a
 * single sorted array. This is the most common operation the Analytics
 * Engine performs on contribution data.
 */
export function flattenContributionDays(
  collection: ContributionCollection,
): ReadonlyArray<ContributionCollection["contributionCalendar"]["weeks"][number]["contributionDays"][number]> {
  return collection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
}
