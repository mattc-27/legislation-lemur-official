# Legislation Lemur (LL3)

**Legislation Lemur** is a neutral, data-driven platform for exploring U.S. Congressional activity — including members, bills, votes, committees, composition trends, and legislative flow — through a structured, stable, and deterministic interface.

This repository is built on a Turborepo monorepo foundation and integrates:

* A highly structured Next.js frontend (LL3 design system)
* A schema-versioned Postgres control plane
* Cloud Run Job + Workflow–orchestrated ETL
* Materialized-view–driven search and metrics
* Deterministic refresh lifecycle management

---

# 🎯 Project Mission

Legislation Lemur exists to:

* Present legislative data without commentary or narrative framing
* Surface structural and behavioral patterns
* Provide deterministic, traceable data refresh lifecycles
* Avoid opinion, sensationalism, and algorithmic bias

This is not a news site.
It is a structured civic data interface.

---

# 🆕 Recent Platform Updates

## 2026-02 — Committees Directory & Navigation Layer

* Built committees directory page with chamber + type segmentation:

  * Standing
  * Select / Special
  * Joint
* Introduced directory UI tokens (`ll3.committees.*`)
* Structured card-based navigation
* Committee card routing foundation established
* Preparing metrics layer for committee-level analysis

**Impact:**
Committees are now first-class navigable entities in LL.

---

## 2026-02 — Bills Search & Filtering Enhancements

* Subject-aware autocomplete
* Filter state stabilization (desktop + mobile)
* Mobile filter sheet behavior hardened
* Deterministic query parameter synchronization
* Rendering consistency fixes across breakpoints
* Search panel spacing + UI token refinements

**Impact:**
Cleaner filtering UX. Reduced state drift. Stronger mobile parity.

---

## 2026-02 — Error System & Rendering Stabilization

* Refactored page-level + section-level error boundaries
* Centralized structured error helpers
* Error metadata extraction utilities
* Improved not-found handling
* Header layout refinement (full-width system)
* Continued LL3 CSS token cleanup

**Impact:**
Improved observability. Safer partial failures. More resilient UI rendering.

---

## 2026-02 — ETL & Control Plane Alignment

* Postgres schema updates:

  * `sandbox_ops_control_v1`
  * `sandbox_ops_sched_v1`
* Explicit run-group lifecycle tracking
* Enum-driven execution status modeling
* Refresh queue tied directly to run groups
* Safe V3 refresh worker contract alignment
* Cloud Run Jobs + Workflows orchestration stabilization

**Impact:**
Deterministic execution tracking. Explicit lifecycle management. Safer refresh sequencing.

---

# 🧠 Backend & Orchestration

The orchestration layer is the most architecturally evolved component of LL.

### Key Characteristics

* Schema-versioned control plane
* Enum-based run execution tracking
* Explicit run-group lifecycle states
* Refresh queue leasing model
* Materialized view dependency sequencing
* Safe worker contract (v3)
* Workflow-based orchestration control

Primary components:

* `ops_refresh_worker`
* Cloud Run Jobs
* GCP Workflows
* Database functions & migrations
* Supabase Postgres schemas
* Environment-based execution guards

The frontend consumes stable, materialized-view-backed contracts.

---

# 🏛 Current Feature Surface

## Members

* Member directory
* Detail pages
* Term timeline visualization
* Party & chamber context
* Session-level metadata

## Bills

* Search (autocomplete + subject-aware)
* Deterministic filtering
* Responsive filter UI
* Bill detail pages
* Metrics-backed views

## Committees

* Directory segmented by type
* Card-based navigation
* Structured routing
* Metrics expansion planned

## Insights (Scrollytelling Layer)

* Structured editorial-style analysis pages
* Data-visual sections
* LL3 layout system integration
* Designed for neutral legislative pattern exploration

---

# 🗺 Upcoming / Planned Features

## 🔎 District & Address Lookup

* GIS boundary integration (Congressional districts)
* Address-to-district resolution
* Privacy-preserving client-side safeguards
* Notification scaffolding foundation

---

## 📊 Committee Metrics Expansion

* Bill referral counts
* Throughput metrics
* Session-level activity trends
* Subcommittee breakdowns

---

## 📈 Insight Engine Evolution

* Session trend comparisons
* Cross-chamber flow visualization
* Bill lifecycle analytics
* Committee influence mapping

---

## 📬 Notification System (Planned)

* User-defined tracking (member / committee / bill)
* Weekly digest model
* Deterministic event generation
* Minimal PII storage

---

## 🧭 Observability Enhancements

* Structured refresh logs
* Run-group diagnostics
* Control-plane admin visibility
* Workflow state tracing improvements

---

# 🏗 Monorepo Structure

## Apps

* `web` — Main Legislation Lemur frontend (Next.js 15+)
* `docs` — Documentation site (Next.js)

## Shared Packages

* `@repo/ui` — Shared LL3 UI primitives
* `@repo/eslint-config`
* `@repo/typescript-config`

All packages are fully TypeScript.

---

# 🛠 Development

## Install

```bash
npm install
```

## Run All Apps

```bash
turbo dev
```

## Run Specific App

```bash
turbo dev --filter=web
```

---

# 🏗 Build

## Build All

```bash
turbo build
```

## Build Specific App

```bash
turbo build --filter=web
```

---

# ☁️ Remote Caching (Optional)

```bash
turbo login
turbo link
```

Enables shared build artifacts across CI and local machines.

---

# 🧩 Architectural Principles

Legislation Lemur prioritizes:

* Data neutrality
* Deterministic refresh lifecycles
* Explicit control-plane state tracking
* Schema-version alignment
* Stable materialized-view contracts
* Strong error boundaries
* Structured UI hierarchy
* Minimal algorithmic manipulation
* Observability over opacity

---

# 🧪 Reviewer Guidance

## Frontend Review Focus

* LL3 layout consistency
* Search & filter determinism
* Error boundary behavior
* Mobile rendering stability
* Committees navigation structure

## Backend Review Focus

* Control schema alignment
* Run-group lifecycle enforcement
* Refresh queue leasing logic
* Enum correctness
* Workflow orchestration integrity
* MV dependency sequencing

---

# 📚 Turborepo References

* [https://turborepo.com/docs/crafting-your-repository/running-tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
* [https://turborepo.com/docs/crafting-your-repository/caching](https://turborepo.com/docs/crafting-your-repository/caching)
* [https://turborepo.com/docs/reference/configuration](https://turborepo.com/docs/reference/configuration)
* [https://turborepo.com/docs/reference/command-line-reference](https://turborepo.com/docs/reference/command-line-reference)
