import { describe, expect, it } from "vitest";

import { githubUsernameSchema, parseGitHubUsername } from "./username";

describe("githubUsernameSchema", () => {
  it("accepts a valid GitHub login", () => {
    expect(parseGitHubUsername("octocat")).toBe("octocat");
  });

  it("rejects an empty username", () => {
    expect(githubUsernameSchema.safeParse("").success).toBe(false);
  });

  it("rejects usernames that start or end with a hyphen", () => {
    expect(githubUsernameSchema.safeParse("-octocat").success).toBe(false);
    expect(githubUsernameSchema.safeParse("octocat-").success).toBe(false);
  });
});
