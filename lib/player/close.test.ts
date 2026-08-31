import { describe, expect, it } from "vitest";
import { ROUTES } from "@/constants/routes";
import { STORY_PLAYER_CLOSE_PATH, storyPlayerClosePath } from "./close";

describe("story player close", () => {
  it("exits to the landing experience without reloading the document", () => {
    expect(storyPlayerClosePath()).toBe(ROUTES.LANDING);
    expect(STORY_PLAYER_CLOSE_PATH).toBe("/");
  });
});
