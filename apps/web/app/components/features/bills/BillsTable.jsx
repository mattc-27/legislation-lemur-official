"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Clock3, Landmark, TrendingUp, Zap } from "lucide-react";
import { fmtDate } from "@/lib/domains/bills/format";
import { STATUS_META, normalizeStatusKey } from "@/lib/domains/bills/meta";
import ExplorerSignalCell from "@/app/components/shared/explorer/results/ExplorerSignalCell";

function getBillSummary(bill) {
  return bill?.summary_short || bill?.summary_text_plain || null;
}

export default function BillsTable({
  rows = [],
  groups = [],
  maxHeight = 520,
  selectedTopic,
  mode = "page",
  initialLimit = 18,
  pageSize = 18,
}) {
  const isPanel = mode === "panel";

  const [subject, setSubject] = useState(selectedTopic || "");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState("latest_action_date");
  const [sortDir, setSortDir] = useState("desc");
  const [visibleLimit, setVisibleLimit] = useState(initialLimit);

  useEffect(() => {
    setSubject(selectedTopic || "");
  }, [selectedTopic]);

  const filtered = useMemo(() => {
    const next = [...rows];

    return next
      .filter((r) => {
        const haystack = [
          r.display_title,
          r.policy_area,
          r.subject,
          ...(Array.isArray(r.subjects) ? r.subjects : []),
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (subject && !haystack.includes(subject.toLowerCase())) return false;

        const dateValue = r.latest_action_date || r.introduced_date;
        if (from && dateValue < from) return false;
        if (to && dateValue > to) return false;

        return true;
      })
      .sort((a, b) => {
        const av = a?.[sortKey] || "";
        const bv = b?.[sortKey] || "";

        if (av === bv) return 0;

        const result = av > bv ? 1 : -1;
        return sortDir === "asc" ? result : -result;
      });
  }, [rows, subject, from, to, sortKey, sortDir]);

  useEffect(() => {
    setVisibleLimit(initialLimit);
  }, [initialLimit, subject, from, to, sortKey, sortDir, selectedTopic]);

  const visibleRows = isPanel ? filtered.slice(0, visibleLimit) : filtered;
  const hasMore = isPanel && filtered.length > visibleLimit;

  function showMore() {
    setVisibleLimit((n) => Math.min(filtered.length, n + pageSize));
  }

  function showFewer() {
    setVisibleLimit(initialLimit);
  }

  return (
    <div className="billtable" style={{ "--billtable-max-height": `${maxHeight}px` }}>
      <div className="billtable__controls">
        <div className="billtable__control ll3-field">
          <label className="billtable__label ll3-label" htmlFor="billtable-subject">
            Topic
          </label>
          <input
            id="billtable-subject"
            className="field ll3-dateInput"
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            placeholder="Filter topic…"
          />
        </div>

        <div className="billtable__control ll3-field">
          <label className="billtable__label ll3-label" htmlFor="billtable-from">
            From
          </label>
          <input
            id="billtable-from"
            className="field ll3-dateInput"
            type="date"
            value={from}
            onChange={(event) => setFrom(event.target.value)}
          />
        </div>

        <div className="billtable__control ll3-field">
          <label className="billtable__label ll3-label" htmlFor="billtable-to">
            To
          </label>
          <input
            id="billtable-to"
            className="field ll3-dateInput"
            type="date"
            value={to}
            onChange={(event) => setTo(event.target.value)}
          />
        </div>

        <div className="billtable__control ll3-field">
          <label className="billtable__label ll3-label" htmlFor="billtable-sort">
            Sort
          </label>
          <select
            id="billtable-sort"
            className="field ll3-select"
            value={`${sortKey}:${sortDir}`}
            onChange={(event) => {
              const [nextKey, nextDir] = event.target.value.split(":");
              setSortKey(nextKey);
              setSortDir(nextDir);
            }}
          >
            <option value="latest_action_date:desc">Latest action</option>
            <option value="introduced_date:desc">Newest introduced</option>
            <option value="introduced_date:asc">Oldest introduced</option>
          </select>
        </div>
      </div>

      {isPanel ? (
        <>
          <div className="billtable__cards">
            {visibleRows.map((r) => {
              const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
              const href = `/bills/${slug}`;
              const billCode = `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;
              const statusKey = normalizeStatusKey(r.status_code);
              const sm = STATUS_META[statusKey] || STATUS_META.introduced;
              const summary = getBillSummary(r);

              return (
                <article className="billtable__card" key={r.bill_id || slug}>
                  <div className="billtable__cardTop">
                    <Link href={href} className="ll3-table__billCode">
                      {billCode}
                    </Link>
                    <span className={`ll3-status ll3-status--${sm.tone}`}>
                      <span className="ll3-status__dot" aria-hidden="true" />
                      <span className="ll3-status__label">{sm.label}</span>
                    </span>
                  </div>

                  <Link href={href} className="ll3-table__titleLink">
                    {r.display_title}
                  </Link>

                  <div className="ll3-table__metaLine">
                    Sponsor: {r.sponsor_name || "—"}
                    {Number.isFinite(r.cosponsor_count)
                      ? ` • ${r.cosponsor_count} cosponsors`
                      : ""}
                  </div>

                  <div className={summary ? "ll3-table__summary" : "ll3-table__summary ll3-muted"}>
                    {summary || "Summary not available."}
                  </div>
                </article>
              );
            })}
          </div>

          {filtered.length > initialLimit ? (
            <div className="billtable__footerActions">
              {hasMore ? (
                <button
                  type="button"
                  className="ll3-disclosureBtn billtable__showMore"
                  onClick={showMore}
                  aria-expanded="false"
                >
                  Show {Math.min(pageSize, filtered.length - visibleLimit)} more
                </button>
              ) : (
                <button
                  type="button"
                  className="ll3-disclosureBtn billtable__showMore"
                  onClick={showFewer}
                  aria-expanded="true"
                >
                  Show fewer
                </button>
              )}

              <span className="billtable__visibleCount">
                Showing {visibleRows.length} of {filtered.length}
              </span>
            </div>
          ) : null}
        </>
      ) : (
        <div className="ll3-tableWrap">
          <table className="ll3-table" role="table">
            <thead>
              <tr>
                <th className="ll3-table__colId">ID</th>
                <th className="ll3-table__colTitle">Title</th>
                <th className="ll3-table__colProcess">Process</th>
                <th className="ll3-table__colAction">Latest action</th>
                <th className="ll3-table__colSignals">Signals</th>
              </tr>
            </thead>

            <tbody>
              {visibleRows.map((r) => {
                const slug = `${r.bill_type}-${r.bill_number}-${r.congress}`.toLowerCase();
                const href = `/bills/${slug}`;
                const billCode = `${String(r.bill_type || "").toUpperCase()}. ${r.bill_number}`;
                const statusKey = normalizeStatusKey(r.status_code);
                const sm = STATUS_META[statusKey] || STATUS_META.introduced;
                const summary = getBillSummary(r);

                return (
                  <tr key={r.bill_id || slug}>
                    <td className="ll3-table__id">
                      <Link href={href} className="ll3-table__billCode">
                        {billCode}
                      </Link>
                    </td>

                    <td className="ll3-table__titleCol">
                      <Link href={href} className="ll3-table__titleLink">
                        {r.display_title}
                      </Link>

                      <div className="ll3-table__metaLine">
                        Sponsor: {r.sponsor_name || "—"}
                        {Number.isFinite(r.cosponsor_count)
                          ? ` • ${r.cosponsor_count} cosponsors`
                          : ""}
                      </div>

                      <div className={summary ? "ll3-table__summary" : "ll3-table__summary ll3-muted"}>
                        {summary || "Summary not available."}
                      </div>
                    </td>

                    <td className="ll3-table__process">
                      <div className="ll3-table__chamber">
                        <Landmark size={13} aria-hidden="true" />
                        {r.origin_chamber || "—"}
                      </div>

                      <span className={`ll3-status ll3-status--${sm.tone}`}>
                        <span className="ll3-status__dot" aria-hidden="true" />
                        <span className="ll3-status__label">{sm.label}</span>
                      </span>
                    </td>

                    <td className="ll3-table__action">
                      <div className="ll3-table__actionText">
                        {r.latest_action_text || "—"}
                      </div>
                      <div className="ll3-table__actionDate">
                        <Clock3 size={13} aria-hidden="true" />
                        {fmtDate(r.latest_action_date)}
                      </div>
                    </td>

                    <td className="ll3-table__signals">
                      <ExplorerSignalCell
                        label="Impact"
                        value={r.impact_score}
                        icon={<Zap size={13} aria-hidden="true" />}
                      />
                      <ExplorerSignalCell
                        label="Trending"
                        value={r.trending_score}
                        icon={<TrendingUp size={13} aria-hidden="true" />}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}