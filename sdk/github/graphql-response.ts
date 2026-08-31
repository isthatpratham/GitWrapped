import { GitHubGraphQLError } from "./errors";
import type { GraphQLResponse } from "./types";

/**
 * GitHub often returns field-level errors together with a `data` payload
 * (for example `user: null` plus NOT_FOUND). Prefer the payload so services
 * can distinguish a missing user from a transport failure.
 */
export function resolveGraphQLPayload<TData>(
  body: GraphQLResponse<TData>,
  operationName: string,
): TData {
  const hasData = body.data !== undefined && body.data !== null;
  if (hasData) {
    return body.data;
  }

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    throw new GitHubGraphQLError(body.errors, operationName);
  }

  throw new GitHubGraphQLError(
    [{ message: "Response contained no `data` field and no `errors` field." }],
    operationName,
  );
}
