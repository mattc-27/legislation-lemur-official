# Legislation Lemur (v2)

**Legislation Lemur** is a neutral, data-driven platform for exploring U.S. Congressional data — including members, bills, votes, and session-level composition — through a clean, structured interface.

This repository is built on a Turborepo monorepo foundation, with significant enhancements across:

* UI / layout system
* Search & filtering logic
* Error handling & observability
* ETL orchestration + control schema alignment

---

## 🚀 What’s New in ll-v2

### Frontend Enhancements

ll-v2 focuses heavily on UX polish, rendering stability, and filtering improvements.

**Major Improvements:**

* Enhanced page layouts (full-width header, refined content spacing)
* Improved filtering & search behavior (desktop + mobile stability)
* Refactored error boundaries and error rendering system
* Structured error logging + reporting helpers
* Randomized not-found imagery support
* Refactored CSS (ll3 layout + styling tokens)
* Better component isolation with scoped boundaries
* Improved search panel rendering consistency across devices
* More resilient client/server rendering patterns

The overall goal:
**Cleaner UI. More stable state handling. Better filtering clarity.**

---

## 🧠 ETL & Orchestration Updates

⚠️ This repository originated from the Turborepo starter template. The monorepo structure remains stable, but the ETL/control layer has evolved significantly.

### Key Backend / Pipeline Updates

* Migration to updated Postgres schemas:

  * `sandbox_ops_control_v1`
  * `sandbox_ops_sched_v1`
  * Updated materialized view contracts
* Alignment with Cloud Run Jobs + Workflows orchestration model
* Updated enum usage for:

  * Run execution statuses
  * Endpoint work tracking
  * Refresh lifecycle states
* Refresh queue logic now tied to control-plane run groups
* Materialized view refresh process updated to match pipeline contracts
* Improved refresh worker schema safety (V3 schema-safe worker)

Most structural changes are internal to:

* `ops_refresh_worker`
* Orchestrator jobs
* Workflow definitions
* Database functions + migrations
* Environment configuration

There are **no major structural changes** to Turborepo itself.

If reviewing this repo primarily for frontend structure, you will not see large architectural shifts — the significant changes are in:

* Control-plane logic
* Schema references
* Execution tracking
* Refresh orchestration handling

---

## 🏗 Monorepo Structure

This Turborepo includes:

### Apps

* `web` – Main Legislation Lemur frontend (Next.js)
* `docs` – Documentation app (Next.js)

### Shared Packages

* `@repo/ui` – Shared React components
* `@repo/eslint-config` – ESLint configuration
* `@repo/typescript-config` – Shared TypeScript config

All packages are fully TypeScript.

---

## 🛠 Development

### Install

```bash
npm install
```

### Develop All Apps

```bash
turbo dev
```

Or:

```bash
npx turbo dev
```

### Develop Specific App

```bash
turbo dev --filter=web
```

---

## 🏗 Build

Build entire monorepo:

```bash
turbo build
```

Build specific app:

```bash
turbo build --filter=web
```

---

## ☁️ Remote Caching (Optional)

Turborepo supports Remote Caching via Vercel.

```bash
turbo login
turbo link
```

Remote caching allows shared build artifacts across machines and CI.

---

## 🧩 Architectural Philosophy

Legislation Lemur is designed around:

* Data neutrality
* Structured legislative visibility
* Clear status + refresh observability
* Deterministic ETL orchestration
* Explicit control-plane state tracking
* Frontend clarity over visual noise

The project prioritizes:

* Traceable refresh lifecycles
* Explicit run-group orchestration
* Strong error boundaries
* Schema-version alignment
* Clear UI hierarchy

---

## 🔍 Scope of ll-v2

ll-v2 focuses on:

* UI stabilization
* Filtering/search robustness
* Error system refactoring
* Schema alignment for orchestration
* Refresh queue reliability

It does **not** introduce major monorepo restructuring.

---

## 📌 Notes for Reviewers

If reviewing:

**Frontend reviewers**

* Focus on layout refinements
* Filtering/search improvements
* Error boundaries + page fallback system
* Rendering consistency improvements

**Backend / ETL reviewers**

* Review control schema references
* Refresh queue behavior
* Orchestrator alignment with Cloud Workflows
* Updated enum and run status handling
* V3 schema-safe refresh worker logic

---

## 📖 Useful Turborepo Links

* [https://turborepo.com/docs/crafting-your-repository/running-tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
* [https://turborepo.com/docs/crafting-your-repository/caching](https://turborepo.com/docs/crafting-your-repository/caching)
* [https://turborepo.com/docs/reference/configuration](https://turborepo.com/docs/reference/configuration)
* [https://turborepo.com/docs/reference/command-line-reference](https://turborepo.com/docs/reference/command-line-reference)
