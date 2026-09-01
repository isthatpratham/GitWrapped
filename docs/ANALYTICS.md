# Analytics

The Analytics Engine turns normalized domain models into an `AnalyticsResult`. It computes evidence and availability. It does not write slide copy.

Entry: `generateRecapAnalytics()` → `computeAnnualAnalytics()` in `services/analytics/`.

Related: [DATA_CONTRACTS.md](./DATA_CONTRACTS.md), [STORY_INTELLIGENCE.md](./STORY_INTELLIGENCE.md).

---

## Input

`AnalyticsEngineInput`: user, contributions, repositories, pull requests, issues, organizations, commits, recap year, and `sources` fetch status for PRs, issues, organizations, commits, and repositories.

Mappers in `sdk/github/mapper/` produce domain models before this layer runs.

---

## Calculators

| Calculator | What it measures |
| --- | --- |
| Productivity | Peak calendar day, productive week/month, averages, quietest month, momentum (Q4 vs Q1) |
| Consistency | Longest/current streak, active days, weekly/monthly consistency. `activeDaysRatio` is `activeDaysCount / 150`, not a weekly ratio |
| Activity | Commit/PR/issue counts, UTC time analysis, commit-message **profile** (counts of feat/fix/refactor/docs/chore/update/final and a top keyword). Raw messages are not stored on the snapshot for story use |
| Languages | Favorite language by GitHub language bytes, distribution, evolution from repo creation years, new vs dormant |
| Repositories | Most-starred (`favoriteRepository`), peak-day repo, most active by commits, oldest/newest, first created in the recap year |
| Organizations | Public membership list and a most-active org by repo count on the membership payload |
| External | Activity on repos the user does not own |
| Timeline | Daily/weekly/monthly/quarterly contribution points |
| Achievements (analytics) | Config-driven badges (Night Owl, Weekend Warrior, …) on the analytics snapshot |
| Summary | Share stats and highlight strings for metadata |

Overview scores (activity, consistency, repository, language diversity, growth, productivity) are normalized 0–100 (activity max 1000 before clamp). They are internal scores, not user-facing ranks.

---

## Time windows (UTC)

From `ANALYTICS_CONFIG`:

- Night: 22:00–04:59 UTC
- Early bird: 05:00–08:59 UTC
- Weekend: Sunday and Saturday (`0` and `6`)
- Consistency target: 150 active days for a full consistency score
- Minimum streak length considered significant in config: 3 days

`mostActiveHour`, night/early-bird scores, and weekend share are `null` without commit timestamps.

---

## Peak day repository

`contributions.peakDay` is filled by the SDK (calendar + attribution). Analytics copies date/count into productivity and looks up **that path’s** metadata for `repositories.peakDayRepository`.

If the path is not in the user’s repository list, star count and URL may be `null`. Analytics does not replace it with the most-starred repo.

`fastestGrowingRepository` currently has no star-growth time series from GitHub, so it stays `null`.

---

## External / open-source counts

`calculateExternalContributions`:

- External = repository owner handle ≠ user handle (case-insensitive)
- Counts PRs, issues, and commits on those paths
- Commit totals: `max(fetched commits on that path, GitHub repositoryActivity.commitCount)` so unfetched external repos are not silently zero
- Featured repo: highest unweighted PR + commit + issue score; tie-break lexicographic path

---

## First repository in year

`firstRepositoryCreatedInYear` is the earliest repository **created** during the recap year among fetched repos. It is not the oldest repo overall and not the first repo the user contributed to.

---

## Language evolution

Built from repository `createdAt` year plus language bytes. It is GitHub’s language metadata on public repos, not an exact line-count history.

---

## Availability

`deriveAnalyticsAvailability` attaches an `availability` object to every snapshot. Story generation reads that object. See [DATA_CONTRACTS.md](./DATA_CONTRACTS.md).

Collection counts that the UI might show use `resolvedCollectionCount`: prefer fetched/partial list length (including real zeros); fall back to contribution-calendar counts only when the list was not retrieved.

---

## What analytics will not do

- Invent commit timestamps
- Treat an unfetched empty array as “0 commits”
- Swap peak-day repo and most-starred repo
- Throw because the year had zero contributions
- Call GitHub
