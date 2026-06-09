"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Loader2, Search, X } from "lucide-react";
import SearchPreviewDropdown from "./SearchPreviewDropdown";

function useDebounced(value, ms = 260) {
  const [v, setV] = useState(value);

  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);

  return v;
}

export default function GlobalSearchBoxClient({
  popularSearches = [],
  initialQuery = "",
  mode,
  variant,
  placeholder = "Search bills, members, committees, topics, votes…",
  showPopular,
  showPreview = true,
  submitPath = "/search",
  ariaLabel = "Search Legislation Lemur",
}) {
  const resolvedMode = variant || mode || "home";
  const shouldShowPopular =
    typeof showPopular === "boolean"
      ? showPopular
      : resolvedMode === "home";

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [submitting, setSubmitting] = useState(false);
  const [q, setQ] = useState(initialQuery || "");
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const boxRef = useRef(null);
  const inputRef = useRef(null);
  const debounced = useDebounced(q, 260);

  const trimmed = debounced.trim();
  const inputTrimmed = q.trim();
  const isBusy = loading || submitting;

  useEffect(() => {
    setSubmitting(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    setQ(initialQuery || "");
  }, [initialQuery]);

  useEffect(() => {
    const onDoc = (event) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(event.target)) setOpen(false);
    };

    const onKey = (event) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!showPreview) return;

    let cancelled = false;

    async function run() {
      const query = trimmed;

      if (query.length < 2) {
        setResults(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const res = await fetch(
          `/api/search/preview?q=${encodeURIComponent(query)}&limit=6`,
          { cache: "no-store" }
        );

        const json = await res.json();
        if (cancelled) return;

        setResults(json);
        setOpen(true);
      } catch {
        if (!cancelled) {
          setResults({ rows: [], grouped: {}, error: true });
          setOpen(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
  }, [trimmed, showPreview]);

  const groupedResults = useMemo(() => {
    const rows = results?.rows || [];
    const groups = [];

    for (const type of ["state", "member", "committee", "seat", "bill"]) {
      const items = rows.filter((row) => row.entity_type === type);
      if (items.length) groups.push({ type, items });
    }

    return groups;
  }, [results]);

  function submitSearch(queryValue = inputTrimmed || trimmed) {
    const query = String(queryValue || "").trim();
    if (!query) return;

    setOpen(false);
    setSubmitting(true);

    router.push(`${submitPath}?q=${encodeURIComponent(query)}`);
  }

  function onSubmit(event) {
    event.preventDefault();
    submitSearch();
  }

  function applyPopularSearch(item) {
    setQ(item.q);
    setOpen(true);
    requestAnimationFrame(() => inputRef.current?.focus());
  }

  const rootClass = [
    "ll3-globalSearch",
    resolvedMode ? `ll3-globalSearch--${resolvedMode}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={rootClass}
      ref={boxRef}
      data-loading={isBusy ? "true" : "false"}
    >
      <form className="ll3-globalSearch__form" onSubmit={onSubmit}>
        <Search size={22} className="ll3-globalSearch__icon" aria-hidden="true" />

        <input
          ref={inputRef}
          className="ll3-globalSearch__input"
          type="search"
          value={q}
          onChange={(event) => {
            setQ(event.target.value);
            if (showPreview) setOpen(true);
          }}
          onFocus={() => {
            if (showPreview && trimmed.length >= 2) setOpen(true);
          }}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />

        {q ? (
          <button
            className="ll3-globalSearch__clear"
            type="button"
            aria-label="Clear search"
            onClick={() => {
              setQ("");
              setResults(null);
              setOpen(false);
              inputRef.current?.focus();
            }}
          >
            <X size={16} />
          </button>
        ) : null}

        <button
          className="ll3-globalSearch__button"
          type="submit"
          aria-label={isBusy ? "Searching" : "Search"}
          disabled={submitting}
        >
          {isBusy ? (
            <Loader2 size={18} className="ll3-globalSearch__spin" />
          ) : (
            <ArrowRight size={21} />
          )}
          <span className="ll3-globalSearch__buttonText">
            {isBusy ? "Searching" : "Search"}
          </span>
        </button>
      </form>

      {shouldShowPopular && popularSearches.length ? (
        <div className="ll3-globalSearch__popular" aria-label="Popular searches">
          <div className="ll3-globalSearch__popularLabel">Popular searches</div>
          <div className="ll3-globalSearch__popularPills">
            {popularSearches.map((item) => (
              <button
                key={item.q}
                type="button"
                className="ll3-globalSearch__pill"
                onClick={() => applyPopularSearch(item)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showPreview ? (
        <SearchPreviewDropdown
          open={open}
          query={inputTrimmed || trimmed}
          loading={loading}
          results={results}
          groupedResults={groupedResults}
        />
      ) : null}
    </div>
  );
}