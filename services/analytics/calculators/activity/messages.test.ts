import { describe, expect, it } from "vitest";
import { analyzeCommitMessageProfile, looksLikeSecretText } from "./messages";

describe("analyzeCommitMessageProfile", () => {
  it("counts conventional prefixes without storing messages", () => {
    const profile = analyzeCommitMessageProfile([
      "feat: add login",
      "feat(api): pagination",
      "fix: null check",
      "refactor: extract mapper",
      "docs: readme",
      "chore: bump",
      "update docs",
      "final pass",
    ]);
    expect(profile.sampleSize).toBe(8);
    expect(profile.feat).toBe(2);
    expect(profile.fix).toBe(1);
    expect(profile.refactor).toBe(1);
    expect(profile.docs).toBe(1);
    expect(profile.chore).toBe(1);
    expect(profile.update).toBe(1);
    expect(profile.final).toBe(1);
    expect(JSON.stringify(profile)).not.toContain("add login");
  });

  it("skips secret-like summaries and is deterministic", () => {
    const input = ["fix: timeout", "-----BEGIN marker-----", "fix: timeout"];
    expect(looksLikeSecretText("-----BEGIN marker-----")).toBe(true);
    const first = analyzeCommitMessageProfile(input);
    const second = analyzeCommitMessageProfile(input);
    expect(first).toEqual(second);
    expect(first.sampleSize).toBe(2);
    expect(first.fix).toBe(2);
  });
});
