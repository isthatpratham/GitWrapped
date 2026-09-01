# GitWrapped Architecture

Layers stay separate. The UI never talks to GitHub and never computes analytics.

```
Landing / Story Player
        ↓
app/actions/wrapped.ts   (server action)
        ↓
sdk/github               fetch, Zod, domain mapping
        ↓
services/analytics       insights + availability
        ↓
services/story           Story Intelligence → Story
        ↓
components/player        presentation only
```

Related: [GITHUB_SDK.md](./GITHUB_SDK.md), [DATA_CONTRACTS.md](./DATA_CONTRACTS.md), [ANALYTICS.md](./ANALYTICS.md), [STORY_INTELLIGENCE.md](./STORY_INTELLIGENCE.md), [STORY_PLAYER.md](./STORY_PLAYER.md).

---

## Layers

### GitHub SDK (`sdk/github/`)

GraphQL client, env, errors, queries, Zod schemas, mappers, services.

- Authenticates with server-only `GITHUB_TOKEN`
- Returns `GitHubAnnualData` plus per-source fetch status
- No story copy, no ranking

### Analytics Engine (`services/analytics/`)

Pure functions over domain models.

- Streaks, languages, repos, activity, external contributions, timeline
- Attaches `availability` so later layers know what is measured vs missing
- No GitHub calls, no React

### Story Intelligence (`services/story/`)

`generate → rank → redundancy → select → compose`.

- Input: `AnalyticsResult`
- Output: `Story` (slides, chapters, rhythm, sharing metadata)
- Copy comes from templates fed by insight payloads

The original `STORY_REGISTRY` still exists in the repo. `compileStoryDeck` uses `composeStory`, not the registry.

### Presentation

- `app/page.tsx` — landing
- `app/(wrapped)/wrapped/[id]/page.tsx` — load, errors, loading, player
- `components/player/` — Story Player
- `lib/player/` — navigation, progress, share, motion, error copy
- `components/ui/` — primitives (`StoryFrame`, buttons, typography, …)

---

## Folder map (what is actually used)

| Path | Role |
| --- | --- |
| `app/` | Routes, layout, SEO/manifest, server action |
| `components/` | UI, motion wrappers, Story Player |
| `sdk/github/` | GitHub integration |
| `services/analytics/` | Insights |
| `services/story/` | Story Intelligence and copy |
| `lib/player/` | Player contracts |
| `lib/time/` | UTC helpers |
| `domain/models/` | Canonical types (availability, user, repo, …) |
| `tokens/` | Spacing, radius, z-index, duration (TypeScript) |
| `config/site.ts` | Public site URL and SEO strings |
| `constants/` | Routes, extra motion variants |
| `docs/` | Product and system docs |

Placeholder folders (`features/`, `hooks/`, `providers/` gitkeeps, `app/(auth)/`, `app/(dashboard)/`) are not part of the live recap path.

---

## Request flow

1. User submits a login on `/`.
2. Client navigates to `/wrapped/<login>`.
3. `getWrappedStoryDeck` runs on the server.
4. SDK fetches and validates.
5. Mappers produce domain models.
6. `generateRecapAnalytics` → `generateStoryDeck`.
7. Action returns `{ ok: true, story }` or `{ ok: false, code }`.
8. Player unwraps and renders. Errors map to `lib/player/errors.ts`.

This shape exists so Next.js production does not strip thrown error messages.

---

## Error handling

Each layer uses typed errors. The UI only sees recap codes (`INVALID_USERNAME`, `USER_NOT_FOUND`, `RATE_LIMIT`, `AUTH_FAILED`, `MALFORMED_RESPONSE`, `FETCH_FAILED`).

Never log or display the PAT, request `Authorization` headers, or raw GraphQL error dumps in the player.

---

## Environment

| Variable | Layer |
| --- | --- |
| `GITHUB_TOKEN` | SDK, server only |
| `NEXT_PUBLIC_GITHUB_GRAPHQL` | Optional GraphQL URL |
| `NEXT_PUBLIC_APP_URL` | Canonical site URL / OG |

There is no client-side GitHub token.

---

## External APIs

GitHub GraphQL is the data source. REST is named in SDK config and unused by the live client.

No second provider is wired. Adding LeetCode or WakaTime would be a new SDK + analytics input, not a Story Player change.

---

## Tests

Colocated `*.test.ts` (Vitest). Coverage that should stay: availability, peak-day attribution, analytics calculators, insight generate/rank/redundancy, player navigation/progress/close/share/loading.
