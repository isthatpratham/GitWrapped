# Contributing to GitWrapped

First of all, thank you for considering contributing to GitWrapped.

Whether you're fixing a typo, improving performance, designing animations, or implementing new analytics, every contribution is appreciated.

---

# Project Philosophy

GitWrapped values quality over quantity.

We prefer one well-crafted contribution over ten rushed ones.

Before writing code, ask yourself:

- Does this improve the experience?
- Is the implementation maintainable?
- Does it match the project's design philosophy?
- Is it simple enough?

---

# Design Philosophy

GitWrapped is intentionally minimal.

Please avoid introducing:

- unnecessary animations
- excessive gradients
- random colors
- inconsistent spacing
- multiple fonts
- generic dashboard components
- visual clutter

Every interface should feel handcrafted.

---

# Development Principles

- Keep components small.
- Prefer composition over duplication.
- Write readable code.
- Avoid premature optimization.
- Keep business logic separate from UI.
- Reuse existing utilities whenever possible.

---

# Branch Naming

Use descriptive branch names.

Examples:

```
feature/github-api
feature/story-engine
feature/share-card
feature/mobile-layout

fix/navigation
fix/chart-animation
fix/github-auth

docs/readme
docs/contributing

refactor/story-generator
```

---

# Commit Messages

Follow Conventional Commits.

Examples:

```
feat: add GitHub contribution analytics

fix: correct streak calculation

refactor: simplify story generator

docs: update README

style: improve landing page spacing

chore: update dependencies
```

---

# Pull Requests

A good pull request should:

- focus on one feature or fix
- include a clear description
- explain the motivation
- avoid unrelated changes

Large pull requests are difficult to review.

Smaller, focused contributions are preferred.

---

# Code Style

- Use TypeScript.
- Use meaningful names.
- Avoid unnecessary comments.
- Remove unused code.
- Prefer early returns.
- Avoid deeply nested logic.

If the code is difficult to understand, it probably needs simplifying.

---

# Component Guidelines

Every component should have a single responsibility.

Prefer reusable components whenever possible.

Avoid copy-pasting UI.

---

# Accessibility

Every contribution should consider accessibility.

- Keyboard navigation
- Semantic HTML
- Proper labels
- Sufficient color contrast
- Screen reader compatibility

Accessibility is a feature, not an afterthought.

---

# Performance

Performance is part of the user experience.

Please avoid:

- unnecessary re-renders
- oversized client components
- heavy dependencies
- duplicate API requests

---

# Before Opening a Pull Request

Please ensure that:

- the project builds successfully
- linting passes
- formatting is consistent
- no unnecessary files are included
- documentation is updated if needed

---

# Code of Conduct

Be respectful.

Be constructive.

Assume good intentions.

GitWrapped is an inclusive project, and everyone should feel welcome to contribute.

---

Thank you for helping make GitWrapped better.