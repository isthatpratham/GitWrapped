// ---------------------------------------------------------------------------
// Compatibility shim — do not import this file directly.
// ---------------------------------------------------------------------------
// The canonical source for this query has moved to:
//   sdk/github/queries/pullRequests.ts
//
// This file re-exports everything so that existing code continues to compile
// while we migrate import sites to the new module name.
// ---------------------------------------------------------------------------

export {
  GET_USER_PULL_REQUESTS,
  type GetUserPullRequestsVariables,
  type GetUserPullRequestsData,
} from "./pullRequests";
