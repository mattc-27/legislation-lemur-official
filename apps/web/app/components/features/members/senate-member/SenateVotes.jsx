// components/member/SenateVotes.jsx
import { ExternalLink, Landmark } from "lucide-react";

export default function SenateVotes({ groups = [] }) {
    if (!groups || groups.length === 0) {
        return <p className="llm3-muted">No Senate votes found.</p>;
    }

    return (
        <div className="llmp3-stack-16 llm3-senVotes">
            {groups.map((g) => {
                const key = `${g.base_measure ?? "vote"}-${g.congress ?? "x"}`;
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
                                    <span className="llm3-chip">
                                        <Landmark size={14} aria-hidden="true" />
                                        <span>{congressLabel}</span>
                                    </span>
                                </div>

                                <h3 className="llm3-h3 llm3-senVoteHead__title">{title}</h3>
                            </div>

                            {g.link ? (
                                <a
                                    className="llm3-extlink"
                                    href={g.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span>View on Senate.gov</span>
                                    <ExternalLink size={14} aria-hidden="true" />
                                </a>
                            ) : null}
                        </header>

                        <div className="llm3-tableFrame llm3-tableFrame--tight">
                            <div className="llm3-tableScroll" role="region" aria-label="Senate vote table">
                                <table className="llm3-table">
                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Stage</th>
                                            <th>Question</th>
                                            <th>Your Vote</th>
                                            <th>Party Align</th>
                                            <th>Result</th>
                                            <th>Roll</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {rows.map((s) => {
                                            const rowKey = s.vote_id || `${s.roll ?? ""}-${s.datetime ?? ""}`;
                                            return (
                                                <tr key={rowKey}>
                                                    <td className="llm3-td--nowrap">{fmtDate(s.datetime)}</td>
                                                    <td className="llm3-td--nowrap">
                                                        <StagePill label={s.label} />
                                                    </td>
                                                    <td className="llm3-tdwrap">{s.question || "—"}</td>
                                                    <td className="llm3-td--nowrap">
                                                        <span className={`badge ${badgeForVote(s.choice)}`}>
                                                            {prettyVote(s.choice)}
                                                        </span>
                                                    </td>
                                                    <td className="llm3-td--nowrap">
                                                        <AlignChip v={s.party_alignment} />
                                                    </td>
                                                    <td className="llm3-td--nowrap">{s.result || "—"}</td>
                                                    <td className="llm3-td--nowrap">{s.roll || "—"}</td>
                                                </tr>
                                            );
                                        })}

                                        {rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="llm3-muted" style={{ padding: 14 }}>
                                                    No vote stages found.
                                                </td>
                                            </tr>
                                        ) : null}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                );
            })}
        </div>
    );
}

function StagePill({ label }) {
    const map = {
        cloture: "Cloture",
        amendment: "Amendment",
        final_passage: "Final Passage",
        nomination: "Nomination",
        procedural: "Procedural",
        other: "Other",
    };
    return <span className="badge badge--slate">{map[label] ?? label}</span>;
}

function AlignChip({ v }) {
    if (v === "with") return <span className="badge badge--teal">With party</span>;
    if (v === "against") return <span className="badge badge--warning">Against party</span>;
    return <span className="badge badge--muted">Neutral</span>;
}

function fmtDate(s) {
    if (!s) return "—";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleDateString();
}

function prettyVote(pos) {
    if (!pos) return "—";
    const p = String(pos).toLowerCase();
    if (p === "yea" || p === "yes" || p === "aye") return "Yea";
    if (p === "nay" || p === "no") return "Nay";
    if (p.includes("present")) return "Present";
    if (p.includes("not voting")) return "Not Voting";
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