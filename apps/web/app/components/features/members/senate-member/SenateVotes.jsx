// components/member/SenateVotes.jsx
import { ExternalLink, Landmark } from "lucide-react";

export default function SenateVotes({ groups = [] }) {
    if (!groups || groups.length === 0) {
        return <p className="llm3-muted">No Senate votes found.</p>;
    }

    return (
        <div className="llmp3-stack-16 llm3-senVotes">
            {groups.map((g, groupIndex) => {
                const key = `${g.base_measure ?? "vote"}-${g.congress ?? "x"}-${groupIndex}`;
                const title = g.title || g.base_measure || "Senate vote";
                const congressLabel = g.congress ? `${g.congress}th Congress` : "Congress";
                const rows = Array.isArray(g.stages) ? g.stages : [];

                return (
                    <section
                        key={key}
                        className="llmp3-card llmp3-card--soft llm3-senVoteCard"
                        aria-label={`Senate vote: ${title}`}
                    >
                        <header className="llm3-senVoteHead">
                            <div className="llm3-senVoteHead__left">
                                <div className="llm3-senVoteHead__meta">
                                    <span className="llm3-chip llm3-senVoteHead__congressChip">
                                        <Landmark size={14} aria-hidden="true" />
                                        <span>{congressLabel}</span>
                                    </span>
                                </div>

                                <h3 className="llm3-h3 llm3-senVoteHead__title">{title}</h3>

                                {g.link ? (
                                    <a
                                        className="llm3-senVoteHead__link"
                                        href={g.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <span>View on Senate.gov</span>
                                        <ExternalLink size={14} aria-hidden="true" />
                                    </a>
                                ) : null}
                            </div>
                        </header>

                        <div className="llm3-senVoteList" role="list" aria-label="Senate vote stages">
                            {rows.length === 0 ? (
                                <div className="llm3-senVoteEmpty">No vote stages found.</div>
                            ) : (
                                rows.map((s, idx) => {
                                    const rowKey = s.vote_id || `${s.roll ?? ""}-${s.datetime ?? ""}-${idx}`;
                                    const dateLabel = fmtDate(s.datetime);
                                    const question = s.question || "—";
                                    const result = s.result || "—";
                                    const roll = s.roll || "—";
                                    const stageLabel = stageLabelFor(s.label);

                                    return (
                                        <article
                                            key={rowKey}
                                            className="llm3-senVoteItem"
                                            role="listitem"
                                            aria-label={`${title} stage ${idx + 1}`}
                                        >
                                            <div className="llm3-senVoteItem__top">
                                                <div className="llm3-senVoteItem__date">
                                                    {dateLabel}
                                                </div>

                                                <div className="llm3-senVoteItem__topBadges">
                                                    <ResultBadge result={result} />
                                                </div>
                                            </div>

                                            <div className="llm3-senVoteItem__main">
                                                <div className="llm3-senVoteItem__question">
                                                    {question}
                                                </div>

                                                <div className="llm3-senVoteItem__submeta">
                                                    <span className="llm3-senVoteItem__stage">
                                                        {stageLabel}
                                                    </span>
                                                    <span className="llm3-senVoteItem__dot" aria-hidden="true">
                                                        •
                                                    </span>
                                                    <span className="llm3-senVoteItem__roll">
                                                        Roll {roll}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="llm3-senVoteItem__bottom">
                                                <div className="llm3-senVoteItem__pills">
                                                    <span className={`badge ${badgeForVote(s.choice)}`}>
                                                        {prettyVote(s.choice)}
                                                    </span>
                                                    <AlignChip v={s.party_alignment} />
                                                </div>
                                            </div>
                                        </article>
                                    );
                                })
                            )}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function AlignChip({ v }) {
    if (v === "with") return <span className="badge badge--teal">With party</span>;
    if (v === "against") return <span className="badge badge--warning">Against party</span>;
    return <span className="badge badge--muted">Neutral</span>;
}

function ResultBadge({ result }) {
    const r = String(result || "").toLowerCase();

    if (
        r.includes("agreed") ||
        r.includes("passed") ||
        r.includes("confirmed") ||
        r.includes("accepted")
    ) {
        return <span className="badge badge--success">{result}</span>;
    }

    if (
        r.includes("rejected") ||
        r.includes("failed") ||
        r.includes("not agreed") ||
        r.includes("not passed")
    ) {
        return <span className="badge badge--danger">{result}</span>;
    }

    return <span className="badge badge--slate">{result || "—"}</span>;
}

function stageLabelFor(label) {
    const map = {
        cloture: "Cloture",
        amendment: "Amendment",
        final_passage: "Final passage",
        nomination: "Nomination",
        procedural: "Procedural",
        other: "Other",
    };

    return map[label] ?? humanizeLabel(label);
}

function humanizeLabel(label) {
    if (!label) return "Other";
    return String(label)
        .replace(/_/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(s) {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime())
        ? s
        : d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });
}

function prettyVote(pos) {
    if (!pos) return "—";
    const p = String(pos).toLowerCase();
    if (p === "yea" || p === "yes" || p === "aye") return "Yea";
    if (p === "nay" || p === "no") return "Nay";
    if (p.includes("present")) return "Present";
    if (p.includes("not voting")) return "Not voting";
    return pos;
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