export default function ExplorerSignalCell({ label, value, icon }) {
  const n = Number(value); const level = Number.isFinite(n) ? Math.min(5, Math.max(1, Math.ceil(n / 20))) : 0;
  return <div className="ll3-tableSignal"><div className="ll3-tableSignal__head"><span className="ll3-tableSignal__label">{icon}{label}</span><span className="ll3-tableSignal__value">{Number.isFinite(n) ? n : "—"}</span></div><span className={`ll3-tableSignal__meter ${level ? "" : "is-empty"}`} data-level={level || undefined} aria-hidden="true" /></div>;
}
