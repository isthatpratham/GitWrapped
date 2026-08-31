import { z } from "zod";

import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import { isoTimestampSchema } from "../schemas/primitives";
import type { GitHubRepository } from "../types";
import {
  GET_USER_REPOSITORIES,
  type GetUserRepositoriesData,
  type GetUserRepositoriesVariables,
} from "../queries";

// ---------------------------------------------------------------------------
// Zod schema: Repository
// ---------------------------------------------------------------------------

const repositoryLanguageSchema = z.object({
  name: z.string().min(1),
  color: z.string().nullable(),
});

const repositorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  nameWithOwner: z.string(),
  description: z.string().nullable(),
  createdAt: isoTimestampSchema,
  pushedAt: isoTimestampSchema.nullable(),
  updatedAt: isoTimestampSchema,
  stargazerCount: z.number().int().nonnegative(),
  forkCount: z.number().int().nonnegative(),
  isPrivate: z.boolean(),
  isFork: z.boolean(),
  isArchived: z.boolean(),
  diskUsage: z.number().nullable(),
  url: z.string().url(),
  primaryLanguage: repositoryLanguageSchema.nullable(),
  languages: z.object({
    totalSize: z.number().nonnegative(),
    edges: z.array(
      z.object({
        size: z.number().nonnegative(),
        node: repositoryLanguageSchema,
      }),
    ),
  }),
  watchers: z.object({ totalCount: z.number().int().nonnegative() }),
  openIssues: z.object({ totalCount: z.number().int().nonnegative() }),
  openPullRequests: z.object({ totalCount: z.number().int().nonnegative() }),
  defaultBranchRef: z.object({ name: z.string() }).nullable(),
  homepageUrl: z.string().nullable(),
  visibility: z.string(),
  repositoryTopics: z.object({
    nodes: z.array(
      z.object({
        topic: z.object({ name: z.string() }),
      }),
    ),
  }),
});

const repositoriesPageSchema = z.object({
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
  nodes: z.array(repositorySchema),
});

// ---------------------------------------------------------------------------
// Normaliser
// ---------------------------------------------------------------------------
// We use an explicit interface rather than a conditional type extraction
// to avoid TypeScript resolving to `never` on deep generic inference.

type ValidatedRepository = z.infer<typeof repositorySchema>;

function normaliseRepository(raw: ValidatedRepository): GitHubRepository {
  return {
    id: raw.id,
    name: raw.name,
    nameWithOwner: raw.nameWithOwner,
    description: raw.description,
    createdAt: raw.createdAt,
    pushedAt: raw.pushedAt,
    updatedAt: raw.updatedAt,
    stargazerCount: raw.stargazerCount,
    forkCount: raw.forkCount,
    watcherCount: raw.watchers.totalCount,
    openIssueCount: raw.openIssues.totalCount,
    openPullRequestCount: raw.openPullRequests.totalCount,
    isPrivate: raw.isPrivate,
    isFork: raw.isFork,
    isArchived: raw.isArchived,
    diskUsage: raw.diskUsage,
    url: raw.url,
    primaryLanguage: raw.primaryLanguage
      ? { name: raw.primaryLanguage.name, color: raw.primaryLanguage.color }
      : null,
    languages: {
      totalSize: raw.languages.totalSize,
      edges: raw.languages.edges.map((edge) => ({
        size: edge.size,
        node: { name: edge.node.name, color: edge.node.color },
      })),
    },
    defaultBranch: raw.defaultBranchRef?.name ?? null,
    homepageUrl: raw.homepageUrl,
    visibility: raw.visibility,
    topics: raw.repositoryTopics.nodes.map((node) => node.topic.name),
  };
}

// ---------------------------------------------------------------------------
// Pagination helper
// ---------------------------------------------------------------------------

/**
 * Fetches all pages of a user's repositories by automatically following
 * pagination cursors until no more pages remain.
 *
 * GitHub's GraphQL API caps individual pages at 100 items. We use automatic
 * pagination to ensure we capture all repositories regardless of count.
 *
 * Important: we exclude forks (`isFork: false` in the query) because
 * the Analytics Engine only analyses repositories the user has created.
 */
async function fetchAllRepositoryPages(
  username: string,
): Promise<ReadonlyArray<GitHubRepository>> {
  const repositories: GitHubRepository[] = [];
  let cursor: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const result: GetUserRepositoriesData = await executeQuery<GetUserRepositoriesData>({
      query: GET_USER_REPOSITORIES,
      variables: {
        login: username,
        first: githubConfig.maxPageSize,
        after: cursor,
      } satisfies GetUserRepositoriesVariables,
      operationName: "GetUserRepositories",
    });

    if (result.user === null) {
      throw new GitHubUserNotFoundError(username);
    }

    const reposPage = result.user.repositories;

    const pageValidation = repositoriesPageSchema.safeParse(reposPage);
    if (!pageValidation.success) {
      throw new GitHubResponseValidationError("GetUserRepositories", pageValidation.error);
    }

    const normalisedNodes = pageValidation.data.nodes.map((node) =>
      normaliseRepository(node),
    );
    repositories.push(...normalisedNodes);

    hasNextPage = pageValidation.data.pageInfo.hasNextPage;
    cursor = pageValidation.data.pageInfo.endCursor ?? undefined;
  }

  return repositories;
}

// ---------------------------------------------------------------------------
// Public service function
// ---------------------------------------------------------------------------

/**
 * Fetches all public, owned (non-fork) repositories for a GitHub user.
 * Automatically handles pagination to return the complete repository list.
 *
 * @param username - The GitHub login handle.
 * @returns An array of `GitHubRepository` objects, ordered by most recently pushed.
 *
 * @throws {GitHubUserNotFoundError} When the username does not exist.
 * @throws {GitHubResponseValidationError} When any page fails schema validation.
 * @throws {GitHubSDKError} For any transport, HTTP, or GraphQL failure.
 */
export async function fetchUserRepositories(
  username: string,
): Promise<ReadonlyArray<GitHubRepository>> {
  return fetchAllRepositoryPages(username);
}
