# Data Contracts

GitWrapped treats missing data as missing. A slide may only claim what analytics marked available.

This file is the contract between `sdk/github`, `services/analytics`, and `services/story`. The UI does not invent values to fill gaps.

Related: [GITHUB_SDK.md](./GITHUB_SDK.md), [ANALYTICS.md](./ANALYTICS.md), [STORY_INTELLIGENCE.md](./STORY_INTELLIGENCE.md).

---

## Availability

Canonical types live in `domain/models/availability.ts`.

| Status | Meaning |
| --- | --- |
| `available` + `measured` | Derived from GitHub fields that actually exist |
| `available` + `estimated` | Derived from a documented proxy (partial fetch, calendar fallback) |
| `unavailable` | Cannot be used for storytelling |
| `not_calculated` | Not computed; same effect as unavailable for story selection |

Confidence is categorical. There is no 0–1 confidence score.

Fetch provenance (`FetchStatus`) is separate from insight availability:

| Fetch status | Meaning |
| --- | --- |
| `fetched` | The list or collection was retrieved (including a real empty list) |
| `partial` | Some of the collection arrived |
| `unavailable` | Do not treat an empty array as a measured zero |

Empty arrays are only meaningful when the matching source is `fetched` or `partial`.

---

## Unavailability reasons

Stable strings. Story selectors and copy switch on these.

| Reason | Typical cause |
| --- | --- |
| `not_fetched` | Source was never requested |
| `fetch_failed` | Request failed after auth/rate-limit checks |
| `no_commit_timestamps` | No timed commits to derive hour-of-day |
| `empty_result` | Valid fetch, nothing to attribute (for example no peak day) |
| `no_language_bytes` | Repositories have no language bytes |
| `no_repository_attribution` | Peak calendar day has no matching commit/PR/issue on that UTC date |
| `insufficient_data` | Partial commit history; timestamps exist but are incomplete |

Unknown reason strings from the SDK become `fetch_failed` in `toFetchStatus()`.

---

## UTC

GitWrapped has no user timezone. All hour-of-day, weekday, and calendar-year work uses UTC (`lib/time/utc.ts`).

Rules:

- Contribution calendar days are `YYYY-MM-DD` strings. Compare them as strings. Do not parse with `new Date("YYYY-MM-DD")` and then read local `getHours()` / `getMonth()`.
- ISO timestamps become UTC calendar dates via `utcCalendarDate`.
- Recap year is the current UTC calendar year (`getRecapYear()` / `githubConfig.recapYear`).
- GitHub contribution weeks pad with adjacent-year days. Filter with `isCalendarDateInYear`.

Night window, weekend, and “most active hour” are UTC, and copy says so.

---

## Peak day vs most-starred

These are independent. Never substitute one for the other.

**Peak day (date + count)** comes from the contribution calendar: highest `contributionCount`. Tie-break: later `YYYY-MM-DD`.

**Peak day repository** is attributed separately from public events on that UTC date: fetched commits, pull requests opened, and issues opened. Tie-break: lexicographically smaller `owner/name`. If nothing fetched lands on that date, `repositoryPath` is `null` and availability is `no_repository_attribution`.

**Most-starred / favorite repository** is the user’s public repository with the highest star count. Star count is not commit volume and is not the peak-day repo.

The Story Player picks a repository card from exclusive metadata keys (`peakDayRepository`, `mostStarredRepository`, `firstRepository`, `mostActiveRepository`). It does not merge them.

---

## What “zero” means

| Situation | How to treat it |
| --- | --- |
| Contribution calendar total is `0` | Measured zero. Valid recap. Copy may say so. |
| Commits list empty and source `fetched` | Measured zero commits |
| Commits list empty and source `unavailable` | Not a zero. Unavailable. |
| External commit count missing because those repos were not fetched | Merge GitHub `repositoryActivity` totals; do not print “0 commits” as a fact |
| Coding hour with no timestamps | `mostActiveHour` is `null`; night/weekend scores are `null` |

Analytics does not throw on zero contributions.

---

## Analytics availability fields

`deriveAnalyticsAvailability()` in `services/analytics/availability.ts` produces:

- `contributions` — calendar is treated as measured
- `commitTimestamps` / `codingHours` — require timed commits
- `pullRequests`, `issues`, `organizations`, `repositories` — follow fetch status
- `languages` — needs language bytes
- `peakDayRepository` — needs a peak day **and** an attributed path

Story Intelligence drops insights whose availability is not `available`.

---

## Pipeline rule

```
GitHub fetch  →  Zod / domain  →  analytics + availability  →  story  →  player
```

| Layer | May | Must not |
| --- | --- | --- |
| `sdk/github/` | Fetch, validate, normalize, record source status | Invent insights or copy |
| `services/analytics/` | Compute evidence and availability | Fabricate timestamps or fill unavailable data with `0` |
| `services/story/` | Select and compose slides from available insights | Claim facts analytics did not produce |
| `components/`, `lib/player/` | Present the story | Call GitHub or run analytics |

Repository metadata on a slide must belong to that repository.
