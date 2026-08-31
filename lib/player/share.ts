import type { Story, StorySlide } from "@/services/story";

export type ShareMethod = "native" | "copy";

export interface ShareRequest {
  readonly title: string;
  readonly text: string;
  readonly url: string;
}

export interface ShareCardStats {
  readonly handle: string;
  readonly year: number;
  readonly contributions: string;
  readonly language: string | null;
  readonly streakDays: number;
  readonly headline: string | null;
  readonly heroValue: string | number | null;
}

function asShareStatistics(value: unknown): {
  formattedTotalContributions?: string;
  topLanguageName?: string | null;
  longestStreakDays?: number;
} {
  if (!value || typeof value !== "object") return {};
  const record = value as Record<string, unknown>;
  return {
    formattedTotalContributions:
      typeof record.formattedTotalContributions === "string" ? record.formattedTotalContributions : undefined,
    topLanguageName: typeof record.topLanguageName === "string" || record.topLanguageName === null ? record.topLanguageName : undefined,
    longestStreakDays: typeof record.longestStreakDays === "number" ? record.longestStreakDays : undefined,
  };
}

export function recapShareUrl(origin: string, handle: string, fallbackUrl: string): string {
  if (!origin) return fallbackUrl;
  try {
    return new URL(`/wrapped/${encodeURIComponent(handle)}`, origin).toString();
  } catch {
    return fallbackUrl;
  }
}

export function shareCardStats(story: Story, moment?: StorySlide | null): ShareCardStats {
  const overview =
    story.slides.find((slide) => slide.type === "Overview") ??
    story.slides.find((slide) => slide.type === "Summary");
  const stats = asShareStatistics(overview?.metadata.shareStatistics);
  return {
    handle: story.developer.handle,
    year: story.year,
    contributions: stats.formattedTotalContributions ?? String(0),
    language: stats.topLanguageName ?? null,
    streakDays: stats.longestStreakDays ?? 0,
    headline: moment?.shareable ? moment.headline : null,
    heroValue: moment?.shareable ? moment.heroValue : null,
  };
}

export function buildShareRequest(story: Story, origin: string, moment?: StorySlide | null): ShareRequest {
  const url = recapShareUrl(origin, story.developer.handle, story.sharing.shareUrl);
  if (moment?.shareable) {
    return {
      title: `GitWrapped ${story.year}`,
      text: moment.headline,
      url,
    };
  }
  return {
    title: `GitWrapped ${story.year}`,
    text: story.sharing.defaultShareText,
    url,
  };
}

export function nativeShareSupported(share: unknown): boolean {
  return typeof share === "function";
}
