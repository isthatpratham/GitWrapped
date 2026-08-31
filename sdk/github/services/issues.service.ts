import { z } from "zod";

import { utcYear } from "@/lib/time/utc";
import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import { isoTimestampSchema } from "../schemas/primitives";
import type { GitHubIssue } from "../types";
import {
  GET_USER_ISSUES,
  type GetUserIssuesData,
  type GetUserIssuesVariables,
} from "../queries";

const issueSchema = z.object({
  id: z.string(),
  title: z.string(),
  state: z.enum(["OPEN", "CLOSED"]),
  createdAt: isoTimestampSchema,
  closedAt: isoTimestampSchema.nullable(),
  url: z.string().url(),
  comments: z.object({ totalCount: z.number().int().nonnegative() }),
  reactions: z.object({ totalCount: z.number().int().nonnegative() }),
  labels: z.object({
    nodes: z.array(
      z.object({
        name: z.string(),
        color: z.string(),
      }),
    ),
  }),
  repository: z.object({
    nameWithOwner: z.string(),
    isPrivate: z.boolean(),
  }),
});

const issuesPageSchema = z.object({
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
  nodes: z.array(issueSchema),
});

type ValidatedIssue = z.infer<typeof issueSchema>;

function normaliseIssue(raw: ValidatedIssue): GitHubIssue {
  return {
    id: raw.id,
    title: raw.title,
    state: raw.state,
    createdAt: raw.createdAt,
    closedAt: raw.closedAt,
    url: raw.url,
    commentCount: raw.comments.totalCount,
    reactionCount: raw.reactions.totalCount,
    labels: raw.labels.nodes.map((node) => ({ name: node.name, color: node.color })),
    repository: {
      nameWithOwner: raw.repository.nameWithOwner,
      isPrivate: raw.repository.isPrivate,
    },
  };
}

export async function fetchUserIssues(
  username: string,
  year: number,
): Promise<ReadonlyArray<GitHubIssue>> {
  const issues: GitHubIssue[] = [];
  let cursor: string | undefined = undefined;
  let hasNextPage = true;
  let exhaustedYear = false;

  while (hasNextPage && !exhaustedYear) {
    const result: GetUserIssuesData = await executeQuery<GetUserIssuesData>({
      query: GET_USER_ISSUES,
      variables: {
        login: username,
        first: githubConfig.maxPageSize,
        after: cursor,
      } satisfies GetUserIssuesVariables,
      operationName: "GetUserIssues",
    });

    if (result.user === null) {
      throw new GitHubUserNotFoundError(username);
    }

    const pageValidation = issuesPageSchema.safeParse(result.user.issues);
    if (!pageValidation.success) {
      throw new GitHubResponseValidationError("GetUserIssues", pageValidation.error);
    }

    const page = pageValidation.data;

    for (const rawIssue of page.nodes) {
      const createdYear = utcYear(rawIssue.createdAt);
      if (createdYear !== null && createdYear < year) {
        exhaustedYear = true;
        break;
      }
      if (createdYear === year) {
        issues.push(normaliseIssue(rawIssue));
      }
    }

    hasNextPage = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor ?? undefined;
  }

  return issues;
}
