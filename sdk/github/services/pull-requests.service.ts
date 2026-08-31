import { z } from "zod";

import { utcYear } from "@/lib/time/utc";
import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import {
  normalizePullRequest,
  pullRequestNodeSchema,
} from "../schemas/pull-request";
import type { GitHubPullRequest } from "../types";
import {
  GET_USER_PULL_REQUESTS,
  type GetUserPullRequestsData,
  type GetUserPullRequestsVariables,
} from "../queries";

const pullRequestsPageSchema = z.object({
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
  nodes: z.array(pullRequestNodeSchema),
});

function isWithinYear(createdAt: string, year: number): boolean {
  return utcYear(createdAt) === year;
}

function isBeforeYear(createdAt: string, year: number): boolean {
  const parsedYear = utcYear(createdAt);
  return parsedYear !== null && parsedYear < year;
}

export async function fetchUserPullRequests(
  username: string,
  year: number,
): Promise<ReadonlyArray<GitHubPullRequest>> {
  const pullRequests: GitHubPullRequest[] = [];
  let cursor: string | undefined = undefined;
  let hasNextPage = true;
  let exhaustedYear = false;

  while (hasNextPage && !exhaustedYear) {
    const result: GetUserPullRequestsData = await executeQuery<GetUserPullRequestsData>({
      query: GET_USER_PULL_REQUESTS,
      variables: {
        login: username,
        first: githubConfig.maxPageSize,
        after: cursor,
      } satisfies GetUserPullRequestsVariables,
      operationName: "GetUserPullRequests",
    });

    if (result.user === null) {
      throw new GitHubUserNotFoundError(username);
    }

    const pageValidation = pullRequestsPageSchema.safeParse(result.user.pullRequests);
    if (!pageValidation.success) {
      throw new GitHubResponseValidationError("GetUserPullRequests", pageValidation.error);
    }

    const prPage = pageValidation.data;

    for (const rawPr of prPage.nodes) {
      if (isBeforeYear(rawPr.createdAt, year)) {
        exhaustedYear = true;
        break;
      }

      if (isWithinYear(rawPr.createdAt, year)) {
        pullRequests.push(normalizePullRequest(rawPr));
      }
    }

    hasNextPage = prPage.pageInfo.hasNextPage;
    cursor = prPage.pageInfo.endCursor ?? undefined;
  }

  return pullRequests;
}
