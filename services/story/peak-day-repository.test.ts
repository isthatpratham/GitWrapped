import { describe, expect, it } from "vitest";
import { composeStory } from "./compose";
import { copyForInsight } from "./copy/templates";
import { generateStoryInsights } from "./intelligence/generate";
import { selectRepositoryCard } from "@/lib/player";
import { availableMeasured } from "@/domain/models";
import { divergentRepositoryAnalytics, richAnalytics } from "./test-fixtures";
import type { StoryInsight } from "./intelligence/types";

function peakCopyInsight(): StoryInsight {
  return {
    id: "peak-repository",
    kind: "peak-repository",
    family: "repository",
    chapter: "YOUR_BUILD",
    slideType: "Repositories",
    availability: availableMeasured(),
    strength: 50,
    uniqueness: 50,
    narrativeValue: 50,
    surprise: 10,
    shareable: true,
    heroValue: "isthatpratham/DeadDrop",
    evidence: [],
    payload: {
      kind: "peak-repository",
      repositoryPath: "isthatpratham/DeadDrop",
      date: "2026-08-31",
      count: 18,
      ownerName: "isthatpratham",
      name: "DeadDrop",
      starCount: 3,
      url: "https://github.com/isthatpratham/DeadDrop",
    },
  };
}

describe("peak-day and most-starred repository separation", () => {
  it("generates independent peak-day and most-starred insights", () => {
    const insights = generateStoryInsights(divergentRepositoryAnalytics());
    const peak = insights.find((insight) => insight.kind === "peak-repository");
    const starred = insights.find((insight) => insight.kind === "most-starred-repository");

    expect(peak?.payload).toMatchObject({
      kind: "peak-repository",
      repositoryPath: "isthatpratham/DeadDrop",
      name: "DeadDrop",
      ownerName: "isthatpratham",
      starCount: 3,
    });
    expect(starred?.payload).toMatchObject({
      kind: "most-starred-repository",
      name: "pratham-folio",
      ownerName: "isthatpratham",
      starCount: 22,
    });
    expect(JSON.stringify(peak?.payload)).not.toContain("pratham-folio");
    expect(JSON.stringify(starred?.payload)).not.toContain("DeadDrop");
  });

  it("keeps Peak Day slide metadata on DeadDrop and Most Starred on pratham-folio", () => {
    const story = composeStory(divergentRepositoryAnalytics());
    const peakSlide = story.slides.find((slide) => slide.insightId === "peak-repository");
    const starredSlide = story.slides.find((slide) => slide.insightId === "most-starred-repository");

    expect(peakSlide).toBeDefined();
    expect(starredSlide).toBeDefined();

    expect(peakSlide?.headline).toContain("isthatpratham/DeadDrop");
    expect(peakSlide?.headline.toLowerCase()).not.toContain("owned");
    expect(JSON.stringify(peakSlide)).not.toContain("pratham-folio");
    expect(peakSlide?.metadata).not.toHaveProperty("favoriteRepository");
    expect(peakSlide?.metadata).not.toHaveProperty("mostStarredRepository");

    const peakCard = selectRepositoryCard(peakSlide?.metadata ?? {});
    expect(peakCard).toMatchObject({
      name: "DeadDrop",
      ownerName: "isthatpratham",
      starCount: 3,
    });

    expect(starredSlide?.headline).toContain("isthatpratham/pratham-folio");
    expect(starredSlide?.headline.toLowerCase()).not.toContain("peak day");
    expect(JSON.stringify(starredSlide)).not.toContain("DeadDrop");
    expect(starredSlide?.metadata).not.toHaveProperty("peakDayRepository");
    expect(starredSlide?.metadata).not.toHaveProperty("favoriteRepository");

    const starredCard = selectRepositoryCard(starredSlide?.metadata ?? {});
    expect(starredCard).toMatchObject({
      name: "pratham-folio",
      ownerName: "isthatpratham",
      starCount: 22,
    });
  });

  it("still works when the same repository is both peak-day and most-starred", () => {
    const analytics = richAnalytics();
    const story = composeStory({
      ...analytics,
      repositories: {
        ...analytics.repositories,
        mostActiveRepository: { name: "hello-world", commitCount: 20 },
      },
    });
    const peakSlide = story.slides.find((slide) => slide.insightId === "peak-repository");
    const starredSlide = story.slides.find((slide) => slide.insightId === "most-starred-repository");

    expect(peakSlide).toBeDefined();
    expect(starredSlide).toBeDefined();

    const peakCard = selectRepositoryCard(peakSlide?.metadata ?? {});
    const starredCard = selectRepositoryCard(starredSlide?.metadata ?? {});
    expect(peakCard?.name).toBe("hello-world");
    expect(starredCard?.name).toBe("hello-world");
    expect(peakSlide?.metadata).toHaveProperty("peakDayRepository");
    expect(starredSlide?.metadata).toHaveProperty("mostStarredRepository");
    expect(peakSlide?.metadata).not.toHaveProperty("mostStarredRepository");
    expect(starredSlide?.metadata).not.toHaveProperty("peakDayRepository");
  });

  it("does not claim repository ownership on the Peak Day slide", () => {
    const copy = copyForInsight(peakCopyInsight(), "isthatpratham");
    expect(copy.headline.toLowerCase()).not.toContain("owned");
    expect(copy.headline).toContain("saw the most activity on your biggest day");
  });
});
