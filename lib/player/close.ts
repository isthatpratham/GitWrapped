import { ROUTES } from "@/constants/routes";

/** Parent experience after leaving the Story Player. */
export const STORY_PLAYER_CLOSE_PATH = ROUTES.LANDING;

export function storyPlayerClosePath(): string {
  return STORY_PLAYER_CLOSE_PATH;
}
