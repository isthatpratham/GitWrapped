export interface SlideRepositoryCard {
  readonly name: string;
  readonly ownerName: string;
  readonly starCount: number | null;
  readonly url: string | null;
}

function preview(value: unknown): SlideRepositoryCard | null {
  if (!value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string" || record.name.length === 0) return null;
  return {
    name: record.name,
    ownerName: typeof record.ownerName === "string" ? record.ownerName : "",
    starCount: typeof record.starCount === "number" ? record.starCount : null,
    url: typeof record.url === "string" ? record.url : null,
  };
}

/**
 * Pick at most one repository card from exclusive metadata keys.
 * Peak-day and most-starred must never be merged into a single card.
 */
export function selectRepositoryCard(metadata: Record<string, unknown>): SlideRepositoryCard | null {
  if ("peakDayRepository" in metadata) {
    return preview(metadata.peakDayRepository);
  }
  if ("mostStarredRepository" in metadata) {
    return preview(metadata.mostStarredRepository);
  }
  if ("firstRepository" in metadata) {
    return preview(metadata.firstRepository);
  }
  if ("mostActiveRepository" in metadata) {
    return preview(metadata.mostActiveRepository);
  }
  return null;
}
