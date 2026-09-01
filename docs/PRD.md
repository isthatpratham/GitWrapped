# GitWrapped — Product Requirements

GitWrapped turns public GitHub activity into a year-end story. It is a recap, not a dashboard: one slide at a time, evidence-backed, shareable.

This document describes the product as implemented on `main` (v1.0). Older intent that never shipped is listed as out of scope, not as current features.

---

## Vision

Every developer has a story. GitWrapped helps tell it.

If a feature does not improve the story, it does not belong here.

---

## What exists today

- Public username on the landing page. No account.
- Server-side pipeline: GitHub GraphQL → validated data → analytics → Story Intelligence → Story Player.
- Recap year is the **current UTC calendar year**.
- Dynamic deck: Welcome, ranked body slides, Closing. Length follows evidence (cap 15).
- Full-screen player: chapters, autoplay, keyboard, wheel, swipe, replay, share link, SVG card.
- Unavailable data stays unavailable. Zero contributions is a valid measured year.

Try `/wrapped/<github-login>` after `npm run dev`.

---

## User journey

Landing (`/`)

↓

Enter a GitHub username (“Begin Your Story”)

↓

`/wrapped/<username>` loading copy

↓

Server action `getWrappedStoryDeck`

↓

Story Player (splash → slides → share)

↓

Share, download card, or “Run It Back”

Close returns to `/`.

---

## Functional requirements (current)

The application must:

- Accept a public GitHub username and reject invalid logins before calling GitHub.
- Fetch public activity for the recap year.
- Compute insights with explicit availability.
- Compose a story from available insights only.
- Play the story full-screen with progress, pause, close, replay, and share.
- Surface recap errors as stable codes (`USER_NOT_FOUND`, `RATE_LIMIT`, …), not raw API errors.

---

## Non-functional

- Dark mode only
- Montserrat only (monospace allowed for code-like strings)
- TypeScript, Zod on GitHub responses
- UTC for all time analytics
- Keyboard and touch navigation
- `prefers-reduced-motion` on slide transitions
- Token stays server-side (`GITHUB_TOKEN`)

---

## Out of scope

Not built, even if routes or constants mention them:

- User accounts, OAuth, database, payments
- Private repositories
- Multi-year comparison picker
- Teams / comparisons between users
- AI-generated insights
- LeetCode, WakaTime, Codeforces, Dev.to
- PDF or video export
- Demo preview, marketing feature grid, or footer on the landing page (the landing is username + headline only)

`ROUTES.LOGIN`, `CALLBACK`, `DASHBOARD` and `/api/wrapped` are placeholders, not product surfaces.

---

## Success (how we judge this version)

- The recap matches public GitHub data we actually fetched.
- Two developers with different years get different slides when the evidence differs.
- Peak-day repository and most-starred repository stay independent.
- Missing timestamps do not become a fake “most active hour.”
- Share works via native share or clipboard; the URL is `/wrapped/<handle>`.

---

## Future (not in this release)

- GitHub OAuth and private recaps
- Multi-year comparisons
- Other developer platforms
- Animated video export

See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the current system is layered.
