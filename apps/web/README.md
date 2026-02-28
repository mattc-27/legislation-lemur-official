# Legislation Lemur — Web App (apps/web)

This is the **Next.js (App Router)** frontend for Legislation Lemur (LL3).

The web app provides a neutral, structured interface for exploring U.S. Congressional data — including bills, members, committees, and legislative session context. It consumes materialized-view–backed API contracts designed for deterministic rendering and stable filtering behavior.

The UI emphasizes:
- Data neutrality
- Explicit state synchronization
- Stable refresh-aware rendering
- Clear visual hierarchy via the LL3 design system

---

## High-Level Architecture

### Framework
- Next.js 15+ (App Router)
- TypeScript
- Turborepo monorepo integration

### Data Model
The app consumes:
- Materialized view–backed endpoints
- Deterministic query-driven filtering
- Explicit run-lifecycle–aligned payloads (backend-controlled)

The frontend does **not** contain business logic about legislative interpretation — only structured presentation.

---

## Key Route Groups

```
app/
├── (app)/
│   ├── bills/
│   ├── members/
│   ├── committees/
│   └── insights/
├── (wiki)/
└── layout.jsx
```

Primary surface areas:

- **Bills**
  - Search + filtering (URL-driven state)
  - Bill detail pages
- **Members**
  - Directory
  - Detail pages with service timelines
- **Committees**
  - Segmented directory (Standing / Select / Joint)
- **Insights**
  - Structured scrollytelling / editorial-style data exploration

---

## UI & Styling System

The web app uses the **LL3 token system**.

- Token files: `ll3.*.tokens.css`
- Layout styles: `ll3.*.layout.css`
- Feature-specific UI: `ll3.bills.*`, `ll3.members.*`, `ll3.committees.*`, etc.

Conventions:
- Prefer token usage over inline styles
- Maintain consistent typography hierarchy
- Avoid one-off layout hacks
- Favor predictable spacing + structural clarity

The system is designed to scale without visual drift.

---

## Search & Filter Architecture

Bills filtering is intentionally:

- **URL-driven** (query params reflect full state)
- **Breakpoint-stable** (desktop + mobile parity)
- **Debounced and deterministic**
- **Autocomplete-enhanced (subject-aware)**

Pattern:

1. UI control updates query param
2. Query param drives fetch
3. Render based on canonical URL state

This prevents state desynchronization between mobile sheets and desktop panels.

---

## Common Development Patterns

### Add a New Bill Filter

1. Add control component (UI layer)
2. Wire to query param state
3. Extend request builder to include param
4. Confirm mobile filter sheet parity
5. Verify SSR + client transitions remain stable

---

### Add a New Data Field to Bill Cards

1. Confirm field exists in API/view contract
2. Add formatting helper (if needed) in `lib/`
3. Render in card component
4. Add null-safe fallback behavior

Avoid rendering raw payload fields directly without formatting normalization.

---

### Add a New Page Panel / Section

1. Create section component
2. Use LL3 layout primitives
3. Maintain typographic scale consistency
4. Ensure error boundary compatibility
5. Avoid introducing layout shifts during hydration

---

## Error Handling Strategy

- Page-level error boundaries
- Section-level isolation where appropriate
- Structured error metadata extraction
- Controlled not-found rendering

The goal is partial resilience — not full-page collapse.

---

## Local Development (Web Only)

From repo root:

```bash
turbo dev --filter=web
```

Default:
```
http://localhost:3000
```

Environment variables (example):

```
NEXT_PUBLIC_API_BASE_URL=...
NEXT_PUBLIC_ENV=development
```

> Do not store secrets in `NEXT_PUBLIC_*`.

---

## Build

From repo root:

```bash
turbo build --filter=web
```

The output is deployed via Firebase Hosting (environment-targeted channels).

---

## Deployment Notes (High Level)

Environments:
- dev
- stage
- production

Deployment:
- Turborepo build
- Firebase hosting target per environment
- Backend orchestration handled separately via Cloud Run + Workflows

The web app assumes stable materialized-view contracts at runtime.

---

## Recent UI Updates

### 2026-02 — Committees Directory Layer

- Segmented directory (Standing / Select / Joint)
- Card-based navigation
- LL3 token integration
- Routing foundation for committee metrics expansion

---

### 2026-02 — Bills Search Stabilization

- Subject-aware autocomplete
- Query synchronization improvements
- Mobile filter sheet hardening
- Rendering consistency fixes

---

## Design Philosophy

This frontend prioritizes:

- Determinism over animation noise
- Clarity over decoration
- Neutrality over commentary
- Explicit state over implicit behavior
- Structural hierarchy over visual clutter

The goal is to make legislative data understandable without narrative framing.