"use client";

import { useEffect, useMemo, useRef, useState } from "react";

function useDebounced(value, ms = 180) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/**
 * Bold the suggested portion (everything AFTER what user typed),
 * only when suggestion begins with typed text (case-insensitive).
 */
function renderCompletionHtml(fullLabel, typed) {
  const L = String(fullLabel || "");
  const Q = String(typed || "").trim();
  if (!Q) return escapeHtml(L);

  const lLow = L.toLowerCase();
  const qLow = Q.toLowerCase();

  if (lLow.startsWith(qLow)) {
    const head = L.slice(0, Q.length);
    const tail = L.slice(Q.length);
    return tail
      ? `${escapeHtml(head)}<strong class="ll3-auto__suggested">${escapeHtml(tail)}</strong>`
      : escapeHtml(L);
  }

  // no bolding if not a prefix match (keeps it predictable)
  return escapeHtml(L);
}

function submitClosestForm(el) {
  const form = el?.closest?.("form");
  if (!form) return;
  if (form.requestSubmit) form.requestSubmit();
  else form.submit();
}

export default function AutocompleteInputClient({
  id,
  name,
  defaultValue = "",
  placeholder = "",
  endpoint,
  minChars = 2,
  limit = 12,
  autoSubmitOnType = false,
  autoSubmitOnSelect = false,
  onSelect,
}) {
  const [val, setVal] = useState(defaultValue || "");
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(false);

  const debounced = useDebounced(val, 180);
  const boxRef = useRef(null);

  // fetch suggestions
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const q = debounced.trim();
      if (!q || q.length < minChars) {
        setItems([]);
        setOpen(false);
        return;
      }

      const res = await fetch(
        `${endpoint}?q=${encodeURIComponent(q)}&limit=${limit}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (cancelled) return;

      const next = json.items || [];
      setItems(next);
      setOpen(focused && next.length > 0); // keep visible while focused
    })();

    return () => { cancelled = true; };
  }, [debounced, endpoint, minChars, limit, focused]);

  // close only on outside click (NOT on re-fetch)
  useEffect(() => {
    const onDoc = (e) => {
      if (!boxRef.current) return;
      if (!boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const list = useMemo(() => (items || []).slice(0, limit), [items, limit]);

  return (
    <div ref={boxRef} className="ll3-auto">
      <input
        id={id}
        name={name}
        value={val}
        onFocus={() => {
          setFocused(true);
          if (list.length) setOpen(true);
        }}
        onBlur={() => {
          setFocused(false); // menu will close via outside click or selection
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
          // Optional: allow Enter to submit only if autoSubmitOnType is enabled
          if (e.key === "Enter" && !autoSubmitOnType) {
            e.preventDefault();
          }
        }}
        onChange={(e) => {
          const next = e.target.value;
          setVal(next);
          if (autoSubmitOnType) {
            // debounce already happening; submit on change is too aggressive.
            // If you truly want it, do it after debounce; otherwise remove this.
          }
        }}
        className="ll3-input"
        placeholder={placeholder}
        autoComplete="off"
      />

      {open && list.length ? (
        <div className="ll3-auto__menu" role="listbox" aria-label="Suggestions">
          {list.map((item, idx) => {
            const code = item?.bill_type && item?.bill_number
              ? `${String(item.bill_type).toUpperCase()} ${item.bill_number}`
              : "";

            const title = (item?.display_title || item?.subject || item?.committee_name || "").trim();
            const html = renderCompletionHtml(title, val);

            return (
              <button
                key={item?.bill_id || `${code}-${idx}`}
                type="button"
                className="ll3-auto__item"
                onMouseDown={(e) => e.preventDefault()} // prevents blur before click
                onClick={(e) => {
                  // what goes into the input:
                  // - for bills query: you might want just the typed term, not full title.
                  // for now set to title:
                  setVal(title);
                  setOpen(false);

                  if (autoSubmitOnSelect) {
                    // submit *after* val updates
                    requestAnimationFrame(() => submitClosestForm(e.currentTarget));
                  }

                  if (onSelect) onSelect(item, title);
                }}
              >
                <div className="ll3-auto__row">
                  {code ? <span className="ll3-auto__code">{code}</span> : null}
                  <span
                    className="ll3-auto__title"
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
