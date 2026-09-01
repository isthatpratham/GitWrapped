# GitHub SDK

Server-side GitHub GraphQL client. The browser never talks to GitHub.

Import from `@/sdk/github`. Do not import `sdk/github/config.ts` from client components — it holds the PAT.

Related: [DATA_CONTRACTS.md](./DATA_CONTRACTS.md), [ARCHITECTURE.md](./ARCHITECTURE.md).

---

## What it does

`fetchAnnualData({ username, year })` is the public entry point (`sdk/github/services/annual-data.service.ts`).

1. Validate the username (`parseGitHubUsername`).
2. Fetch the user profile (fails fast if the user does not exist).
3. In parallel: contribution calendar, public repositories, pull requests.
4. In parallel: issues, organizations.
5. Fetch default-branch commits for attribution paths (contribution repos plus PR/issue targets).
6. Attribute the peak calendar day to a repository from commits, PRs opened, and issues opened on that UTC date.
7. Return `GitHubAnnualData` plus per-source status.

`fetchCurrentYearData(username)` is the same call for `getRecapYear()` (current UTC calendar year).

---

## Username rules

GitHub login: 1–39 characters, alphanumeric or single hyphens, cannot start or end with a hyphen.

Invalid names throw `GitHubInvalidUsernameError` before any network call.

---

## What is fetched

| Source | Used for |
| --- | --- |
| User profile | Handle, name, avatar, account dates, follower counts |
| Contribution calendar | Year totals, streaks, peak day date/count, per-repo commit activity |
| Repositories | Stars, languages, creation dates, favorite/most-starred, first-in-year |
| Pull requests | External/open-source signal, peak-day events, PR stats |
| Issues | Peak-day events, issue stats, external signal |
| Organizations | Public memberships |
| Commits | Timestamps (hour/weekend), messages (patterns only), peak-day events |

Optional sources that fail (except missing user, auth, and rate limit) become `{ status: "unavailable", reason: "fetch_failed" }` with an empty list. Auth and rate-limit errors still throw.

`achievementSignals` on the annual payload is a stub (followers/repos from the user; other counts are `0`). Story achievements are derived later from analytics, not from this stub.

---

## Commits

`fetchUserCommitsForRepositories` (`sdk/github/services/commits.service.ts`):

- Up to **25** repository paths
- First **5** get up to **2** history pages (timestamps)
- Remaining get **1** page (attribution)
- Default branch only
- Author is the GitHub user node id
- Year window is UTC `from` / `to`

That is a cap, not a full git history. Partial history is recorded as `partial` / `insufficient_data`.

Paths come from contribution `repositoryActivity`, PR `baseRepository.nameWithOwner`, and issue repos.

---

## Peak day attribution

Implemented in `sdk/github/peak-day.ts`.

- Date + count: `selectPeakContributionDay` on the calendar
- Repository: `attributePeakDayRepository` on events from `peakDayEventsFromSources({ commits, pullRequests, issues })`

See [DATA_CONTRACTS.md](./DATA_CONTRACTS.md).

---

## Validation and GraphQL

- Native `fetch()` only (`sdk/github/client.ts`). Timeout 15s. Page size cap 100.
- Bearer token from `GITHUB_TOKEN`. Header `X-GitHub-Api-Version: 2022-11-28`.
- Responses go through Zod schemas. Shape mismatch throws `GitHubResponseValidationError`.
- GitHub often returns `data` plus field-level errors (`user: null` + `NOT_FOUND`). `resolveGraphQLPayload` prefers `data` so a missing user is `GitHubUserNotFoundError`, not a generic GraphQL failure.

`githubConfig.restEndpoint` exists in config. The live client does **not** call the REST API.

`sdk/github/services/mock-data.ts` is an isolated mock generator. Production fetch does not import it.

---

## Errors

All extend `GitHubSDKError`. The wrapped server action maps them to codes the client can show without leaking internals (`app/actions/wrapped.ts`):

| SDK condition | Recap code |
| --- | --- |
| Invalid username | `INVALID_USERNAME` |
| User not found | `USER_NOT_FOUND` |
| Rate limit / 403 forbidden | `RATE_LIMIT` |
| 401 | `AUTH_FAILED` |
| Zod mismatch | `MALFORMED_RESPONSE` |
| Other SDK failure | `FETCH_FAILED` |

The action returns `{ ok: true, story }` or `{ ok: false, code }`. It does not throw those codes, because Next.js production strips thrown error messages.

---

## Environment

| Variable | Where | Notes |
| --- | --- | --- |
| `GITHUB_TOKEN` | Server only | `ghp_` or `github_pat_`. Never `NEXT_PUBLIC_`. |
| `NEXT_PUBLIC_GITHUB_GRAPHQL` | Optional | Defaults to `https://api.github.com/graphql` |
| `NEXT_PUBLIC_APP_URL` | Public site URL | `config/site.ts`, not the SDK |

Required scopes for the current public-only recap: `read:user` and public-repo read access.

In production, invalid GitHub env throws at module load. In development, the SDK logs and uses empty-token fallbacks so `next dev` can start.
