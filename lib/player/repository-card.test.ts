import { describe, expect, it } from "vitest";
import { selectRepositoryCard } from "./repository-card";

describe("selectRepositoryCard", () => {
  it("uses peak-day metadata exclusively even if most-starred is also present", () => {
    const card = selectRepositoryCard({
      peakDayRepository: {
        name: "DeadDrop",
        ownerName: "isthatpratham",
        starCount: 3,
        url: "https://github.com/isthatpratham/DeadDrop",
      },
      mostStarredRepository: {
        name: "pratham-folio",
        ownerName: "isthatpratham",
        starCount: 22,
        url: "https://github.com/isthatpratham/pratham-folio",
      },
    });
    expect(card).toMatchObject({ name: "DeadDrop", starCount: 3 });
  });

  it("does not fall through to most-starred when peak-day is explicitly empty", () => {
    const card = selectRepositoryCard({
      peakDayRepository: null,
      mostStarredRepository: {
        name: "pratham-folio",
        ownerName: "isthatpratham",
        starCount: 22,
      },
    });
    expect(card).toBeNull();
  });

  it("renders most-starred only from its own key", () => {
    const card = selectRepositoryCard({
      mostStarredRepository: {
        name: "pratham-folio",
        ownerName: "isthatpratham",
        starCount: 22,
      },
    });
    expect(card).toMatchObject({ name: "pratham-folio", starCount: 22 });
  });

  it("ignores leftover favoriteRepository fields", () => {
    const card = selectRepositoryCard({
      peakDayRepository: {
        name: "DeadDrop",
        ownerName: "isthatpratham",
        starCount: 3,
      },
      favoriteRepository: {
        name: "pratham-folio",
        ownerName: "isthatpratham",
        starCount: 22,
      },
    });
    expect(card).toMatchObject({ name: "DeadDrop", starCount: 3 });
  });
});
