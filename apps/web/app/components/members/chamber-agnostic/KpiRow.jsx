// components/member/KpiRow.jsx
export default function KpiRow({ kpis = {} }) {
  const itemsRaw = [
    { label: "Total bills (YTD)", value: fmtNum(kpis.totalYTD) },
    { label: "Bills sponsored (YTD)", value: fmtNum(kpis.sponsoredYTD) },
    { label: "Bills co-sponsored (YTD)", value: fmtNum(kpis.cosponsoredYTD) },
    { label: "Attendance", value: fmtPct(kpis.attendancePct) },
    { label: "Party alignment", value: fmtPct(kpis.alignmentPct) },
  ];
  const items = itemsRaw.filter(k => k.value != null);

  return (
    <section className="kpi card card--p-24">
      <ul className="kpi__grid">
        {items.map((k) => (
          <li key={k.label} className="kpi__item">
            <div className="kpi__value">{k.value}</div>
            <div className="kpi__label">{k.label}</div>
          </li>
        ))}
      </ul>
    </section>
  );
}
function fmtNum(n) { return (n ?? n === 0) ? String(n) : null; }
function fmtPct(n) { return (typeof n === "number") ? `${n.toFixed(1)}%` : null; }
