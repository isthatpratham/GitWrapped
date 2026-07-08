# GitWrapped Motion System

## Philosophy

Motion is storytelling.

Animations exist to guide attention, reinforce hierarchy, and communicate transitions.

Motion should never exist purely for decoration.

Every animation should feel intentional, premium, calm, and effortless.

If an animation attracts more attention than the content itself, it should be redesigned.

---

# Motion Principles

Every animation should satisfy at least one purpose.

* Direct attention
* Explain change
* Indicate hierarchy
* Reinforce continuity
* Reward interaction

Never animate simply because something appeared.

---

# Motion Personality

GitWrapped should feel:

* Calm
* Cinematic
* Editorial
* Elegant
* Smooth
* Confident

Never:

* Playful
* Bouncy
* Hyperactive
* Cartoon-like
* Gamified

---

# Animation Duration

Instant

100ms

Fast

200ms

Standard

300ms

Slow

500ms

Cinematic

700ms

Maximum

900ms

No animation should exceed 1000ms unless explicitly required for storytelling.

---

# Easing

Default

easeOut

Entrance

easeOut

Exit

easeIn

Shared Layout

easeInOut

Avoid exaggerated easing curves.

Motion should feel natural.

---

# Spring Presets

Small Elements

Stiff

Medium damping

Cards

Medium stiffness

High damping

Full Screen Transitions

Low stiffness

High damping

Interactive Elements

Responsive

Never elastic.

---

# Allowed Animations

* Fade
* Fade Up
* Fade Down
* Opacity
* Scale
* Blur In
* Blur Out
* Slide
* Cross Fade
* Shared Layout
* Number Counting
* Progress Fill
* Chart Drawing

---

# Forbidden Animations

* Bounce
* Spin
* Flip
* Shake
* Rubber Band
* Flash
* Confetti
* Infinite Floating
* Random Rotation
* Overshoot

---

# Page Transitions

Every full-screen slide transition should:

Fade

*

Subtle upward movement

*

Small opacity interpolation

Duration:

500ms

---

# Story Slides

Each slide should have:

Entrance

Pause

Exit

The user should never feel rushed.

---

# Navigation

Keyboard

Arrow Keys

Space

Enter

Mouse Wheel

Touch

Swipe

Trackpad

Smooth snapping

---

# Hover Motion

Hover effects should be subtle.

Maximum scale

1.02

Maximum translation

2px

Never animate more than one property aggressively.

---

# Button Motion

Hover

Small lift

Tap

Small compression

Focus

Glow or outline

No bounce.

---

# Chart Animation

Charts should animate once.

Never loop.

Lines should draw progressively.

Bars should grow from baseline.

Pie charts should rotate minimally.

Numbers should count naturally.

---

# Progress Indicators

Progress bars should animate continuously.

Never jump.

Indicators should reinforce progression through the story.

---

# Number Animation

Large statistics should animate from zero only once.

Animation should finish before supporting text appears.

---

# Blur

Blur should communicate transition.

Never use blur as decoration.

Maximum blur

12px

---

# Background Motion

Backgrounds should remain mostly static.

If animated:

Very slow

Low opacity

No distracting particle systems

No infinite floating blobs

---

# Accessibility

Respect prefers-reduced-motion.

If reduced motion is enabled:

Disable transitions

Disable parallax

Disable scaling

Use simple fades

---

# Performance

Use transform and opacity whenever possible.

Avoid animating layout properties.

Avoid expensive filters.

Avoid unnecessary re-renders.

Prefer GPU-accelerated animations.

---

# Final Rule

Motion should feel invisible.

The user should remember the story, not the animation.
