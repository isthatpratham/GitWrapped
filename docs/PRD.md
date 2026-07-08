# GitWrapped — Product Requirements Document (PRD)

## Product Overview

GitWrapped is a premium web application that transforms a developer's public GitHub activity into a beautiful, story-driven annual recap.

Rather than displaying raw analytics through dashboards, GitWrapped presents insights as an immersive narrative experience inspired by modern product storytelling.

---

# Vision

Every developer has a story.

GitWrapped helps tell it.

---

# Objectives

* Build a beautiful GitHub yearly recap experience.
* Prioritize storytelling over analytics.
* Deliver a polished, premium interface.
* Keep the experience shareable.
* Build an extensible architecture for future developer platforms.

---

# Target Audience

* Software Engineers
* Students
* Open Source Contributors
* Freelancers
* Technical Content Creators

---

# Success Criteria

* Fast loading
* Mobile-first
* Shareable recap
* Smooth animations
* High Lighthouse score
* Maintainable architecture

---

# MVP Scope

## Landing

* Hero
* Username input
* Demo preview
* Features
* Footer

## Wrapped Experience

* Welcome
* Year overview
* Contributions
* Longest streak
* Most productive day
* Favorite repository
* Language breakdown
* Coding habits
* Achievements
* Final recap

## Sharing

* Replay
* Share link
* Download image

---

# Out of Scope (V1)

* User accounts
* Database
* Payments
* Teams
* Multi-user comparisons
* AI-generated insights
* Private repository analysis
* Multiple developer platforms

---

# User Journey

Landing

↓

Enter GitHub username

↓

Fetch GitHub data

↓

Generate analytics

↓

Generate story

↓

View recap

↓

Share recap

---

# Functional Requirements

The application must:

* Accept any public GitHub username.
* Validate the username.
* Fetch public GitHub data.
* Calculate yearly insights.
* Present insights as full-screen story slides.
* Allow replay.
* Allow sharing.

---

# Non-Functional Requirements

* Responsive
* Accessible
* Fast
* Dark mode only
* Keyboard navigation
* Mobile gestures
* SEO friendly
* Type-safe
* Modular

---

# Future Roadmap

* GitHub OAuth
* Private repository support
* Multi-year comparisons
* LeetCode integration
* WakaTime integration
* Codeforces integration
* Developer achievements
* Personalized recap URLs
* Export to PDF
* Animated video export

---

# Guiding Principle

If a feature does not improve the story, it does not belong in GitWrapped.
