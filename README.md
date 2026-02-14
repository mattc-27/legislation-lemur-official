Here’s a tightened, more structured README with a clean **Recent Updates** section (dated), plus a PR title + description you can paste into GitHub.

---

# Legislation Lemur (ll-v2)

**Legislation Lemur** is a neutral, data-driven platform for exploring U.S. Congressional data — including members, bills, votes, and session-level composition — through a structured, stable interface.

This repository is built on a Turborepo monorepo foundation and includes significant frontend polish and backend orchestration alignment.

---

# 📌 Recent Updates

### **2026-02-12 — Bills Search & Filtering Enhancements**

* Added autocomplete support to bill search (subject-aware)
* Improved filter state handling (desktop + mobile)
* Stabilized mobile filter sheet behavior
* Query parameter synchronization improvements
* Rendering consistency fixes across breakpoints
* Refined UI tokens and layout spacing for search panels

**Impact:**
Cleaner filtering UX. More deterministic search behavior. Better mobile parity.

---

### **2026-02-11 — UI Stabilization & Error System Refactor**

* Refactored error boundaries (page-scoped + section-scoped)
* Centralized error reporting helpers
* Structured error metadata extraction utilities
* Improved not-found rendering logic (randomized imagery support)
* Refined header layout (full-width system)
* CSS token cleanup (`ll3` layout system)

**Impact:**
Improved observability. More resilient rendering. Clearer fallback UX.

---

### **2026-02-10 — ETL Schema & Control Plane Alignment**

* Updated Postgres schema references:

  * `sandbox_ops_control_v1`
  * `sandbox_ops_sched_v1`
* Materialized view contract alignment (v3 safe worker)
* Enum updates for:

  * Run execution statuses
  * Endpoint work tracking
  * Refresh lifecycle states
* Refresh queue tied explicitly to run groups
* Cloud Run Jobs + Workflows orchestration alignment

**Impact:**
Deterministic refresh lifecycle handling. Safer execution tracking. Schema-version consistency.

---

# 🚀 ll-v2 Overview

ll-v2 focuses on:

* UI stabilization
* Filtering/search robustness
* Error system refactoring
* Schema alignment for orchestration
* Refresh queue reliability
* Observability improvements

It does **not** introduce major Turborepo restructuring.

---

# 🧠 Backend & Orchestration

Although the monorepo structure remains stable, the ETL/control layer has evolved significantly.

### Key Backend Improvements

* Control-plane schema alignment
* Safer refresh worker (schema-safe V3)
* Enum-driven run status tracking
* Explicit run-group lifecycle management
* Improved materialized view refresh sequencing
* Workflow orchestration stability improvements

Most changes are internal to:

* `ops_refresh_worker`
* Orchestrator jobs
* Workflow definitions
* Database functions & migrations
* Environment configuration

Frontend structure remains stable; the orchestration logic is where most architectural evolution occurred.

---

# 🏗 Monorepo Structure

### Apps

* `web` – Main Legislation Lemur frontend (Next.js)
* `docs` – Documentation app (Next.js)

### Shared Packages

* `@repo/ui` – Shared React components
* `@repo/eslint-config`
* `@repo/typescript-config`

All packages are fully TypeScript.

---

# 🛠 Development

### Install

```bash
npm install
```

### Run All Apps

```bash
turbo dev
```

### Run Specific App

```bash
turbo dev --filter=web
```

---

# 🏗 Build

### Build All

```bash
turbo build
```

### Build Specific App

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

# 🧩 Architectural Philosophy

Legislation Lemur prioritizes:

* Data neutrality
* Structured legislative visibility
* Deterministic ETL orchestration
* Explicit control-plane state tracking
* Traceable refresh lifecycles
* Strong error boundaries
* Schema-version alignment
* Clear UI hierarchy over visual noise

---

# 📌 Notes for Reviewers

### Frontend Review Focus

* Layout refinements
* Search & filter stability
* Error boundaries & fallback UX
* Mobile rendering consistency

### Backend Review Focus

* Control schema references
* Refresh queue behavior
* Orchestrator alignment
* Enum & run status handling
* Schema-safe refresh worker logic

---

# 📖 Turborepo References

* [https://turborepo.com/docs/crafting-your-repository/running-tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
* [https://turborepo.com/docs/crafting-your-repository/caching](https://turborepo.com/docs/crafting-your-repository/caching)
* [https://turborepo.com/docs/reference/configuration](https://turborepo.com/docs/reference/configuration)
* [https://turborepo.com/docs/reference/command-line-reference](https://turborepo.com/docs/reference/command-line-reference)

