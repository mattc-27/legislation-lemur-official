// components/member/SenateVotes.jsx
import { ExternalLink, Landmark } from "lucide-react";


export default function SenateVotes({ groups = [] }) {
    if (!groups || groups.length === 0) {
        return <p className="muted">No Senate votes found.</p>;
    }

    return (
        <div className="llmp3-stack-16">
            {groups.map((g) => (
                <section
                    key={`${g.base_measure}-${g.congress}`}
                    className="llmp3-card llmp3-card--soft llmp3-senvote"
                >
                    <header className="llmp3-senvote__head">
                        <div className="llmp3-senvote__title">
                            <div className="llmp3-senvote__meta">
                                <span className="llmp3-chip">
                                    <Landmark size={14} aria-hidden="true" />
                                    {g.congress ? `${g.congress}th Congress` : "Congress"}
                                </span>
                            </div>
                            <h3 className="llmp3-h3">{g.title || g.base_measure}</h3>
                        </div>

                        {g.link && (
                            <a
                                className="llmp3-linkbtn"
                                href={g.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Senate.gov
                                <ExternalLink size={14} aria-hidden="true" />
                            </a>
                        )}
                    </header>

                    <div className="llmp3-tablewrap">
                        <table className="llmp3-table">
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
                                {g.stages.map((s) => (
                                    <tr key={s.vote_id || s.roll + s.datetime}>
                                        <td>{fmtDate(s.datetime)}</td>
                                        <td><StagePill label={s.label} /></td>
                                        <td className="llmp3-tdwrap">{s.question}</td>
                                        <td>
                                            <span className={`badge ${badgeForVote(s.choice)}`}>
                                                {prettyVote(s.choice)}
                                            </span>
                                        </td>
                                        <td><AlignChip v={s.party_alignment} /></td>
                                        <td>{s.result}</td>
                                        <td>{s.roll}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            ))}
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