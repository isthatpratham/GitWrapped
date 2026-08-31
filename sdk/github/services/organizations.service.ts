import { z } from "zod";

import { executeQuery } from "../client";
import { githubConfig } from "../config";
import { GitHubResponseValidationError, GitHubUserNotFoundError } from "../errors";
import type { GitHubOrganization } from "../types";
import {
  GET_USER_ORGANIZATIONS,
  type GetUserOrganizationsData,
  type GetUserOrganizationsVariables,
} from "../queries";

const organizationSchema = z.object({
  login: z.string().min(1),
  name: z.string().nullable(),
  avatarUrl: z.string().url(),
  description: z.string().nullable(),
  url: z.string().url(),
  websiteUrl: z.string().nullable(),
  membersWithRole: z.object({ totalCount: z.number().int().nonnegative() }),
  repositories: z.object({ totalCount: z.number().int().nonnegative() }),
});

const organizationsPageSchema = z.object({
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string().nullable(),
  }),
  nodes: z.array(organizationSchema.nullable()),
});

export async function fetchUserOrganizations(
  username: string,
): Promise<ReadonlyArray<GitHubOrganization>> {
  const organizations: GitHubOrganization[] = [];
  let cursor: string | undefined = undefined;
  let hasNextPage = true;

  while (hasNextPage) {
    const result: GetUserOrganizationsData = await executeQuery<GetUserOrganizationsData>({
      query: GET_USER_ORGANIZATIONS,
      variables: {
        login: username,
        first: githubConfig.maxPageSize,
        after: cursor,
      } satisfies GetUserOrganizationsVariables,
      operationName: "GetUserOrganizations",
    });

    if (result.user === null) {
      throw new GitHubUserNotFoundError(username);
    }

    const pageValidation = organizationsPageSchema.safeParse(result.user.organizations);
    if (!pageValidation.success) {
      throw new GitHubResponseValidationError("GetUserOrganizations", pageValidation.error);
    }

    const page = pageValidation.data;

    for (const node of page.nodes) {
      if (node === null) continue;
      organizations.push({
        login: node.login,
        name: node.name,
        avatarUrl: node.avatarUrl,
        description: node.description,
        url: node.url,
        websiteUrl: node.websiteUrl,
        memberCount: node.membersWithRole.totalCount,
        repositoryCount: node.repositories.totalCount,
      });
    }

    hasNextPage = page.pageInfo.hasNextPage;
    cursor = page.pageInfo.endCursor ?? undefined;
  }

  return organizations;
}
