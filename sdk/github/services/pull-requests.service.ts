import { z } from "zod";

import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import type { GitHubPullRequest } from "../types";
import {
  GET_USER_PULL_REQUESTS,
  type GetUserPullRequestsData,
  type GetUserPullRequestsVariables,
} from "../queries";


// ---------------------------------------------------------------------------
// Zod schema: Pull Request
// ---------------------------------------------------------------------------

const pullRequestSchema = z.object({
  id: z.string(),
  title: z.string(),
  state: z.enum(["OPEN", "CLOSED", "MERGED"]),
  createdAt: z.string().datetime(),
  mergedAt: z.string().datetime().nullable(),
  closedAt: z.string().datetime().nullable(),
  url: z.string().url(),
  baseRepository: z.object({ nameWithOwner: z.string() }).nullable(),
});

const pullRequestsPageSchema = z.object({
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
  nodes: z.array(pullRequestSchema),
});

// ---------------------------------------------------------------------------
// Year filter helper
// ---------------------------------------------------------------------------

/**
 * Returns true if the PR was created within the given calendar year.
 */
function isWithinYear(createdAt: string, year: number): boolean {
  return new Date(createdAt).getFullYear() === year;
}

/**
 * Returns true if the PR was created before the given calendar year.
 * Used as a pagination stop signal — once we see PRs from before the target
 * year, there's no need to fetch more pages (results are ordered DESC).
 */
function isBeforeYear(createdAt: string, year: number): boolean {
  return new Date(createdAt).getFullYear() < year;
}

// ---------------------------------------------------------------------------
// Normaliser
// ---------------------------------------------------------------------------
// Explicit interface to avoid TypeScript resolving conditional types to `never`.

interface RawPullRequest {
  readonly id: string;
  readonly title: string;
  readonly state: "OPEN" | "CLOSED" | "MERGED";
  readonly createdAt: string;
  readonly mergedAt: string | null;
  readonly closedAt: string | null;
  readonly url: string;
  readonly additions: number;
  readonly deletions: number;
  readonly changedFiles: number;
  readonly comments: { readonly totalCount: number };
  readonly reviewRequests: { readonly totalCount: number };
  readonly baseRepository: {
    readonly nameWithOwner: string;
    readonly isPrivate: boolean;
  } | null;
  readonly labels: {
    readonly nodes: ReadonlyArray<{ readonly name: string; readonly color: string }>;
  };
}

function normalisePullRequest(raw: RawPullRequest): GitHubPullRequest {
  return {
    id: raw.id,
    title: raw.title,
    state: raw.state,
    createdAt: raw.createdAt,
    mergedAt: raw.mergedAt,
    closedAt: raw.closedAt,
    url: raw.url,
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changedFiles,
    commentCount: raw.comments.totalCount,
    reviewRequestCount: raw.reviewRequests.totalCount,
    baseRepository: raw.baseRepository
      ? {
          nameWithOwner: raw.baseRepository.nameWithOwner,
          isPrivate: raw.baseRepository.isPrivate,
        }
      : null,
    labels: raw.labels.nodes.map((n) => ({ name: n.name, color: n.color })),
  };
}

// ---------------------------------------------------------------------------
// Public service function
// ---------------------------------------------------------------------------

/**
 * Fetches all pull requests authored by a user within a specific calendar year.
 *
 * Uses cursor-based pagination with an early-exit optimisation: because the
 * API returns PRs ordered by `createdAt DESC`, we stop fetching once we
 * encounter a PR created before the target year — avoiding unnecessary requests.
 *
 * @param username - The GitHub login handle.
 * @param year - The calendar year to filter pull requests by.
 * @returns An array of `GitHubPullRequest` objects for the given year.
 *
 * @throws {GitHubUserNotFoundError} When the username does not exist.
 * @throws {GitHubResponseValidationError} When any page fails schema validation.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL failure.
 */
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

    const prPage = result.user.pullRequests;

    const pageValidation = pullRequestsPageSchema.safeParse(prPage);
    if (!pageValidation.success) {
      throw new GitHubResponseValidationError("GetUserPullRequests", pageValidation.error);
    }

    for (const rawPr of prPage.nodes) {
      // Early exit: PRs are ordered newest-first. If this PR was created
      // before our target year, all subsequent PRs will be too.
      if (isBeforeYear(rawPr.createdAt, year)) {
        exhaustedYear = true;
        break;
      }

      if (isWithinYear(rawPr.createdAt, year)) {
        pullRequests.push(normalisePullRequest(rawPr as RawPullRequest));
      }
    }

    hasNextPage = prPage.pageInfo.hasNextPage;
    cursor = prPage.pageInfo.endCursor ?? undefined;
  }

  return pullRequests;
}
