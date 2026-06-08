export default function ExplorerChipGroup({ label, items = [], name, activeValues = [] }) {
  const active = new Set((activeValues || []).map(String));
  return <div className="ll3-field">{label ? <div className="ll3-label">{label}</div> : null}<div className="ll3-chipGroup">{items.map((item) => <button key={item.value || item.label} type="submit" name={name} value={item.value} className={["ll3-pillBtn", active.has(String(item.value)) ? "is-active" : ""].filter(Boolean).join(" ")}>{item.label}</button>)}</div></div>;
}
