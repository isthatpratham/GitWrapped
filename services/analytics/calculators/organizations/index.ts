// ---------------------------------------------------------------------------
// Calculator: Organizations
// ---------------------------------------------------------------------------
// Processes organisation data to output memberships, counts, and finds the
// most active organisation.
// ---------------------------------------------------------------------------

import type { Organization } from "@/domain/models";
import type { AnalyticsOrganizations } from "@/services/analytics/analytics.types";

export function calculateOrganizations(
  organizations: ReadonlyArray<Organization>,
): AnalyticsOrganizations {
  if (organizations.length === 0) {
    return {
      organizationContributionsCount: 0,
      mostActiveOrganization: null,
      organizationList: [],
    };
  }

  // Sort by repository count to estimate "most active" organization
  const sortedByRepos = [...organizations].sort((a, b) => b.repositoryCount - a.repositoryCount);
  const mostActive = sortedByRepos[0] ?? null;

  const organizationList = organizations.map((org) => ({
    handle: org.handle,
    displayName: org.displayName,
    memberCount: org.memberCount,
    repositoryCount: org.repositoryCount,
  }));

  return {
    organizationContributionsCount: organizations.length,
    mostActiveOrganization: mostActive
      ? {
          handle: mostActive.handle,
          displayName: mostActive.displayName,
          avatarUrl: mostActive.avatarUrl,
          repositoryCount: mostActive.repositoryCount,
        }
      : null,
    organizationList,
  };
}
