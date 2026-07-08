# GitWrapped Architecture

# Architecture Overview

GitWrapped follows a layered architecture.

GitHub API

↓

GitHub Service

↓

Analytics Engine

↓

Story Engine

↓

Presentation Layer

---

# Layers

## GitHub Service

Responsible for:

* GraphQL client
* Authentication
* Fetching raw GitHub data
* Error handling
* Rate limits

No business logic.

---

## Analytics Engine

Transforms raw GitHub data into insights.

Examples

* Longest streak
* Best coding day
* Favorite language
* Coding hours
* Repository statistics
* Weekly activity
* Monthly trends

Returns structured analytics only.

---

## Story Engine

Transforms analytics into story slides.

Input

Analytics

Output

Story objects

Example

Longest streak

↓

"You stayed consistent for 84 days."

---

## UI Layer

Responsible only for presentation.

Never performs analytics.

Never performs API requests.

---

# Folder Responsibilities

app/

Routing.

components/

Reusable UI.

features/

Feature-specific modules.

services/github/

GitHub communication.

services/analytics/

Insight generation.

services/story/

Story generation.

hooks/

Reusable hooks.

types/

Shared TypeScript types.

lib/

Shared utilities.

config/

Application configuration.

constants/

Application constants.

styles/

Global styling.

---

# Data Flow

GitHub

↓

Raw Data

↓

Validation

↓

Analytics

↓

Story

↓

Slides

---

# Error Handling

Every layer handles its own failures.

Never expose raw API errors to the UI.

---

# API Reference

## External Services

GitHub GraphQL API

Primary data source.

GitHub REST API

Fallback for endpoints unavailable in GraphQL.

---

## Environment Variables

GITHUB_TOKEN

GitHub Personal Access Token.

NEXT_PUBLIC_APP_URL

Application URL.

NEXT_PUBLIC_GITHUB_GRAPHQL

GraphQL endpoint.

---

## Initial Data Required

User

* login
* name
* avatar
* bio

Repositories

* stars
* forks
* language
* creation date

Contributions

* yearly calendar
* daily totals
* streak data

Languages

* repository language usage

Commits

* commit dates
* commit times

Pull Requests

Issues

Organizations

---

# API Rules

* Use GraphQL wherever possible.
* Minimize requests.
* Cache responses.
* Validate all responses with Zod.
* Never expose tokens to the client.

---

# Future Architecture

Additional providers can be added without changing the Story Engine.

Examples

* LeetCode
* WakaTime
* Codeforces
* Dev.to

Each provider should implement its own service while exposing a common analytics contract.
