import { z } from "zod";

/**
 * GitHub login rules: 1–39 characters, alphanumeric or single hyphens,
 * cannot begin or end with a hyphen.
 */
export const githubUsernameSchema = z
  .string()
  .trim()
  .regex(
    /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/,
    "Invalid GitHub username",
  );

export function parseGitHubUsername(username: string): string {
  return githubUsernameSchema.parse(username);
}
