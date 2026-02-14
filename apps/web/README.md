Keep it. Think of it like this:

* **Root README** = “what is this repo + how everything fits together”
* **`apps/web/README`** = “how to run/build/deploy the frontend app + app-specific conventions”

That separation pays off the moment you (or a reviewer) only cares about the UI, or you add a second frontend later.

## What to put in `apps/web/README.md`

### 1) Purpose (1–3 sentences)

* What the web app is (Next.js UI for Legislation Lemur)
* What it consumes (your API/DB views)
* What key pages exist (Bills, Bill detail, Members, etc.)

### 2) Local dev (web-only)

* Commands for **just** the web app
* Any env vars needed to boot it
* Expected ports / URLs

### 3) App architecture / conventions (short, practical)

* Routing structure (App Router, key route groups)
* Where UI components live
* Styling system (your `ll3` tokens, globals)
* Search/filter patterns (query params, debounce, autocomplete)

### 4) “How to work on X”

A few quick recipes:

* Add a new filter
* Add a new data field to bill cards
* Add a new page panel

### 5) Deployment notes (if relevant)

* Firebase hosting targets/channels (dev/stage/prod) *at a high level*
* Build command and output

### 6) Recent updates (optional, app-only)

If the root README has repo-wide “Recent Updates”, the web README can have a small “UI Changelog” that’s only UI.

---

## Suggested `apps/web/README.md` (paste-ready)

````md
# Legislation Lemur — Web App (apps/web)

This is the **Next.js** frontend for Legislation Lemur (ll-v2). It provides a neutral, data-driven UI for exploring Congressional data such as bills, members, votes, and session-level composition.

## Quick Start

From the repo root:

```bash
npm install
turbo dev --filter=web
````

Then open:

* [http://localhost:3000](http://localhost:3000)

## Environment Variables

Create `apps/web/.env.local` (or use your preferred env workflow).

Common examples (adjust to your project):

* `NEXT_PUBLIC_API_BASE_URL=...`
* `NEXT_PUBLIC_ENV=development`

> Note: Keep secrets out of `NEXT_PUBLIC_*`.

## Scripts

From repo root:

```bash
# dev
turbo dev --filter=web

# build
turbo build --filter=web

# start (if applicable)
turbo start --filter=web
```

## Project Structure (high level)

* `app/` — Next.js App Router routes + layouts
* `app/components/` — UI components (including `ll3` layout + tokens)
* `lib/` — data fetching, formatting helpers, shared utilities
* `styles/` (or equivalent) — global styles + `ll3` tokens

## UI Conventions

### Styling / Tokens

The UI uses the `ll3` token system for layout + component styling.

* Prefer existing tokens over one-off styles
* Keep layout changes within the `ll3` system when possible

### Search & Filters

Bills search/filtering is designed to be:

* URL-driven (query params reflect state)
* Stable across breakpoints (desktop + mobile)
* Deterministic (debounce + predictable updates)

Autocomplete:

* Subject-aware suggestions
* Intended to reduce “dead-end” searches and speed up refinement

## Common Tasks

### Add a new bill filter

1. Add filter UI control
2. Wire it to query param state
3. Update fetch/request builder to include the param
4. Confirm mobile sheet parity

### Add a new field to bill results

1. Confirm the field exists in API/view payload
2. Add mapping/formatting in `lib/`
3. Render in list item / card component
4. Add fallback behavior for null/unknown values

## Recent Web Updates

### 2026-02-12 — Bills Search & Filtering Enhancements

* Autocomplete support
* Improved filter state + query sync
* Mobile filter sheet stabilization
* Rendering consistency fixes

```
