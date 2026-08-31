import { z } from "zod";

import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError } from "../errors";
import { isoTimestampSchema } from "../schemas/primitives";
import type { GitHubCommit } from "../types";
import {
  GET_REPOSITORY_COMMITS,
  type GetRepositoryCommitsData,
  type GetRepositoryCommitsVariables,
} from "../queries";
import { getYearDateRange } from "./user.service";

const MAX_REPOSITORIES = 5;
const MAX_PAGES_PER_REPOSITORY = 2;

const commitNodeSchema = z.object({
  oid: z.string().min(1),
  messageHeadline: z.string(),
  message: z.string(),
  committedDate: isoTimestampSchema,
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
  changedFilesIfAvailable: z.number().int().nonnegative().nullable(),
});

const repositoryCommitsSchema = z
  .object({
    defaultBranchRef: z
      .object({
        target: z
          .object({
            history: z
              .object({
                pageInfo: z.object({
                  hasNextPage: z.boolean(),
                  endCursor: z.string().nullable(),
                }),
                nodes: z.array(commitNodeSchema.nullable()),
              })
              .optional(),
          })
          .passthrough(),
      })
      .nullable(),
  })
  .nullable();

export interface FetchUserCommitsOptions {
  readonly authorId: string;
  readonly repositoryPaths: ReadonlyArray<string>;
  readonly year: number;
}

function splitRepositoryPath(path: string): { owner: string; name: string } | null {
  const separator = path.indexOf("/");
  if (separator <= 0 || separator === path.length - 1) return null;
  const owner = path.slice(0, separator);
  const name = path.slice(separator + 1);
  if (!owner || !name || name.includes("/")) return null;
  return { owner, name };
}

function normaliseCommit(
  raw: z.infer<typeof commitNodeSchema>,
  repositoryPath: string,
): GitHubCommit {
  return {
    oid: raw.oid,
    messageHeadline: raw.messageHeadline,
    message: raw.message,
    committedDate: raw.committedDate,
    additions: raw.additions,
    deletions: raw.deletions,
    changedFiles: raw.changedFilesIfAvailable,
    repositoryPath,
  };
}

async function fetchRepositoryCommits(
  authorId: string,
  repositoryPath: string,
  year: number,
): Promise<ReadonlyArray<GitHubCommit>> {
  const split = splitRepositoryPath(repositoryPath);
  if (split === null) return [];

  const { from, to } = getYearDateRange(year);
  const commits: GitHubCommit[] = [];
  let cursor: string | undefined = undefined;
  let pages = 0;
  let hasNextPage = true;

  while (hasNextPage && pages < MAX_PAGES_PER_REPOSITORY) {
    const data = await executeQuery<GetRepositoryCommitsData>({
      query: GET_REPOSITORY_COMMITS,
      variables: {
        owner: split.owner,
        name: split.name,
        authorId,
        first: githubConfig.maxPageSize,
        after: cursor,
        since: from,
        until: to,
      } satisfies GetRepositoryCommitsVariables,
      operationName: "GetRepositoryCommits",
    });

    const validation = repositoryCommitsSchema.safeParse(data.repository);
    if (!validation.success) {
      throw new GitHubResponseValidationError("GetRepositoryCommits", validation.error);
    }

    const history = validation.data?.defaultBranchRef?.target.history;
    if (!history) {
      return commits;
    }

    for (const node of history.nodes) {
      if (node === null) continue;
      commits.push(normaliseCommit(node, repositoryPath));
    }

    hasNextPage = history.pageInfo.hasNextPage;
    cursor = history.pageInfo.endCursor ?? undefined;
    pages += 1;
  }

  return commits;
}

/**
 * Fetches real commit timestamps for the user's top contribution repositories.
 * Bounded to protect the shared rate limit: 5 repos × 2 pages × 100 commits.
 */
export async function fetchUserCommitsForRepositories(
  options: FetchUserCommitsOptions,
): Promise<{ readonly commits: ReadonlyArray<GitHubCommit>; readonly partial: boolean }> {
  const uniquePaths = Array.from(new Set(options.repositoryPaths)).filter(Boolean);
  const limited = uniquePaths.slice(0, MAX_REPOSITORIES);
  const commits: GitHubCommit[] = [];
  let partial = uniquePaths.length > limited.length;

  for (const path of limited) {
    try {
      const repoCommits = await fetchRepositoryCommits(options.authorId, path, options.year);
      commits.push(...repoCommits);
    } catch {
      partial = true;
    }
  }

  return { commits, partial };
}
