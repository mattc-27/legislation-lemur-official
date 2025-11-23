// components/member/CommitteesList.jsx
export default function CommitteesList({ committees = [] }) {
    if (!committees.length) return <p className="muted">No committee assignments listed.</p>;
    return (
        <ul className="committee">
            {committees.map((c) => (
                <li key={c.code || c.name} className="committee__item">
                    <div className="committee__name">{c.name}</div>
                    {c.role && <div className="committee__role">{c.role}</div>}
                </li>
            ))}
        </ul>
    );
}
