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

  const freshness = fmtFreshness(kpis.data_fresh_as_of);

  return (
    <section className="llmp3-card">
      <div className="llmp3-card__head">
        <h2 className="llmp3-h2">Overview</h2>
        {freshness && <span className="llmp3-asof">Updated {freshness}</span>}
      </div>

      <ul className="llmp3-kpis">
        {items.map((k) => {
          const Icon = k.icon;
          return (
            <li key={k.label} className="llmp3-kpi">
              <div className="llmp3-kpi__icon" aria-hidden="true">
                <Icon size={16} />
              </div>
              <div className="llmp3-kpi__value">{k.value}</div>
              <div className="llmp3-kpi__label">{k.label}</div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function fmtNum(n) { return (n ?? n === 0) ? String(n) : null; }
function fmtPct(n) { return (typeof n === "number") ? `${n.toFixed(1)}%` : null; }

function fmtFreshness(ts) {
  if (!ts) return null;
  const d = new Date(ts);
  if (Number.isNaN(d.getTime())) return null;
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(d);
}
