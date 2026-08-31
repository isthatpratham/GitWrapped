import { describe, expect, it } from "vitest";
import { composeStory } from "@/services/story";
import { baseAnalytics, richAnalytics } from "@/services/story/test-fixtures";
import { buildShareRequest, nativeShareSupported, recapShareUrl, shareCardStats } from "./share";
import { buildShareCardSvg, escapeXml, shareCardFileStem } from "./share-card";

describe("share helpers", () => {
  it("builds a public recap URL from the current origin", () => {
    expect(recapShareUrl("https://gitwrapped.dev", "octocat", "https://example.test")).toBe(
      "https://gitwrapped.dev/wrapped/octocat",
    );
  });

  it("falls back to copy when native share is unavailable", () => {
    expect(nativeShareSupported(undefined)).toBe(false);
    expect(nativeShareSupported(async () => undefined)).toBe(true);
  });

  it("uses overview stats and omits mock rank percentiles from the card", () => {
    const story = composeStory(richAnalytics());
    const stats = shareCardStats(story);
    const svg = buildShareCardSvg(stats);
    expect(stats.contributions).toBe("420");
    expect(svg).toContain("@octocat");
    expect(svg).not.toContain("RANK");
    expect(svg).not.toContain("ghp_");
  });

  it("escapes untrusted copy in generated cards", () => {
    expect(escapeXml(`<script>"x"&'`)).toBe("&lt;script&gt;&quot;x&quot;&amp;&apos;");
    expect(shareCardFileStem("octo/cat", 2026)).toBe("octocat-gitwrapped-2026");
  });

  it("shares a moment headline when the engine marked the slide shareable", () => {
    const story = composeStory(baseAnalytics());
    const overview = story.slides.find((slide) => slide.type === "Overview");
    const request = buildShareRequest(story, "https://gitwrapped.dev", overview);
    expect(request.url).toContain("/wrapped/octocat");
    expect(request.text.length).toBeGreaterThan(0);
  });
});
