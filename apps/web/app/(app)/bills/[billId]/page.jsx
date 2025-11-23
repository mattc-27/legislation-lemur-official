// app/(app)/bills/[billId]/page.jsx

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getBillDetail,
  getBillActions,
  getBillTextVersions,
  getBillCosponsors,
  getBillCommittees,
  getBillRelated,
} from "../../../../lib/server/bills";

import "../../../../lib/stylesheets/refactored/home-styles.refactored.css";
import "../../../../lib/stylesheets/bill-page.css";

const fmtDate = (d) => {
  if (!d) return "";
  const dt = typeof d === "string" ? new Date(d) : d;
  return Number.isNaN(dt.getTime()) ? "" : dt.toISOString().slice(0, 10);
};

export const revalidate = 600;

export default async function BillPage({ params }) {
  // ❌ no await here
  const { billId } = params;

  const slug = decodeURIComponent((billId ?? "").toString().trim()).toLowerCase();
  const [type, numberStr, congressStr] = slug.split("-");

  const number = Number(numberStr);
  const congress = Number(congressStr);

  if (!type || !Number.isFinite(number) || !Number.isFinite(congress)) {
    return notFound();
  }

  const [bill, actions, texts, cosponsors, committees, related] =
    await Promise.all([
      getBillDetail({ type, number, congress }),
      getBillActions({ type, number, congress, limit: 50 }),
      getBillTextVersions({ type, number, congress }),
      getBillCosponsors({ type, number, congress, limit: 50 }),
      getBillCommittees({ type, number, congress }),
      getBillRelated({ type, number, congress }),
    ]);

  if (!bill) return notFound();

  const billLabel = `${bill.type.toUpperCase()}. ${bill.number}`;

  return (
    <div className="member-page bill-detail stack-24">
      {/* Top header — align with MemberAbout typography */}
      <header className="bill-detail__header">
        <p className="bill-detail__eyebrow">
          {bill.congress}th Congress · {bill.origin_chamber}
        </p>
        <h1 className="bill-detail__title">{billLabel}</h1>
        <p className="bill-detail__subtitle">{bill.title}</p>
      </header>

      {/* Hero card */}
      <section className="card card--p-24 bill-hero">
        <div className="bill-hero__header">
          <span className={`status status--${bill.status_code}`}>
            {(bill.status_code || "").replace("_", " ")}
          </span>
          <div className="bill-hero__dates">
            <span className="muted">Introduced</span> {fmtDate(bill.introduced_date)}
            <span className="sep">•</span>
            <span className="muted">Latest</span> {fmtDate(bill.latest_action_date)}
          </div>
        </div>

        <div className="bill-hero__grid">
          <div className="bill-hero__cell">
            <div className="bill-hero__label">Origin chamber</div>
            <div className="bill-hero__value">
              <span
                className={`pill pill--${(bill.origin_chamber || "").toLowerCase()}`}
              >
                {bill.origin_chamber}
              </span>
            </div>
          </div>

          <div className="bill-hero__cell">
            <div className="bill-hero__label">Cosponsors</div>
            <div className="bill-hero__value">{bill.cosponsor_count ?? "—"}</div>
          </div>

          <div className="bill-hero__cell bill-hero__cell--wide">
            <div className="bill-hero__label">Latest action</div>
            <div className="bill-hero__value">{bill.latest_action_text}</div>
          </div>

          <div className="bill-hero__cell bill-hero__cell--wide">
            <div className="bill-hero__label">Subjects</div>
            <div className="bill-hero__value bill-hero__chips">
              {(bill.subjects || []).slice(0, 10).map((s, i) => (
                <span key={i} className="chip">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Body: 2-col on desktop, stacked on mobile */}
      <div className="bill-detail__body">
        {/* Main column */}
        <div className="bill-detail__main stack-24">
          {/* Actions timeline */}
          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">Key actions</h2>
            </div>

            <ol className="timeline">
              {actions.map((a) => (
                <li key={a.id} className="timeline__item">
                  <div className="timeline__dot" />
                  <div className="timeline__content">
                    <div className="timeline__meta">
                      <span className="timeline__date">
                        {fmtDate(a.action_date)}
                      </span>
                      {(a.action_type || a.action_code) && (
                        <span className="timeline__type">
                          {a.action_type || a.action_code}
                        </span>
                      )}
                    </div>
                    <div className="timeline__text">{a.action_text}</div>
                  </div>
                </li>
              ))}
              {actions.length === 0 && (
                <div className="muted small">No actions recorded.</div>
              )}
            </ol>
          </section>

          {/* Text versions */}
          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">Bill text versions</h2>
            </div>
            <ul className="doc-list">
              {texts.map((t) => (
                <li key={t.id} className="doc-list__item">
                  <a
                    className="doc-link"
                    href={t.format_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="doc-link__title">
                      {t.version_code} · {t.format_type}
                    </span>
                    <span className="doc-link__meta">
                      {fmtDate(t.version_date)}
                    </span>
                  </a>
                </li>
              ))}
              {texts.length === 0 && (
                <div className="muted small">No text versions found.</div>
              )}
            </ul>
          </section>

          {/* Related bills */}
          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">Related bills</h2>
            </div>
            {related.length ? (
              <ul className="bill-related__list">
                {related.map((r) => {
                  const relSlug = `${r.related_type}-${r.related_number}-${r.related_congress}`.toLowerCase();
                  return (
                    <li key={r.id} className="bill-related__item">
                      <Link href={`/bills/${relSlug}`} className="bill-related__link">
                        {r.related_type.toUpperCase()}. {r.related_number} (
                        {r.related_congress})
                      </Link>
                      {r.relationship_type && (
                        <span className="muted small">
                          {" "}
                          · {r.relationship_type}
                        </span>
                      )}
                      {r.latest_action_text && (
                        <div className="small muted">
                          {r.latest_action_text}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="muted small">No related bills listed.</div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="bill-detail__sidebar stack-24">
          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">Sponsor</h2>
            </div>
            {bill.sponsor_bioguide_id ? (
              <Link
                href={`/members/${bill.sponsor_bioguide_id}`}
                className="chip chip--link"
              >
                {bill.sponsor_name || bill.sponsor_bioguide_id}
              </Link>
            ) : (
              <div className="muted small">Unknown</div>
            )}
          </section>

          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">
                Cosponsors ({cosponsors.total || cosponsors.length})
              </h2>
            </div>
            <ul className="bill-cosponsors__list">
              {cosponsors.rows?.map((c) => (
                <li key={`${c.member_id}-${c.joined_at}`} className="bill-cosponsors__item">
                  <Link href={`/members/${c.member_id}`} className="bill-cosponsors__link">
                    {c.name || c.member_id}
                  </Link>
                  <span className="muted small">
                    {" "}
                    · {c.role}
                    {c.is_original ? " · original" : ""} · {fmtDate(c.joined_at)}
                  </span>
                </li>
              ))}
              {(cosponsors.rows?.length ?? 0) === 0 && (
                <div className="muted small">None listed.</div>
              )}
            </ul>
            {cosponsors.more && (
              <div className="small bill-cosponsors__more">
                Showing first {cosponsors.rows.length}.{" "}
                <Link
                  href={`https://www.congress.gov/bill/${bill.congress}th-congress/${bill.type}/${bill.number}/cosponsors`}
                  target="_blank"
                >
                  See all on Congress.gov
                </Link>
              </div>
            )}
          </section>

          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">Committees</h2>
            </div>
            {committees.length ? (
              <ul className="bill-committees__list">
                {committees.map((k) => (
                  <li key={k.id} className="bill-committees__item">
                    <span className="chip">{k.committee_name}</span>
                    <div className="small muted">
                      {k.committee_chamber} · {k.committee_type}
                      {k.activities?.length
                        ? ` · ${k.activities.length} activities`
                        : ""}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="muted small">No committees associated.</div>
            )}
          </section>

          <section className="card card--p-24">
            <div className="panel__header">
              <h2 className="panel__title">External</h2>
            </div>
            {bill.url ? (
              <a
                href={bill.url}
                target="_blank"
                rel="noreferrer"
                className="btn btn--primary btn--full"
              >
                View on Congress.gov
              </a>
            ) : (
              <div className="muted small">No external URL recorded.</div>
            )}
          </section>
        </aside>
      </div>

      <div className="pager bill-detail__pager">
        <Link className="btn btn--ghost" href="/bills">
          ← Back to Bills
        </Link>
      </div>
    </div>
  );
}
