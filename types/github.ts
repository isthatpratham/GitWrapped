// ---------------------------------------------------------------------------
// Compatibility exports for legacy types
// ---------------------------------------------------------------------------
// These types are kept for legacy compatibility but the canonical models
// have moved to `domain/models/`.
//
// New features should import directly from `@/domain/models`.
// ---------------------------------------------------------------------------

export type { UserProfile as GitHubUser } from "@/domain/models/user";
export type { ContributionDay } from "@/domain/models/contribution";
export type { LanguageUsage as LanguageStats } from "@/domain/models/language";
export type { Repository as RepositoryHighlight } from "@/domain/models/repository";
