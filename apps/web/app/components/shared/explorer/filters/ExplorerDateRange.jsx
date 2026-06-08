export default function ExplorerDateRange({ fromName = "from", toName = "to", fromDefault = "", toDefault = "" }) {
  return <div className="ll3-filterGrid"><label className="ll3-field"><span className="ll3-label">From</span><input className="ll3-input ll3-dateInput" type="date" name={fromName} defaultValue={fromDefault || ""} /></label><label className="ll3-field"><span className="ll3-label">To</span><input className="ll3-input ll3-dateInput" type="date" name={toName} defaultValue={toDefault || ""} /></label></div>;
}
