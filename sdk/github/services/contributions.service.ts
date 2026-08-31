import { z } from "zod";

import { executeQuery } from "../client";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import { attributePeakDayRepository, selectPeakContributionDay } from "../peak-day";
import { calendarDateSchema } from "../schemas/primitives";
import type { ContributionCollection, GitHubCommit } from "../types";
import {
  GET_USER_CONTRIBUTIONS,
  type GetUserContributionsData,
  type GetUserContributionsVariables,
} from "../queries";
import { getYearDateRange } from "./user.service";

const contributionDaySchema = z.object({
  date: calendarDateSchema,
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

type ValidatedContributionCollection = z.infer<typeof contributionCollectionSchema>;

function normaliseContributions(
  raw: ValidatedContributionCollection,
  commits: ReadonlyArray<GitHubCommit> = [],
): ContributionCollection {
  const calendarDays = raw.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
  const peakDay = selectPeakContributionDay(calendarDays);

  const repositoryPath =
    peakDay === null
      ? null
      : attributePeakDayRepository(peakDay.date, commits);

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
    peakDay: peakDay
      ? {
          date: peakDay.date,
          commitCount: peakDay.commitCount,
          repositoryPath,
        }
      : null,
  };
}

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

  return normaliseContributions(validation.data);
}

/**
 * Re-applies peak-day repository attribution after real commits are fetched.
 */
export function applyCommitAttributionToContributions(
  collection: ContributionCollection,
  commits: ReadonlyArray<GitHubCommit>,
): ContributionCollection {
  if (collection.peakDay === null) return collection;

  return {
    ...collection,
    peakDay: {
      ...collection.peakDay,
      repositoryPath: attributePeakDayRepository(collection.peakDay.date, commits),
    },
  };
}

export function flattenContributionDays(
  collection: ContributionCollection,
): ReadonlyArray<ContributionCollection["contributionCalendar"]["weeks"][number]["contributionDays"][number]> {
  return collection.contributionCalendar.weeks.flatMap((week) => week.contributionDays);
}
