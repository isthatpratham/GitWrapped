# GitWrapped Design System

GitWrapped should feel calm, editorial, and handcrafted. It should not look like a dashboard or a generic SaaS landing page.

Source of truth in code: `app/globals.css` (`@theme`) and `tokens/index.ts`. If this file and the tokens disagree, the tokens win — update this file.

---

## Theme

Dark mode only. There is no light theme.

Landing and player use a full viewport (`Viewport`) on `background`.

---

## Typography

**Montserrat** everywhere in the product UI.

Monospace is allowed for repository paths and other code-like strings (`font-mono` in `@theme`).

Do not add a second display font.

Scale (from `tokens/index.ts`): xs 12 → sm 14 → base 16 → lg 18 → xl 20 → h3 24 → h2 30 → h1 36 → hero 60 → display 72.

---

## Color (as shipped)

From `app/globals.css`:

| Token | Value |
| --- | --- |
| Background | `#05070b` |
| Foreground | `#ffffff` |
| Surface | `#0d1117` |
| Surface elevated | `#161b22` |
| Primary | `#8b5cf6` |
| Secondary | `#06b6d4` |
| Accent | `#f43f5e` |
| Muted | `#6b7280` |
| Muted foreground | `#9ca3af` |
| Success | `#22c55e` |
| Warning | `#f59e0b` |
| Danger | `#ef4444` |
| Border | `rgba(255,255,255,0.08)` |
| Divider | `rgba(255,255,255,0.12)` |

Primary accent in the running app is violet (`#8b5cf6`), not blue. Story pills and emphasis follow that plus white/gray type.

---

## Radius and space

Radius: xs 2, sm 4, md 6, lg 8, xl 12, full pill.

Spacing is a 4px scale (`tokens.spacing` / `--spacing-*`).

Z-index: base 0, raised 10, overlay 100, modal 500, tooltip 1000. Player close uses overlay so tap zones (raised) cannot steal clicks.

---

## Visual principles

- Large type, generous empty space
- One message per screen
- Cards only when they group a real object (repository, share card)
- Lucide icons via `components/icons` (plus the GitHub mark)
- No bento grids, neon blobs, extra typefaces, or dashboard chrome

Inspirations (taste, not a clone): Linear, Vercel, Apple product pages.

---

## Components

Live primitives live under `components/ui/` and `components/layout/`. Story-specific chrome: `StoryFrame`, `StoryProgress`, `StoryHeader`, `StoryNavigation`, `StoryFooter`, `StoryBackground`.

Each component should do one job. Business logic stays out of JSX (`lib/player/`, services).

---

## Charts

There is no general charting library in the recap. Slide graphics are custom (`components/player/slide-graphics.tsx`). If you add a chart, keep strokes thin, animate once, no legend wall.

---

## Accessibility

Required for player chrome: semantic buttons, keyboard, visible focus, accessible names, progress/chapter text for screen readers. Contrast should stay WCAG-reasonable on `#05070b`.

Honor `prefers-reduced-motion` (see [MOTION_SYSTEM.md](./MOTION_SYSTEM.md)).

---

## Final rule

If removing an element makes the interface stronger, remove it.
