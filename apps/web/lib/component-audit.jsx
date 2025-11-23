/* asdf */

export function Components() {




  return (

    <>
      {/* Home subject trend filter */}
      <div className="subjects-trend__filters">

        <button
          key={opt.id}
          type="button"
          className={
            "subjects-trend__filter-btn" +
            (opt.id === windowId ? " subjects-trend__filter-btn--active" : "")
          }
          onClick={() => setWindowId(opt.id)}
        >
          {opt.label}
        </button>

      </div>
      {/* Home subject trend filter */}
      <div className="filters__actions">
        <button type="button" className="btn btn--ghost" onClick={clearFilters}>
          Clear
        </button>
      </div>
      {/* subject-kind toggle */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button
          className={`btn btn--ghost ${subjectKind === "policy_area" ? "active" : ""}`}
          aria-pressed={subjectKind === "policy_area"}
          onClick={() => setSubjectKind("policy_area")}
        >
          Policy Areas
        </button>
        <button
          className={`btn btn--ghost ${subjectKind === "legislative" ? "active" : ""}`}
          aria-pressed={subjectKind === "legislative"}
          onClick={() => setSubjectKind("legislative")}
        >
          Legislative Topics
        </button>
      </div>

      {/* Donut show more */}
      <button
        type="button"
        className="viz__legend-more"
        onClick={() => setShowAllLegend((v) => !v)}
      >
        {showAllLegend ? "Show fewer" : `+${remaining} more`}
      </button>

      {/* Controls */}
      <div className="billtable__controls" role="toolbar" aria-label="Bill table filters">
        <select className="ctl ctl--sm" value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Topic">
          {allSubjects.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <div className="dategroup">
          <label className="sr-only" htmlFor="from">From</label>
          <input id="from" className="ctl ctl--sm" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className="dash">–</span>
          <label className="sr-only" htmlFor="to">To</label>
          <input id="to" className="ctl ctl--sm" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <div className="sortgroup">
          <select className="ctl ctl--sm" value={sortKey} onChange={(e) => setSortKey(e.target.value)} aria-label="Sort by">
            <option value="date">Date</option>
            <option value="subject">Topic</option>
          </select>
          <button className="btn btn--ghost btn--sm" type="button" onClick={flipDir} aria-label="Toggle sort direction">
            {sortDir === "asc" ? "↑" : "↓"}
          </button>
        </div>
      </div>
      {/* bill table link */}
      <a
        href={r.href.url}
        target={r.href.isExternal ? "_blank" : undefined}
        rel={r.href.isExternal ? "noopener noreferrer" : undefined}
        className="billlink"
        title={r.title}
      >
        {r.title}
      </a>
      {/* member page back */}
      <div className="member-back">
        <Link
          href={`/search?state=${encodeURIComponent(profile.stateCode || "")}`}
          className="member-back__btn"
        >
          <span className="member-back__icon">←</span>
          <span>Back to {stateLabel} results</span>
        </Link>
      </div>

      {/* member search result card view */}
      <a className="btn btn--accent" href={href} aria-label={`View ${m.name} profile`}>
        View profile
      </a>

      {/* vote activity timeline */}
      <div className="segbtns" role="tablist" aria-label="Activity view">
        <button type="button" role="tab" aria-selected={mode === "all"} className={`segbtn ${mode === "all" ? "is-active" : ""}`} onClick={() => setMode("all")}>All</button>
        <button type="button" role="tab" aria-selected={mode === "sponsored"} className={`segbtn ${mode === "sponsored" ? "is-active" : ""}`} onClick={() => setMode("sponsored")}>Sponsored</button>
        <button type="button" role="tab" aria-selected={mode === "cosponsored"} className={`segbtn ${mode === "cosponsored" ? "is-active" : ""}`} onClick={() => setMode("cosponsored")}>Co-sponsored</button>
      </div>
      <style jsx>{`
        .segbtns{display:inline-flex;gap:6px;background:var(--surface-2,#f5f7fb);padding:4px;border-radius:12px;border:1px solid var(--line-1,#e5e7eb)}
        .segbtn{font:inherit;padding:6px 10px;border-radius:8px;border:0;background:transparent;cursor:pointer;color:#475569}
        .segbtn.is-active{background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.05);color:#111827}
        .has-tip{position:relative}
        .has-tip:hover::after,.has-tip:focus-visible::after{content:attr(data-tip);position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 8px);padding:6px 8px;font-size:12px;line-height:1.3;color:#0b1221;background:#fff;border:1px solid #e5e7eb;border-radius:8px;box-shadow:0 8px 16px rgba(0,0,0,.08);white-space:nowrap;z-index:10}
        .has-tip:hover::before,.has-tip:focus-visible::before{content:"";position:absolute;left:50%;transform:translateX(-50%);bottom:calc(100% + 2px);border:6px solid transparent;border-top-color:#e5e7eb}
      `}</style>

      {/* vote table */}
      <>
        {/* vote table link */}
        <a
          href={v.bill_url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {v.bill_display}
        </a>
        {/* vote table show more */}
        <button
          className="btn-showmore"
          type="button"
          onClick={() =>
            setTableLimit((n) => (n || tableInitialLimit || 20) + (tableInitialLimit || 20))
          }
        >
          Show more votes
        </button>
      </>
      <style jsx>
        {`
        
.btn-showmore {
    margin-top: 10px;
    align-self: flex-end;
    /* right-align under table on desktop */
    padding: 0.55rem 1.1rem;
    border-radius: 999px;
    border: 1px solid #c7d2fe;
    /* indigo-200 */
    background: #eef2ff;
    /* indigo-100 */
    color: #3730a3;
    /* indigo-800 */
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.01em;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    cursor: pointer;
    box-shadow:
        0 1px 0 rgba(15, 23, 42, 0.03),
        0 4px 12px rgba(15, 23, 42, 0.08);
    transition:
        background 140ms ease,
        border-color 140ms ease,
        box-shadow 140ms ease,
        transform 120ms ease;
}

.btn-showmore::after {
    content: "↓";
    font-size: 0.8rem;
}

/* hover / active / focus */

.btn-showmore:hover {
    background: #e0e7ff;
    /* slightly deeper indigo */
    border-color: #a5b4fc;
    /* indigo-300 */
    transform: translateY(-1px);
    box-shadow:
        0 2px 4px rgba(15, 23, 42, 0.08),
        0 6px 18px rgba(15, 23, 42, 0.10);
}

.btn-showmore:active {
    transform: translateY(0);
    box-shadow:
        0 0 0 rgba(0, 0, 0, 0),
        inset 0 1px 2px rgba(15, 23, 42, 0.12);
    background: #e5e7ff;
}

.btn-showmore:focus-visible {
    outline: none;
    box-shadow:
        0 0 0 2px #fff,
        0 0 0 4px #4f46e5;
    /* focus ring */
}

/* full-width on narrow screens */
@media (max-width: 640px) {
    .btn-showmore {
        align-self: stretch;
        width: 100%;
        justify-content: center;
    }
}`}
      </style>

    </>
  )
}
`
<style>

/* Filters row */
.subjects - trend {
  display: flex;
  flex - direction: column;
  gap: 10px;
}

.subjects - trend__filters {
  display: inline - flex;
  flex - wrap: wrap;
  gap: 6px;
}

/* Filter buttons — pill style */
/* Filter buttons — uniform pill style on light card */
.subjects - trend__filter - btn {
  border - radius: 999px;
  border: 1px solid #d1d5db;
  /* slate-300-ish */
  padding: 4px 12px;
  font - size: 0.78rem;
  background: #ffffff;
  color: #4b5563;
  /* slate-600 */
  cursor: pointer;
  transition:
        background 0.15s ease,
    border - color 0.15s ease,
      color 0.15s ease;
}

.subjects - trend__filter - btn:hover {
  background: #f3f4f6;
  /* slate-100 */
  border - color: #cbd5f5;
  /* light indigo-ish */
}

/* Active state: subtle indigo, same shape */
.subjects - trend__filter - btn--active {
  background: #eef2ff;
  /* indigo-50 */
  border - color: #4f46e5;
  /* indigo-600 */
  color: #1d4ed8;
  /* indigo-500 */
}


/* Small Clear button sizing to feel less awkward */
.filters__actions .btn.btn--ghost {
  height: 40px;
  padding: 0 12px;
  font-weight: 600;
}



/* =============================
   Search box
   ============================= */
.lemur-searchbox {
    position: relative;
    z-index: var(--z-dropdown);
    max-width: clamp(560px, 60vw, 780px);
    /* min 560px, prefer ~60vw, max 780px */
    margin: 0 auto;
    /* center it */
    isolation: isolate;
}

/* Input: cleaner, larger, nicer focus */
.lemur-searchbox .sb-input {
    width: 100%;
    height: 52px;
    border-radius: 14px;
    border: 1.5px solid #E5E7EB;
    background: #fff;
    padding: 0 16px;
    font-size: 16px;
    line-height: 1;
    font-weight: 500;
    color: #0f172a;
    /* slate-900 */
    transition: border-color .15s ease, box-shadow .15s ease, background .15s ease;
}

.lemur-searchbox .sb-input::placeholder {
    color: #9AA3AF;
    /* gray-400ish */
    font-weight: 400;
}

.lemur-searchbox .sb-input:focus {
    outline: none;
    border-color: #4F46E5;
    /* indigo-600 */
    box-shadow: 0 0 0 6px rgba(79, 70, 229, .08);
    background: #fff;
}

/* Dropdown stays anchored to the centered width */
.lemur-searchbox .sb-dropdown {
    position: absolute;
    inset-inline: 0;
    /* full width of the centered box */
    margin-top: 10px;
    z-index: calc(var(--z-dropdown) + 1);
    max-height: 60vh;
    overflow: auto;
    border: 1px solid rgba(17, 24, 39, .12);
    border-radius: 12px;
    box-shadow: 0 12px 24px rgba(0, 0, 0, .08);
    background-color: #fff;
    padding: 16px 18px 14px;
}

/* Typography polish inside dropdown */
.lemur-searchbox .sb-section-label {
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 800;
    letter-spacing: -0.005em;
    color: #0f172a;
    padding-block: 8px;
    margin: 2px 0 10px;
}

.lemur-searchbox .sb-state-block+.sb-state-block {
    margin-top: 12px;
}

.lemur-searchbox .sb-state-heading {
    font-family: var(--font-serif);
    font-weight: 800;
    font-size: 1.05rem;
    letter-spacing: -0.005em;
}

.lemur-searchbox .sb-member-link {
    color: #111827;
    /* darker name */
    font-weight: 700;
    text-decoration: none;
    padding-right: 6px;
    /* space before meta */
}

.lemur-searchbox .sb-member-link:hover {
    text-decoration: underline;
}

.lemur-searchbox .sb-member-link:visited {
    color: #111827;
}

/* avoid purple */

.lemur-searchbox .sb-list-item:hover,
.lemur-searchbox .sb-list-item:focus-within {
    background: rgba(15, 23, 42, .03);
    /* soft hover/focus */
}

.lemur-searchbox .sb-member-meta {
    font-size: .85rem;
    font-weight: 500;
    opacity: .65;
    margin-left: 6px;
}

/* Text comfort */
.lemur-searchbox .sb-member-link,
.lemur-searchbox .sb-member-meta {
    line-height: 1.35;
    /* easier to scan */
}

/* Spacing polish */
.lemur-searchbox .sb-list {
    row-gap: 12px;
}

.lemur-searchbox .sb-list-item {
    padding: 8px 10px;
    /* vertical breathing room per row */
    margin: 0 -10px;
    /* pull padding to the edges of the dropdown */
    border-radius: 10px;
}

.lemur-searchbox .sb-divider {
    border: 0;
    border-top: 1px solid rgba(17, 24, 39, .12);
    margin: 12px 0 14px;
}

/* Responsive: keep it pleasantly wide but not edge-to-edge */
@media (max-width: 720px) {
    .lemur-searchbox {
        max-width: 100%;
        /* closer to full width */
    }

    .lemur-searchbox .sb-list-item {
        padding: 10px 12px;
    }
}


/* Button inside the search form */
.home-search-form .btn.btn--accent {
    width: 100%;
    height: 46px;
    padding: 0 18px;
    font-size: 14px;
    border-radius: 10px;
    background: var(--indigo);
    color: #fff;
    border: none;
}

/* Selects styled to pair with .sb-input from home-styles.css */
.sb-select {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1.5px solid #E5E7EB;
  background: #fff;
  padding: 0 12px;
  font-size: 15px;
  font-weight: 500;
  color: #0f172a;
}

.sb-select:focus {
  outline: none;
  border-color: #4F46E5;
  box-shadow: 0 0 0 6px rgba(79, 70, 229, .08);
}


/* all bill table component styles */
  .billtable { display: flex; flex-direction: column; gap: 8px; }
  .billtable__controls {
    display: grid;
    grid-auto-flow: column;
    gap: 6px;
    align-items: center;
    justify-content: start;
    overflow-x: auto;
    padding-bottom: 2px;
  }
  .ctl {
    font: inherit;
    line-height: 1.2;
    padding: 8px 10px;
    border-radius: 10px;
    border: 1px solid var(--line-1, #e5e7eb);
    background: var(--surface-1, #fff);
    min-width: 110px;
  }
  .ctl--sm { padding: 6px 8px; border-radius: 8px; min-width: 100px; }
  .dategroup { display: inline-flex; align-items: center; gap: 6px; }
  .dash { opacity: .6; }
  .sortgroup { display: inline-flex; align-items: center; gap: 6px; }
  .btn--sm { padding: 4px 8px; border-radius: 8px; }
  .billtable__scroller {
    border: 1px solid var(--line-1, #e5e7eb);
    border-radius: 12px;
    background: #fff;
  }
  .billtable__table { width: 100%; border-collapse: separate; border-spacing: 0; }
  thead th {
    position: sticky;
    top: 0;
    z-index: 1;
    background: #f8fafc;
    text-align: left;
    font-weight: 600;
    padding: 10px 12px;
    border-bottom: 1px solid #e5e7eb;
    letter-spacing: .02em;
    text-transform: uppercase;
    font-size: 12px;
  }
  tbody td {
    padding: 10px 12px;
    border-bottom: 1px solid #f1f5f9;
    vertical-align: top;
  }
  .billtable__row:hover td { background: #fafafa; }
  .billtable__cell--title { font-weight: 600; }
  .billtable__cell--topic { display: inline-flex; align-items: center; gap: 8px; }
  .swatch {
    width: 10px;
    height: 10px;
    border-radius: 2px;
    display: inline-block;
    box-shadow: 0 0 0 1px #e5e7eb inset;
  }
  .billlink { text-decoration: none; }
  .billtable__empty { text-align: center; color: #64748b; padding: 24px; }
  .chip {
    padding: 2px 6px;
    border-radius: 999px;
    font-size: 12px;
    line-height: 1.25;
  }
  .chip--s { background: #EEF0FF; color: #3730A3; border: 1px solid #C7D2FE; }
  .chip--c { background: #F1F5F9; color: #334155; border: 1px solid #E2E8F0; }
  .chip--mix { background: #ECFEFF; color: #155E75; border: 1px solid #BAE6FD; }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0,0,0,0);
    border: 0;
  }

  /* ---------- mobile tweaks ---------- */
  @media (max-width: 640px) {
    .billtable__controls {
      grid-auto-flow: row;
      grid-template-columns: 1fr;
      align-items: stretch;
    }

    .ctl,
    .ctl--sm {
      min-width: 0;
      width: 100%;
    }

    .dategroup,
    .sortgroup {
      width: 100%;
      justify-content: flex-start;
    }

    thead th {
      font-size: 11px;
      padding: 8px 10px;
    }

    tbody td {
      padding: 8px 10px;
      font-size: 13px;
    }

    .billtable__cell--topic {
      max-width: 140px;
    }
  }

  /* member page back */

/* Back to state results link (top-left, inside panel) */
.member-back {
    margin-bottom: 8px;
}

.member-back__btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 0.8rem;
    font-weight: 600;
    color: #4b5563;
    /* slate-600 */
    text-decoration: none;
    border: 1px solid #e5e7eb;
    /* slate-200 */
    background: rgba(248, 250, 252, 0.9);
    /* slate-50 */
    box-shadow: 0 1px 3px rgba(15, 23, 42, 0.06);
    transition:
        background 140ms ease,
        border-color 140ms ease,
        color 140ms ease,
        box-shadow 140ms ease,
        transform 120ms ease;
}

.member-back__icon {
    font-size: 0.9rem;
    line-height: 1;
}

.member-back__btn:hover {
    background: #eef2ff;
    /* soft indigo echo */
    border-color: #c7d2fe;
    color: #4338ca;
    transform: translateY(-1px);
    box-shadow:
        0 2px 6px rgba(15, 23, 42, 0.10);
}

.member-back__btn:active {
    transform: translateY(0);
    box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.16);
}

.member-back__btn:focus-visible {
    outline: none;
    box-shadow:
        0 0 0 2px #fff,
        0 0 0 4px #4f46e5;
}

/* On very small screens, let it stretch a bit but stay subtle */
@media (max-width: 640px) {
    .member-back {
        margin-bottom: 6px;
    }

    .member-back__btn {
        padding-inline: 10px;
        max-width: 100%;
    }
}

/* member search result card */\

.btn.btn--accent {
  background: #4F46E5;
  /* indigo */
  border: 1px solid #4338CA;
  color: #fff;
  box-shadow: 0 4px 14px rgba(79, 70, 229, .16);
}

.btn.btn--accent:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(79, 70, 229, .22);
}

.btn.btn--accent:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(79, 70, 229, .18);
}

</style>


`



/* 


## 1. Map everything to a small set of components

From your list + screenshots, we can cover almost everything with ~6 primitives:

### A. `Button`

Used for:

* **View profile** (search results card)
* **Back to {state} results** (member page)
* **Show more votes** button
* Possibly **+ more** if you want it to feel more button-y, not just inline text

Variants we’ll want:

* `primary`: solid purple, white text (View profile)
* `secondary`: subtle/outline/light background (Back button, Show more)
* `ghost` / `text`: minimal chrome, mostly for inline actions if needed
* `size="sm" | "md"` for pill-like vs normal

States:

* default, hover, active, disabled, focus-visible







---

### B. `SegmentedControl` (or `ToggleGroup`)

All of these should look/behave the same:

* Home “Subjects over time” **timeframe filters**

  * Session 1 / Last 6 months / Last 30 days / Last 7 days

--- 



----


* Member “Legislative activity” chart buttons:

  * All / Sponsored / Co - sponsored
  * Recent bills donut ** mode toggle **:

  * Policy areas / Legislative topics

They’re all: * small pill buttons, one active at a time, same height, rounded, subtle background for inactive, solid for active *.

We can implement it as:

* A`SegmentedControl` wrapper
  * Child`SegmentedControl.Button` using the base `Button` styles but a specific variant(`segmented`)








---

### C. `Input` + `Select`

Used for:

* Search page:

  * Main ** search input **
  * ** Chamber / Party / State ** selects
  * ** Congress ** selector
  * Recent bills table:

  * ** Filter selector ** (All / Sponsored / Co - sponsored / etc)
  * ** Sort selector ** (Date / Topic / …)
  * ** Date range inputs ** (from / to) and calendar icon

Goal: same height, same border radius, same focus ring as each other and as the Button.

  We’ll create:

* `TextInput` component(for search, date text fields)
* `Select` component(for dropdowns)
* Shared CSS class for base field: `form-field` or similar

---

### D. `Chip` / `Pill`

Used for:

* ** State pill with “x”** (State: AR ×)
* Potentially any filter “tags” you’ll add later
  * “State: AR” chip in search field area

Variants:

* `filled`(solid light background)
  * `outline`(thin border)
  * `removable`(`onRemove` → shows × affordance)

---

### E. `Link` styles

Used for:

* ** Bill title link ** (Recent bills table)
* ** Bill link ** in Recent votes table
  * Possibly “+17 more” under donut

We just need:

* Base inline link style(color, hover underline)
  * “Quiet” link style if something should look less shouty(e.g., + more)

---

### F. `IconButton`

Used for:

* ** Sort asc / desc arrow ** button in Recent bills table
  * Any tiny icon - only controls(e.g., future collapse, etc.)

Small, circular, same focus ring and hover behavior as other controls.

---

## 2. How I’d like you to send code

To keep it manageable, let’s do this in ** batches **:

### Batch 1 – Home + Search

Paste / upload:

1. JSX / HTML + CSS for:

   * Home “Subjects over time” timeframe buttons
  * Search page:

     * Search input + “Clear” button
  * Congress select
    * Chamber / Party / State controls + State pill
      * View profile button on member cards(including hover)

### Batch 2 – Member page

  * Back button
    * Legislative activity chart filter buttons(All / Sponsored / Co - sponsored)
      * Recent votes “Show more votes” button
        * Bill links in the table(if they have a special class)

### Batch 3 – Recent bills widget

  * Donut mode toggle(Policy areas vs Leg Topics)
    * “+ more” link / button
      * Recent bills table:

  * Sort arrow button
  * Filter select / date range inputs / date picker triggers
    * Title links

---

## 3. What I’ll do with each batch

For each batch you paste:

1. ** Identify patterns / mismatches **

   * e.g., “this View profile button uses 10px radius, this Back button uses 6px”
2. ** Propose tokenized CSS **

   * e.g., `--lemur-radius-pill`, `--lemur-color-primary`, `--lemur-shadow-soft`
3. ** Write a reusable React component **

   * `components/ui/Button.jsx`
  * `components/ui/SegmentedControl.jsx`
  * `components/ui/Input.jsx`, `Select.jsx`, `Chip.jsx`, `IconButton.jsx`
4. ** Refactor your existing markup **

   * Show the old JSX → new JSX using the components
   * Keep classNames minimal and consistent

---

  If you’re up for it, start with ** Batch 1(Home + Search) ** — paste the JSX + CSS(or modules) you currently have for those controls, and I’ll turn them into the first round of shared components + a tiny “design system” for Legislation Lemur.


*/