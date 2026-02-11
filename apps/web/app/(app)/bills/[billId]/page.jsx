// BillDetailPage.jsx (or your route component)
// NOTE: new, page-scoped class namespace: ll-bill-detail
// This avoids colliding with existing .card/.panel/.chip etc in other pages.

// app/(app)/bills/[billId]/page.jsx

import Link from "next/link";
import { notFound } from "next/navigation";

import SectionBoundary from "@/app/components/ui/system/SectionBoundary";

import {
  getBillDetail,
  getBillActions,
  getBillTextVersions,
  getBillCosponsors,
  getBillCommittees,
  getBillRelated,
} from "@/lib/server/routes_stage/bills";

import {
  ArrowLeft,
  ArrowUpRight,
  Calendar,
  Clock3,
  FileText,
  GitCommit,
  Landmark,
  Tags,
  Users,
  User,
  Building2,
  ExternalLink,
  Link2,
} from "lucide-react";

import '@/app/styles/active/ll-bill-detail.css';

// ---------- helpers ----------
const fmtDate = (v) => {
  if (!v) return "—";
  try {
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toISOString().slice(0, 10);
  } catch {
    return String(v);
  }
};

// Status meta (dot colors + label + hover description)
const STATUS_META = {
  introduced: { label: "Introduced", desc: "Bill introduced in its chamber of origin.", tone: "introduced" },
  committee: { label: "Committee", desc: "Referred to or considered in committee.", tone: "committee" },
  reported: { label: "Reported", desc: "Reported out of committee.", tone: "reported" },
  passed_house: { label: "Passed House", desc: "Passed in the House.", tone: "passed" },
  passed_senate: { label: "Passed Senate", desc: "Passed in the Senate.", tone: "passed" },
  to_president: { label: "To President", desc: "Sent to the President for action.", tone: "final" },
  became_law: { label: "Became Law", desc: "Enacted into law.", tone: "law" },
  vetoed: { label: "Vetoed", desc: "Vetoed by the President.", tone: "veto" },
};

const normalizeStatusKey = (statusCode) => {
  if (!statusCode) return "introduced";
  const s = String(statusCode).toLowerCase();
  if (STATUS_META[s]) return s;

  if (s.includes("committee")) return "committee";
  if (s.includes("introduced")) return "introduced";
  if (s.includes("reported")) return "reported";
  if (s.includes("passed") && s.includes("house")) return "passed_house";
  if (s.includes("passed") && s.includes("senate")) return "passed_senate";
  if (s.includes("president")) return "to_president";
  if (s.includes("law") || s.includes("enacted")) return "became_law";
  if (s.includes("veto")) return "vetoed";

  return "introduced";
};

// Subject icon mapping (starter set)
const SUBJECT_ICONS = {
  Health: { icon: Landmark },
  Energy: { icon: Landmark },
  Judiciary: { icon: Landmark },
  Agriculture: { icon: Landmark },
  Transportation: { icon: Landmark },
  "National Security": { icon: Landmark },
  Immigration: { icon: Landmark },
  "International Affairs": { icon: Landmark },
};

function SubjectChip({ name }) {
  const key = String(name || "");
  const Icon = SUBJECT_ICONS[key]?.icon || Tags;
  return (
    <span className="llbd3-subject" title={key}>
      <Icon size={14} aria-hidden="true" />
      <span className="llbd3-subject__label">{key}</span>
    </span>
  );
}

export default async function BillPage({ params }) {
  const { billId } = params;

  const slug = decodeURIComponent((billId ?? "").toString().trim()).toLowerCase();
  const [type, numberStr, congressStr] = slug.split("-");

  const number = Number(numberStr);
  const congress = Number(congressStr);

  if (!type || !Number.isFinite(number) || !Number.isFinite(congress)) return notFound();

  const [bill, actions, texts, cosponsors, committees, related] = await Promise.all([
    getBillDetail({ type, number, congress }),
    getBillActions({ type, number, congress, limit: 50 }),
    getBillTextVersions({ type, number, congress }),
    getBillCosponsors({ type, number, congress, limit: 50 }),
    getBillCommittees({ type, number, congress }),
    getBillRelated({ type, number, congress }),
  ]);

  if (!bill) return notFound();

  // ✅ Define sm HERE (this fixes your ReferenceError)
  const statusKey = normalizeStatusKey(bill.status_code);
  const sm = STATUS_META[statusKey] || STATUS_META.introduced;

  const billLabel = `${bill.type?.toUpperCase()}. ${bill.number}`;
  const billSubtitle = bill.title || bill.display_title || "—";

  // Normalize data shapes (in case some calls return {rows,total,more})
  const actionRows = Array.isArray(actions?.rows) ? actions.rows : (Array.isArray(actions) ? actions : []);
  const textRows = Array.isArray(texts?.rows) ? texts.rows : (Array.isArray(texts) ? texts : []);
  const cosponsorObj = cosponsors?.rows ? cosponsors : { rows: Array.isArray(cosponsors) ? cosponsors : [], total: 0, more: false };
  const committeeRows = Array.isArray(committees?.rows) ? committees.rows : (Array.isArray(committees) ? committees : []);
  const relatedRows = Array.isArray(related?.rows) ? related.rows : (Array.isArray(related) ? related : []);

  const subjects = Array.isArray(bill.subjects) ? bill.subjects : [];

  return (
    <div className="llbd3-page">
      <div className="llbd3-wrap">
        {/* Top */}
        <header className="llbd3-top">
          <div className="llbd3-top__row">
            <Link className="llbd3-back" href="/bills">
              <ArrowLeft size={16} aria-hidden="true" />
              Back
            </Link>

            {bill.url ? (
              <a className="llbd3-btn llbd3-btn--primary" href={bill.url} target="_blank" rel="noreferrer">
                <ExternalLink size={16} aria-hidden="true" />
                Congress.gov
              </a>
            ) : (
              <span className="llbd3-muted">No external link</span>
            )}
          </div>

          <div className="llbd3-head">
            <div className="llbd3-eyebrow">
              <span className="llbd3-eyebrow__item">{bill.congress}th Congress</span>
              <span className="llbd3-eyebrow__sep">•</span>
              <span className="llbd3-eyebrow__item">{bill.origin_chamber || "—"}</span>
            </div>

            <div className="llbd3-titleRow">
              <h1 className="llbd3-h1">{billLabel}</h1>

              <span
                className={`llbd3-status llbd3-status--${sm.tone}`}
                title={`${sm.label}: ${sm.desc}`}
                aria-label={`${sm.label}. ${sm.desc}`}
              >
                <span className="llbd3-status__dot" aria-hidden="true" />
                <span className="llbd3-status__label">{sm.label}</span>
              </span>
            </div>

            <p className="llbd3-subtitle">{billSubtitle}</p>
          </div>
        </header>

        {/* Hero */}
        <section className="llbd3-hero">
          <div className="llbd3-hero__grid">
            <div className="llbd3-hero__primary">
              <div className="llbd3-hero__kicker">
                <Clock3 size={14} aria-hidden="true" />
                Latest action
              </div>
              <div className="llbd3-hero__date">{fmtDate(bill.latest_action_date)}</div>
              <div className="llbd3-hero__text">{bill.latest_action_text || "—"}</div>
            </div>

            <div className="llbd3-hero__meta">
              <div className="llbd3-kv">
                <div className="llbd3-kv__k">
                  <Calendar size={14} aria-hidden="true" />
                  Introduced
                </div>
                <div className="llbd3-kv__v">{fmtDate(bill.introduced_date)}</div>
              </div>

              <div className="llbd3-kv">
                <div className="llbd3-kv__k">
                  <Users size={14} aria-hidden="true" />
                  Cosponsors
                </div>
                <div className="llbd3-kv__v">{bill.cosponsor_count ?? cosponsorObj.total ?? "—"}</div>
              </div>

              <div className="llbd3-kv">
                <div className="llbd3-kv__k">
                  <Landmark size={14} aria-hidden="true" />
                  Origin
                </div>
                <div className="llbd3-kv__v">{bill.origin_chamber || "—"}</div>
              </div>

              <div className="llbd3-kv llbd3-kv--subjects">
                <div className="llbd3-kv__k">
                  <Tags size={14} aria-hidden="true" />
                  Subjects
                </div>
                <div className="llbd3-subjectRow">
                  {subjects.slice(0, 8).map((s, i) => (
                    <SubjectChip key={`${String(s)}-${i}`} name={s} />
                  ))}
                  {subjects.length > 8 && (
                    <span className="llbd3-subject llbd3-subject--more" title={subjects.join(", ")}>
                      +{subjects.length - 8}
                    </span>
                  )}
                  {subjects.length === 0 && <span className="llbd3-muted">—</span>}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Body */}
        <div className="llbd3-body">
          <main className="llbd3-main">
            {/* Key actions */}
            <section className="llbd3-card">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <GitCommit size={18} aria-hidden="true" />
                  Key actions
                </h2>
              </div>

              <ol className="llbd3-timeline">
                {actionRows.map((a) => (
                  <li key={a.id || `${a.action_date}-${a.action_text}`} className="llbd3-timeline__item">
                    <div className="llbd3-timeline__rail">
                      <div className="llbd3-timeline__dot" />
                    </div>

                    <div className="llbd3-timeline__content">
                      <div className="llbd3-timeline__meta">
                        <span className="llbd3-timeline__date">{fmtDate(a.action_date)}</span>
                        {(a.action_type || a.action_code) && (
                          <span className="llbd3-timeline__type" title={a.action_type || a.action_code}>
                            {a.action_type || a.action_code}
                          </span>
                        )}
                      </div>
                      <div className="llbd3-timeline__text">{a.action_text}</div>
                    </div>
                  </li>
                ))}

                {actionRows.length === 0 && <div className="llbd3-muted llbd3-small">No actions recorded.</div>}
              </ol>
            </section>

            {/* Bill text versions */}
            <section className="llbd3-card">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <FileText size={18} aria-hidden="true" />
                  Bill text versions
                </h2>
              </div>

              <ul className="llbd3-docs">
                {textRows.map((t) => (
                  <li key={t.id || `${t.version_code}-${t.version_date}`}>
                    <a className="llbd3-doc" href={t.format_url} target="_blank" rel="noreferrer">
                      <div className="llbd3-doc__left">
                        <div className="llbd3-doc__title">
                          {t.version_code} · {t.format_type}
                        </div>
                        <div className="llbd3-doc__sub">{fmtDate(t.version_date)}</div>
                      </div>
                      <ArrowUpRight size={18} aria-hidden="true" />
                    </a>
                  </li>
                ))}
                {textRows.length === 0 && <div className="llbd3-muted llbd3-small">No text versions found.</div>}
              </ul>
            </section>

            {/* Related bills */}
            <section className="llbd3-card">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <Link2 size={18} aria-hidden="true" />
                  Related bills
                </h2>
              </div>

              {relatedRows.length ? (
                <ul className="llbd3-list">
                  {relatedRows.map((r) => {
                    const relSlug = `${r.related_type}-${r.related_number}-${r.related_congress}`.toLowerCase();
                    return (
                      <li key={r.id || relSlug} className="llbd3-list__item">
                        <Link href={`/bills/${relSlug}`} className="llbd3-link">
                          {r.related_type.toUpperCase()}. {r.related_number} ({r.related_congress})
                        </Link>
                        {r.relationship_type && <span className="llbd3-muted llbd3-small"> · {r.relationship_type}</span>}
                        {r.latest_action_text && <div className="llbd3-muted llbd3-small llbd3-mt-6">{r.latest_action_text}</div>}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="llbd3-muted llbd3-small">No related bills listed.</div>
              )}
            </section>
          </main>

          <aside className="llbd3-side">
            {/* Sponsor */}
            <section className="llbd3-card llbd3-card--soft">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <User size={18} aria-hidden="true" />
                  Sponsor
                </h2>
              </div>

              {bill.sponsor_bioguide_id ? (
                <Link href={`/members/${bill.sponsor_bioguide_id}`} className="llbd3-chipLink">
                  <User size={16} aria-hidden="true" />
                  {bill.sponsor_name || bill.sponsor_bioguide_id}
                </Link>
              ) : (
                <div className="llbd3-muted llbd3-small">Unknown</div>
              )}
            </section>

            {/* Cosponsors */}
            <section className="llbd3-card llbd3-card--soft">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <Users size={18} aria-hidden="true" />
                  Cosponsors <span className="llbd3-count">({cosponsorObj.total || cosponsorObj.rows.length})</span>
                </h2>
              </div>

              <ul className="llbd3-sideList">
                {cosponsorObj.rows.map((c) => (
                  <li key={`${c.member_id}-${c.joined_at}`} className="llbd3-sideList__item">
                    <Link href={`/members/${c.member_id}`} className="llbd3-link">
                      {c.name || c.member_id}
                    </Link>
                    <div className="llbd3-muted llbd3-small llbd3-mt-6">
                      {c.role}
                      {c.is_original ? " · original" : ""} · {fmtDate(c.joined_at)}
                    </div>
                  </li>
                ))}
                {cosponsorObj.rows.length === 0 && <div className="llbd3-muted llbd3-small">None listed.</div>}
              </ul>

              {cosponsorObj.more && (
                <div className="llbd3-muted llbd3-small llbd3-mt-10">
                  Showing first {cosponsorObj.rows.length}.{" "}
                  <a
                    className="llbd3-link"
                    href={`https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type}/${bill.number}/cosponsors`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    See all on Congress.gov
                  </a>
                </div>
              )}
            </section>

            {/* Committees */}
            <section className="llbd3-card llbd3-card--soft">
              <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                  <Building2 size={18} aria-hidden="true" />
                  Committees
                </h2>
              </div>

              {committeeRows.length ? (
                <ul className="llbd3-sideList">
                  {committeeRows.map((k) => (
                    <li key={k.id} className="llbd3-sideList__item">
                      <div className="llbd3-pillRow">
                        <span className="llbd3-pill">{k.committee_name}</span>
                      </div>
                      <div className="llbd3-muted llbd3-small llbd3-mt-6">
                        {k.committee_chamber} · {k.committee_type}
                        {k.activities?.length ? ` · ${k.activities.length} activities` : ""}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="llbd3-muted llbd3-small">No committees associated.</div>
              )}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}