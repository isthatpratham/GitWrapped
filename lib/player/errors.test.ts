import { describe, expect, it } from "vitest";
import { recapErrorCode, recapErrorCopy } from "./errors";
import { unwrapWrappedDeck } from "./deck-result";

describe("player error copy", () => {
  it("maps known recap codes without exposing internals", () => {
    expect(recapErrorCopy("USER_NOT_FOUND").title).toContain("couldn't find");
    expect(recapErrorCopy("RATE_LIMIT").retryable).toBe(true);
    expect(recapErrorCopy("INVALID_USERNAME").retryable).toBe(false);
  });

  it("never surfaces raw error text", () => {
    const copy = recapErrorCopy("token leaked in stack");
    expect(copy.description).not.toContain("token");
    expect(recapErrorCode(new Error("USER_NOT_FOUND"))).toBe("USER_NOT_FOUND");
    expect(recapErrorCode(new Error("ECONNREFUSED 127.0.0.1"))).toBe("FETCH_FAILED");
  });

  it("unwraps a safe deck result so production actions do not throw codes", () => {
    const failure = unwrapWrappedDeck({ ok: false, code: "USER_NOT_FOUND" });
    expect(failure.story).toBeNull();
    expect(failure.code).toBe("USER_NOT_FOUND");
    expect(recapErrorCopy(failure.code).retryable).toBe(false);
  });
});
