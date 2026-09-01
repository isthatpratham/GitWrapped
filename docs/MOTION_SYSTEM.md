# GitWrapped Motion System

Motion should guide attention and mark a change of slide or chapter. It should not decorate empty space.

Player motion: `lib/player/motion.ts`. Shared landing variants: `constants/motion.ts`, `components/motion/`.

---

## Personality

Calm. Short. Editorial.

Not: bounce, spin, flip, shake, confetti, infinite float, elastic overshoot.

---

## Durations in code

| Token | ms | Where |
| --- | --- | --- |
| Fast | 200 | `tokens.duration.fast` |
| Standard | 300 | `tokens.duration.standard` |
| Slow / slide | 500 | Slide transition (`SLIDE_TRANSITION_MS`) |
| Cinematic | 700 | `tokens.duration.cinematic` |
| Reduced slide | 150 | `REDUCED_TRANSITION_MS` |
| Autoplay | 6000 | Each story slide |
| Nav lock | 500 | Ignore stacked gestures |
| Loading line | 1400 | `StoryLoading` copy cycle |
| Ready hold | 400 | After “Your story is ready.” |

Do not add animations longer than ~900ms unless a specific story beat needs it. Autoplay duration is a hold, not an animation length.

---

## Easing

Default product curve: `[0.16, 1, 0.3, 1]` (`constants/motion.ts` / `tokens.easing.easeOut`).

Landing uses that curve at 0.8s for the opening fade/blur. Player slide transitions use Framer Motion with the durations above.

---

## Allowed

- Fade, fade-up, opacity
- Small translate (player: 12px in, 8px out)
- Scale used sparingly (share card, landing)
- Blur on landing reveal only (`BlurReveal`)
- Number counting (`Counter`) once
- Progress fill that moves continuously, never jumps backward except on replay

## Forbidden

Bounce, spin, flip, flash, confetti, looping particle backgrounds, layout-thrashing animations.

---

## Story slides

Each slide: enter → hold (autoplay or pause) → exit.

Chapter changes can show a short chapter cue (`chapterChanged` in `lib/player/motion.ts`).

Full-screen transition (default): opacity + slight Y. Reduced motion: opacity only.

---

## Navigation motion

Keyboard, wheel, swipe, and side taps all go through the same index helpers. The 500ms lock is the anti-skip rule, not a visual spring.

Hover on buttons: small, not bouncy. Focus: ring/outline (`--color-focus` / `--color-ring`).

---

## Progress

Segments fill left to right. Past segments stay full. Do not animate the bar with bounce. Do not size segments by chapter weight — equal width per slide.

---

## Accessibility

`useReducedMotion()` in the Story Player.

When reduced motion is on:

- No Y/scale slide travel
- 150ms fades
- Still show loading copy changes (they are text, not motion)

Do not ship a recap that is unusable with motion off.

---

## Performance

Prefer `transform` and `opacity`. Avoid animating layout. Progress uses width/fill of existing segments rather than remounting the story.

---

## Final rule

The user should remember the year, not the tween.
