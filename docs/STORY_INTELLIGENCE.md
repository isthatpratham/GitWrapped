# Story Intelligence

Stories are selected, not hardcoded. The same analytics snapshot always produces the same deck.

Live path: `generateStoryDeck()` → `compileStoryDeck()` → `composeStory()`.

```
analytics
  → generateStoryInsights
  → rankStoryInsights          (available insights only)
  → collapseRedundantInsights
  → selectStoryInsights
  → composeStory               (Welcome + selected + Closing)
```

`services/story/story.registry.ts` is leftover from the original fixed-order engine. The player does not use it.

Related: [DATA_CONTRACTS.md](./DATA_CONTRACTS.md), [ANALYTICS.md](./ANALYTICS.md), [STORYBOARD.md](./STORYBOARD.md).

---

## Chapters

Order is fixed. Empty chapters are omitted from the player.

| Id | Title |
| --- | --- |
| `OPENING` | Opening |
| `YOUR_YEAR` | Your Year |
| `YOUR_RHYTHM` | Your Rhythm |
| `YOUR_BUILD` | Your Build |
| `MILESTONES` | Milestones |
| `REFLECTION` | Reflection |
| `FINALE` | Finale |

Welcome is always Opening. Closing is always Finale. Body slides get a chapter from the insight.

---

## Candidate insights

Generated only when availability and thresholds pass. Weak or missing evidence produces no slide.

| Kind | Typical chapter | Needs |
| --- | --- | --- |
| `contribution-total` | Your Year | Contribution calendar (including measured zero) |
| `peak-day` | Your Year | Peak calendar day with count > 0 |
| `peak-repository` | Your Build | Attributed peak-day path |
| `most-starred-repository` | Your Build | Favorite/most-starred repo |
| `longest-streak` | Your Rhythm | Streak ≥ 7 days |
| `night-activity` | Your Rhythm | Coding hours available, night share ≥ 30% |
| `weekend-activity` | Your Rhythm | Weekend share ≥ 40% of timed commits |
| `language-dominance` | Your Build | Favorite language share ≥ 40% |
| `language-evolution` | Your Build | Detectable shift to a new primary language |
| `repository-concentration` | Your Build | One repo ≥ 40% of recorded commits |
| `monthly-growth` | Your Year | Q4 / Q1 momentum ≥ 1.2 |
| `comeback` | Your Rhythm | ≥ 14 quiet days then a rebound week ≥ 15 |
| `final-push` | Your Year | Last 21 UTC days: ≥ 12 contributions, ≥ 18% of year, ≥ 1.75× earlier daily average, rest of year ≥ 20 |
| `contribution-milestone` | Milestones | Calendar crosses 100 / 500 / 1000 / 2000 / 5000 |
| `first-repository` | Your Build | Earliest repo created in the recap year |
| `open-source` | Your Build | External repos: ≥ 5 commits or ≥ 2 PRs |
| `commit-personality` | Your Rhythm | ≥ 12 counted commit headlines; a feat/fix/refactor/final/keyword pattern |
| `activity-spike` | Your Year | A day ≥ 4× average active day and ≥ 8 contributions |
| `developer-rhythm` | Your Rhythm | A rhythm classification with strength ≥ 40 |
| `achievements` | Milestones | Story achievements (max 4), after family overlap filter |
| `organizations` | Your Build | Public org memberships available |

Threshold constants: `services/story/intelligence/constants.ts`.

Copy: `services/story/copy/templates.ts`. Copy may only restate payload + evidence.

---

## Ranking

Unavailable insights are dropped.

Score (higher wins):

```
(strength × 45 + uniqueness × 15 + narrativeValue × 15 + surprise × 10
 + shareableBonus × 10 + availabilityBonus × 5) / 100
```

Measured availability adds 100 before that weight; estimated adds 70. Shareable insights add 100. Ties: kind, then id.

---

## Redundancy

One insight per **family** (year, streak, peak-day, coding-time, language, repository, …).

Rhythm slides are skipped if they would repeat a family already kept (Night Builder vs coding-time, Specialist vs language, and so on).

Achievement items that overlap a kept family are stripped. If none remain, the achievements slide is dropped.

Body insights with strength < 28 are dropped (`contribution-total` is exempt).

---

## Selection and length

- Always keep Opening insights and `contribution-total`
- Fill remaining body slots with chapter diversity (avoid stacking the same chapter back-to-back when alternatives exist)
- Hard cap: **15** slides including Welcome and Closing (`STORY_INTELLIGENCE.maxSlides` / `STORY_CONFIG.maxSlidesCount`)
- Low-data years can be 3 slides (Welcome, overview, Closing). The engine does not pad

Compose always prepends Welcome and appends Closing.

---

## Developer rhythm

`classifyDeveloperRhythm` picks at most one: Night Builder, Comeback Builder, Sprint Builder, Consistent Builder, Specialist, Explorer, Open Source Builder.

Zero-contribution years get no rhythm. Weak signals (< 40) are ignored. Equal strength uses a fixed tie order.

---

## Story achievements vs analytics achievements

The recap slide uses `deriveStoryAchievements` (Night Builder, Streak Keeper, Shipper, Polyglot, Explorer, One-Project Army, Open Source Builder, Comeback).

`calculateAchievements` still runs for the analytics snapshot (Night Owl, Weekend Warrior, …). That list is not what the intelligence slide shows.

---

## Determinism

No clocks in selection except `analytics.computedAt` stored on metadata. No randomness. Identical `AnalyticsResult` → identical `Story`.
