import { z } from "zod";

import type { GitHubPullRequest } from "../types";
import { isoTimestampSchema } from "./primitives";

/**
 * Zod contract for every pull-request field the analytics layer consumes.
 * Downstream code must not read fields that are not validated here.
 */
export const pullRequestNodeSchema = z.object({
  id: z.string(),
  title: z.string(),
  state: z.enum(["OPEN", "CLOSED", "MERGED"]),
  createdAt: isoTimestampSchema,
  mergedAt: isoTimestampSchema.nullable(),
  closedAt: isoTimestampSchema.nullable(),
  url: z.string().url(),
  additions: z.number().int().nonnegative(),
  deletions: z.number().int().nonnegative(),
  changedFiles: z.number().int().nonnegative(),
  comments: z.object({ totalCount: z.number().int().nonnegative() }),
  reviewRequests: z.object({ totalCount: z.number().int().nonnegative() }),
  baseRepository: z
    .object({
      nameWithOwner: z.string(),
      isPrivate: z.boolean(),
    })
    .nullable(),
  labels: z.object({
    nodes: z.array(
      z.object({
        name: z.string(),
        color: z.string(),
      }),
    ),
  }),
});

export type ValidatedPullRequest = z.infer<typeof pullRequestNodeSchema>;

export function normalizePullRequest(raw: ValidatedPullRequest): GitHubPullRequest {
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
    labels: raw.labels.nodes.map((node) => ({ name: node.name, color: node.color })),
  };
}
