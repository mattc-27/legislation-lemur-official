"use client";

import { CheckCircle2, XCircle, CircleSlash } from "lucide-react";

export default function VotesTable({ votes = [] }) {
  if (!votes || votes.length === 0) {
    return (
      <p className="llm3-muted votes-table__empty">
        No votes found.
      </p>
    );
  }

  return (
    <div className="votes-list">
      {votes.map((v) => {
        const row = normalizeVote(v);

        return (
          <article key={row.key} className="votes-list__item">
            <div className="votes-list__top">
              <time className="votes-list__date">{row.date}</time>
              <span className={`votes-table__resultBadge ${row.resultMeta.className}`} title={row.resultMeta.label}>
                <row.resultMeta.Icon size={14} aria-hidden="true" />
                <span>{row.resultMeta.shortLabel}</span>
              </span>
            </div>

            <div className="votes-list__measure" title={row.measureText}>
              {row.billUrl && row.measureText !== "—" ? (
                <a href={row.billUrl} target="_blank" rel="noopener noreferrer" className="votes-table__billLink">
                  {row.measureText}
                </a>
              ) : (
                <span className="votes-table__billText">{row.measureText}</span>
              )}
            </div>

            <div className="votes-list__bottom">
              <span className="votes-list__meta">
                {row.roll !== "—" ? `Roll call ${row.roll}` : "Roll call unavailable"}
              </span>

              <span className={`badge ${badgeForVote(row.choice)}`}>
                {prettyVote(row.choice)}
              </span>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* ----- Helpers ----- */

function normalizeVote(v) {
  const date = fmtDateISO(
    v?.voted_at ?? v?.date ?? v?.votedAt ?? v?.vote_date ?? v?.voteDate
  );

  const measureText =
    v?.bill_title ??
    v?.billTitle ??
    v?.bill_display ??
    v?.billDisplay ??
    v?.short_title ??
    v?.shortTitle ??
    v?.bill ??
    v?.question ??
    "—";

  const billUrl = v?.bill_url ?? v?.billUrl ?? null;

  const roll =
    v?.rollcall_number != null && v?.session != null
      ? `${v.session}-${v.rollcall_number}`
      : v?.roll ?? v?.rollcall_number ?? "—";

  const choice = v?.choice ?? v?.position ?? "—";
  const result = v?.result ?? "—";

  const key =
    v?.vote_id ??
    v?.voteId ??
    `${v?.congress ?? ""}-${v?.session ?? ""}-${v?.rollcall_number ?? ""}-${v?.voted_at ?? v?.date ?? ""}`;

  return {
    key,
    date,
    measureText,
    billUrl,
    roll,
    choice,
    resultMeta: resultDisplay(result),
  };
}

function fmtDateISO(s) {
  if (!s) return "—";
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return String(s).slice(0, 10);

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function prettyVote(pos) {
  if (!pos) return "—";
  const p = String(pos).toLowerCase();
  if (p === "yea" || p === "yes" || p === "aye") return "Yea";
  if (p === "nay" || p === "no") return "Nay";
  if (p.includes("present")) return "Present";
  if (p.includes("not voting")) return "Not voting";
  return String(pos);
}

function badgeForVote(pos) {
  if (!pos) return "badge--muted";
  const p = String(pos).toLowerCase();
  if (p === "yea" || p === "yes" || p === "aye") return "badge--success";
  if (p === "nay" || p === "no") return "badge--danger";
  if (p.includes("present")) return "badge--slate";
  if (p.includes("not voting")) return "badge--muted";
  return "badge--slate";
}

function resultDisplay(result) {
  const r = String(result || "").toLowerCase();

  if (r.includes("pass") || r.includes("agreed")) {
    return {
      label: "Passed",
      shortLabel: "Passed",
      className: "is-pass",
      Icon: CheckCircle2,
    };
  }

  if (r.includes("fail") || r.includes("rejected")) {
    return {
      label: "Failed",
      shortLabel: "Failed",
      className: "is-fail",
      Icon: XCircle,
    };
  }

  return {
    label: result || "Other",
    shortLabel: "Other",
    className: "is-other",
    Icon: CircleSlash,
  };
}