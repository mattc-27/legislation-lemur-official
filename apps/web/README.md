# Legislation Lemur — Web App

This package contains the primary Legislation Lemur frontend built with Next.js App Router.

The application provides a neutral, structured interface for exploring U.S. Congressional data through legislation, members, committees, votes, and related civic reference resources.

The frontend emphasizes:

* Discoverability
* Clear information hierarchy
* Consistent navigation patterns
* Responsive exploration workflows
* Neutral presentation of legislative data

---

## Purpose

The web application serves as the primary user-facing experience for Legislation Lemur.

Its role is to help users:

* Discover legislation and legislative activity
* Explore members of Congress
* Navigate committee structures
* Search across multiple entity types
* Understand legislative relationships and context
* Access civic information through a consistent interface

The frontend presents structured information but does not provide political commentary or editorial analysis.

---

## Architecture

### Framework

* Next.js (App Router)
* React
* JavaScript / JSX
* Turborepo monorepo architecture

### Data Layer

The application consumes:

* PostgreSQL-backed application views
* Materialized-view search indexes
* Structured server-side data helpers
* URL-driven filtering and navigation

Business logic and data processing remain outside the presentation layer whenever practical.

---

## Route Structure

```text
app/
├── (site)/
│   ├── page.jsx
│   ├── search/
│   ├── about/
│   └── reference/
│
├── (app)/
│   ├── bills/
│   ├── member/
│   ├── committees/
│   └── insights/
│
├── bills/@panel/
├── member/@panel/
└── layout.jsx
```

Primary exploration areas:

### Global Search

Unified search experience for discovering:

* Bills
* Members
* Committees

### Legislative Archive

Legislation discovery, filtering, and detail views.

### Member Directory

Congressional member exploration and profile pages.

### Committees

Committee and subcommittee exploration.

### Reference

Supporting civic and legislative resources.

---

## Search Architecture

Search is a primary navigation and discovery mechanism throughout the platform.

Current capabilities include:

* Homepage search experience
* Search-as-you-type previews
* Dedicated search results page
* Entity-aware result grouping
* Bill, member, and committee discovery
* URL-preserved search state

Search principles:

* Fast results
* Explainable behavior
* Consistent result presentation
* Minimal user friction
* Progressive enhancement toward natural-language search

The search experience should help users move from a question to relevant legislative information with as few steps as possible.

---

## Information Architecture

A major focus of the current platform generation is improving discoverability and reducing navigation complexity.

The application is organized around a small number of primary exploration experiences:

* Global Search
* Legislative Archive
* Member Directory
* Committees
* Reference Resources

Pages should prioritize:

* Clear primary actions
* Consistent hierarchy
* Predictable navigation
* Shared filtering patterns
* Mobile parity
* Reduced visual clutter

The goal is to make legislative information easier to find without requiring users to understand congressional structures beforehand.

---

## LL3 Design System

The frontend uses the LL3 design system and shared styling architecture.

Core goals:

* Consistency
* Accessibility
* Responsive behavior
* Predictable spacing
* Strong content hierarchy
* Reusable interface patterns

Shared systems include:

* Typography
* Forms
* Buttons
* Filters
* Tables
* Cards
* Route panels
* Layout primitives

Guidelines:

* Prefer shared styles over page-specific implementations
* Reuse explorer layouts whenever possible
* Avoid duplicate UI patterns
* Maintain visual consistency across entity types
* Favor structure and clarity over decoration

---

## Explorer Pattern

Most major sections follow a shared explorer model:

```text
Page Header
├── Search / Filters
├── Results Table or Grid
├── Detail Route Panel
└── Related Navigation
```

Currently used by:

* Legislative Archive
* Member Directory
* Committees
* Search Results

This pattern improves consistency while reducing maintenance overhead.

---

## Development Patterns

### Adding a New Filter

1. Add the UI control.
2. Connect it to URL state.
3. Extend server-side query handling.
4. Verify desktop and mobile parity.
5. Confirm state persistence across navigation.

### Adding a New Searchable Entity

1. Extend search document generation.
2. Add result rendering support.
3. Define route behavior.
4. Update search grouping logic.
5. Validate mobile and desktop experiences.

### Adding New Data to Existing Views

1. Confirm availability within the data contract.
2. Normalize values where appropriate.
3. Add null-safe rendering.
4. Maintain layout consistency.

---

## Error Handling

The application favors graceful degradation over complete page failure.

Current patterns include:

* Route-level error boundaries
* Structured error handling
* Not-found fallbacks
* Empty-state experiences
* Partial rendering when possible

Users should receive useful feedback rather than application crashes.

---

## Development

Run the web application:

```bash
turbo dev --filter=web
```

The application runs through the Turborepo workspace and shares common packages with the broader Legislation Lemur platform.

---

## Design Philosophy

The frontend prioritizes:

* Clarity over decoration
* Structure over complexity
* Discoverability over novelty
* Consistency over customization
* Neutrality over commentary

Every page should help users answer a question, discover information, or continue exploring congressional data with minimal friction.
