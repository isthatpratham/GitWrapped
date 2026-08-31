// ---------------------------------------------------------------------------
// GraphQL Query: User Profile
// ---------------------------------------------------------------------------
// Fetches the complete public identity for a GitHub user.
//
// Design decisions:
// - One query for all profile fields so the service layer has a single
//   cache entry for user identity.
// - `followers.totalCount` and `following.totalCount` are nested objects
//   in the GitHub schema (they're connections), not scalars.
// - `repositories(privacy: PUBLIC, ownerAffiliations: OWNER)` gives
//   the count of owned public repos without fetching repository nodes.
//
// GitHub GraphQL limitation:
// - There is no single scalar for publicRepositoryCount on the User type.
//   We must query the connection and read totalCount.
// ---------------------------------------------------------------------------

/**
 * Fetches the complete public profile for a GitHub user.
 *
 * Analytics enabled:
 * - Account age calculation (createdAt → years active)
 * - Social reach (followers, following)
 * - Repository count as a career-stage signal
 *
 * @example
 * const data = await executeQuery<GetUserProfileData>({
 *   query: GET_USER_PROFILE,
 *   variables: { login: "torvalds" },
 *   operationName: "GetUserProfile",
 * });
 */
export const GET_USER_PROFILE = /* GraphQL */ `
  query GetUserProfile($login: String!) {
    user(login: $login) {
      id
      login
      name
      avatarUrl
      bio
      createdAt
      websiteUrl
      twitterUsername
      company
      location
      followers {
        totalCount
      }
      following {
        totalCount
      }
      repositories(privacy: PUBLIC, ownerAffiliations: OWNER) {
        totalCount
      }
    }
  }
`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Variables accepted by {@link GET_USER_PROFILE}. */
export interface GetUserProfileVariables {
  /** The GitHub login (username) to look up. Case-insensitive on GitHub's side. */
  readonly login: string;
}

/**
 * Raw response shape for {@link GET_USER_PROFILE}.
 * `user` is null when no account exists for the given login.
 */
export interface GetUserProfileData {
  readonly user: {
    readonly id: string;
    readonly login: string;
    readonly name: string | null;
    readonly avatarUrl: string;
    readonly bio: string | null;
    readonly createdAt: string;
    readonly websiteUrl: string | null;
    readonly twitterUsername: string | null;
    readonly company: string | null;
    readonly location: string | null;
    readonly followers: { readonly totalCount: number };
    readonly following: { readonly totalCount: number };
    readonly repositories: { readonly totalCount: number };
  } | null;
}
