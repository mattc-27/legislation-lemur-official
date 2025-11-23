// components/member/SenateVotes.jsx
export default function SenateVotes({ groups = [] }) {
    if (!groups || groups.length === 0) {
        return <p className="muted">No Senate votes found.</p>;
    }

    return (
        <div className="table-scroll">
            {groups.map((g) => (
                <div
                    key={`${g.base_measure}-${g.congress}`}
                    className="card card--p-16 senate-vote-card"
                >
                    <header className="flex items-center justify-between mb-8">
                        <div>
                            <div className="text-sm text-slate-500">119th Congress</div>
                            <h3 className="text-lg font-semibold">
                                {g.title || g.base_measure}
                            </h3>
                        </div>
                        {g.link && (
                            <a
                                className="btn btn--ghost"
                                href={g.link}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on Senate.gov
                            </a>
                        )}
                    </header>

                    <div className="senate-vote-table-wrap">
                        <table className="table table--sm senate-vote-table">
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
                                        <td>{s.question}</td>
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
                </div>

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
