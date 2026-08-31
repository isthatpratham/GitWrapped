import type { Story } from "@/services/story";

export type WrappedDeckResult =
  | { readonly ok: true; readonly story: Story }
  | { readonly ok: false; readonly code: string };

export function unwrapWrappedDeck(result: WrappedDeckResult): {
  readonly story: Story | null;
  readonly code: string | null;
} {
  if (result.ok) {
    return { story: result.story, code: null };
  }
  return { story: null, code: result.code };
}
