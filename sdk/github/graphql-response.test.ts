import { describe, expect, it } from "vitest";
import { GitHubGraphQLError } from "./errors";
import { resolveGraphQLPayload } from "./graphql-response";

describe("resolveGraphQLPayload", () => {
  it("returns data when GitHub includes a field-level NOT_FOUND error", () => {
    const payload = resolveGraphQLPayload(
      {
        data: { user: null },
        errors: [{ type: "NOT_FOUND", message: "Could not resolve to a User." }],
      },
      "GetUserProfile",
    );
    expect(payload).toEqual({ user: null });
  });

  it("throws when the body has errors and no data", () => {
    expect(() =>
      resolveGraphQLPayload({ errors: [{ message: "Something failed." }] }, "GetUserProfile"),
    ).toThrow(GitHubGraphQLError);
  });

  it("throws when the body is empty", () => {
    expect(() => resolveGraphQLPayload({}, "GetUserProfile")).toThrow(GitHubGraphQLError);
  });
});
