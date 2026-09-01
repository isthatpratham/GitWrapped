# GitWrapped Storyboard

GitWrapped is not a dashboard. It is a story.

This file is **voice and structure**, not a fixed 14-slide script. Which slides appear is decided by Story Intelligence from real evidence. See [STORY_INTELLIGENCE.md](./STORY_INTELLIGENCE.md).

---

## Philosophy

Every slide should reveal one meaningful thing, make the next one worth waiting for, and stay honest about what GitHub actually provided.

The interface should never compete with the story.

---

## Experience rules

- One hero idea per slide
- Numbers support the line; they are not the slide
- Do not pad a thin year with weak slides
- Measured zero is allowed; missing data is not shown as zero
- Peak-day repository and most-starred repository are different stories
- Time insights say UTC when they depend on timestamps

---

## Emotional shape

Curiosity → recognition → surprise → pride → reflection → close.

Chapters in the player:

Opening → Your Year → Your Rhythm → Your Build → Milestones → Reflection → Finale

A given recap may skip chapters that have no slides.

---

## Always present

**Splash** (player index `-1`)  
GitWrapped. Anticipation. Then the first slide.

**Welcome**  
Headline: `Hey, {{name}}.`  
Subtext: rewind this year. Copy states that the recap is public GitHub activity we could measure.

**Closing**  
Headline: `That's your {{year}} in public GitHub activity.`  
Then share / “Run It Back”.

---

## Candidate moments (not a guaranteed sequence)

These titles match `services/story/copy/templates.ts`. Any of them can be absent.

| Slide title | What it is about |
| --- | --- |
| The Big Picture | Year contribution total (including a measured 0) |
| Peak Mode | Biggest contribution-calendar day |
| Peak Day Repository | Repo with the most attributed commits/PRs/issues on that UTC day |
| Most Starred | Highest star count among the user’s public repos |
| Consistency | Longest streak |
| Night Owl | Late UTC commit timestamps |
| Weekend Rhythm | Weekend share of timed commits |
| Your Language | Dominant GitHub language bytes |
| Language Shift | Primary language change vs earlier repos |
| Main Character Project | Repo concentration of recorded commits |
| Momentum | Later months vs the start of the year |
| The Comeback | Quiet stretch then a rebound week |
| The Final Push | Last 21 days of the UTC year |
| Milestone | Crossing 100 / 500 / 1000 / … contributions |
| First Repository | Earliest repo created this year |
| Open Source | Activity on repos the user does not own |
| Commit Voice | Word patterns in commit headlines (not full messages) |
| Activity Spike | One day far above a typical active day |
| Your Rhythm | One classified rhythm (Night Builder, Specialist, …) |
| Milestones | Up to four evidence-backed story achievements |
| Collaborations | Public organization memberships |

Do not add a heatmap slide, a “by the numbers” dump, or a fake global rank. Those are not in the intelligence pipeline.

---

## Tone

Sound: calm, specific, a little proud. Not corporate, not cringe, not fake-hype.

Prefer: built, shipped, streak, peak, rhythm, wrapped.

Avoid in **copy**: dashboard, analytics, generate, processing, AI, submit.

The loading screen is allowed to say “finding” / “looking back” because the player is waiting on a server action. Do not put “Analyzing your data…” on a story slide.

---

## Words on buttons (actual UI)

| Instead of | Use |
| --- | --- |
| Generate Wrapped | Begin Your Story |
| View dashboard | (there isn’t one) |
| Replay | Run It Back |
| Share | Share Your Story / Share |

Do not invent slogans that are not in the templates.

---

## Final rule

If a slide would need a chart legend to make sense, it is the wrong slide.

If the year does not support a moment, skip it. That is the product working.
