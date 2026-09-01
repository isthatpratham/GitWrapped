# Story Player

The client renders a finished `Story`. It does not fetch GitHub or compute analytics.

UI: `components/player/StoryPlayer.tsx`, `StoryLoading.tsx`, `slide-graphics.tsx`.  
Logic: `lib/player/`.

Route: `/wrapped/[id]` → server action `getWrappedStoryDeck` → `{ ok, story | code }` → unwrap → load → play.

Related: [STORY_INTELLIGENCE.md](./STORY_INTELLIGENCE.md), [MOTION_SYSTEM.md](./MOTION_SYSTEM.md).

---

## Phases

Index is an integer over splash, slides, and share (`lib/player/navigation.ts`).

| Index | Phase |
| --- | --- |
| `-1` | Splash (“your year in code”) |
| `0 … n-1` | Story slides |
| `n` | Share screen |

Replay resets to `-1`. Close goes to `/` (`storyPlayerClosePath` → `ROUTES.LANDING`).

---

## Loading

`StoryLoading` cycles copy every 1.4s:

1. We're finding your year.
2. Looking back...
3. Finding the moments that mattered.

When the deck is ready: “Your story is ready.” The player waits **400ms** on that line before entering (`shouldEnterStory`).

Errors never show GitHub payloads. Codes map to copy in `lib/player/errors.ts`:

| Code | Retry? |
| --- | --- |
| `INVALID_USERNAME` | No |
| `USER_NOT_FOUND` | No |
| `RATE_LIMIT` | Yes |
| `AUTH_FAILED` | Yes |
| `MALFORMED_RESPONSE` | Yes |
| `FETCH_FAILED` | Yes |

Non-retryable errors send the user home. Retryable errors re-run the server action.

---

## Autoplay

Default duration **6000ms** per slide (`STORY_CONFIG.defaultDurationMs` and `SLIDE_DURATION` in the player). Pause/play is a header control. Navigation lock is **500ms** (`NAV_LOCK_MS`) so one gesture cannot skip two slides.

Reduced motion: `useReducedMotion()` → `slideMotion(true)` uses opacity-only fades at **150ms**. Full motion is 12px translate at **500ms**.

---

## Progress

Each slide is one equal-width segment, grouped by chapter. Fill is 100% for past slides, current slide’s percent, 0% for later slides.

Overall percent: splash is 0; share is 100; during slides, `((index + p/100) / count) * 100`.

Accessible labels: `Slide N of C` and `Chapter title, part X of Y`. Header subtitle is the chapter title (`CHAPTER_TITLES`).

Close sits above tap zones (`z-overlay` vs `z-raised`) so the × is clickable.

---

## Navigation

| Input | Action |
| --- | --- |
| Right arrow, Space, Enter | Next (unless focus is on a button/link/input) |
| Left arrow | Previous |
| Escape | Close |
| Wheel ΔY ≥ 48 | Next / previous |
| Horizontal swipe ≥ 56px (and larger than vertical) | Next / previous |
| Side tap zones | Next / previous |

Space/Enter on focused close, pause, or share is left to the button. Escape always closes.

---

## Share

`buildShareRequest` uses the page origin and `/wrapped/<handle>`. Native `navigator.share` when present; otherwise clipboard copy. Downloadable SVG card from `buildShareCardSvg`.

Share stats come from Overview (or Summary) metadata: contribution total, top language, longest streak. A shareable moment can override headline/hero.

The `Story.sharing.shareUrl` field still contains a `gitwrapped.dev/recap/...` string. The **player** does not use that field for the link it copies; it uses `recapShareUrl(origin, handle, …)`.

Share screen CTAs: “Share Your Story”, “Run It Back”. On-slide footer: “Share”.

---

## Repository cards

`selectRepositoryCard` reads at most one exclusive metadata key. Peak-day and most-starred never share a card. Stars on a peak-day card belong to that repository only; they may be `null` if the repo is not in the user’s fetched list.

Unavailable insight slides are not composed into the deck. `isUnavailableMoment` exists as a guard if availability is not `available`.

---

## Accessibility (what the player actually does)

- Semantic buttons for close, pause, share, replay
- Keyboard path as above
- `aria` progress / chapter labels
- Visible focus on controls
- `prefers-reduced-motion` honored for slide transitions

Landing and player are dark-only, full viewport, Montserrat.
