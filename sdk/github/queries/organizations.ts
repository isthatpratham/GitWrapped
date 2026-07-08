// ---------------------------------------------------------------------------
// GraphQL Query: User Organizations
// ---------------------------------------------------------------------------
// Fetches all public organizations the user is a member of.
//
// Design decisions:
// - `organizations(first: 20)` is a hard cap that matches GitHub's
//   UI display limit and covers all realistic cases. Users with more
//   than 20 public org memberships are vanishingly rare.
// - We intentionally do NOT fetch the organization's repositories here.
//   The `GET_USER_REPOSITORIES` query already captures all public repos
//   the user owns. Org repos require a separate permission model and are
//   out of scope for V1 (PAT with public_repo scope only).
// - `membersWithRole.totalCount` gives the org size signal for analytics
//   without fetching individual member profiles.
//
// GitHub GraphQL limitation:
// - Only public org memberships are visible without OAuth scopes.
//   Private org memberships require `read:org` scope on the token.
// - Organization repository contributions are not captured here.
//   They appear in `contributionsCollection` if the user pushed to them.
// ---------------------------------------------------------------------------

/**
 * Fetches all public organization memberships for a GitHub user.
 *
 * Analytics enabled:
 * - "Member of N organizations" story slide
 * - Organization diversity (open-source vs. corporate signal)
 * - Visual showcase of org avatars in the recap
 */
export const GET_USER_ORGANIZATIONS = /* GraphQL */ `
  query GetUserOrganizations($login: String!, $first: Int!, $after: String) {
    user(login: $login) {
      organizations(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        nodes {
          login
          name
          avatarUrl
          description
          url
          websiteUrl
          membersWithRole {
            totalCount
          }
          repositories {
            totalCount
          }
        }
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_ORGANIZATIONS}. */
export interface GetUserOrganizationsVariables {
  readonly login: string;
  /** Number of organizations per page. Maximum: 100. */
  readonly first: number;
  /** Pagination cursor from `pageInfo.endCursor`. Omit for the first page. */
  readonly after?: string;
}

/** Raw shape of a single organization node in {@link GetUserOrganizationsData}. */
export interface OrganizationNode {
  /** Organization login handle (slug). */
  readonly login: string;
  /** Display name. May be null for organizations that haven't set one. */
  readonly name: string | null;
  /** Full URL of the organization's avatar image. */
  readonly avatarUrl: string;
  readonly description: string | null;
  readonly url: string;
  readonly websiteUrl: string | null;
  readonly membersWithRole: { readonly totalCount: number };
  readonly repositories: { readonly totalCount: number };
}

/**
 * Raw response shape for {@link GET_USER_ORGANIZATIONS}.
 * `user` is null when no account exists for the given login.
 * `nodes` may be an empty array if the user has no public org memberships.
 */
export interface GetUserOrganizationsData {
  readonly user: {
    readonly organizations: {
      readonly pageInfo: {
        readonly hasNextPage: boolean;
        readonly endCursor: string | null;
      };
      readonly nodes: ReadonlyArray<OrganizationNode>;
    };
  } | null;
}
