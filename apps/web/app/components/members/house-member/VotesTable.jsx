export default function VotesTable({ votes = [] }) {
  if (!votes || votes.length === 0) {
    return <p className="muted">No votes found.</p>;
  }

  return (
    <table className="votes-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Bill</th>
          <th>Roll</th>
          <th>Question</th>
          <th>Your Vote</th>
          <th>Result</th>
        </tr>
      </thead>
      <tbody>
        {votes.map((v) => {
          const date = fmtDate(v.voted_at || v.date);

          const bill = v.bill_display
            ? v.bill_url
              ? (
                <a
                  href={v.bill_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {v.bill_display}
                </a>
              )
              : v.bill_display
            : "—";

          const roll =
            v.rollcall_number != null && v.session != null
              ? `${v.session}-${v.rollcall_number}`
              : v.roll || v.rollcall_number || "—";

          const question = v.question || v.bill || "—";
          const choice = v.choice || v.position || "—";
          const result = v.result || "—";

          const key =
            v.vote_id ??
            `${v.congress ?? ""}-${v.session ?? ""}-${v.rollcall_number ?? ""
            }-${v.voted_at ?? v.date ?? Math.random()}`;

          return (
            <tr key={key}>
              <td>{date}</td>
              <td>{bill}</td>
              <td>{roll}</td>
              <td>{question}</td>
              <td>
                <span className={`badge ${badgeForVote(choice)}`}>
                  {prettyVote(choice)}
                </span>
              </td>
              <td>{result}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}


/* ----- Helpers */


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
