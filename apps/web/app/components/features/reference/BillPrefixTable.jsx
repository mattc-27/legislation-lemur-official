import { BILL_PREFIXES } from "./referenceContent";

export default function BillPrefixTable() {
  return (
    <article className="ll3-refPanel" id="bill-prefixes">
      <div className="ll3-ref__eyebrow">Bill basics</div>
      <h3 className="ll3-refPanel__title">Bill prefixes</h3>
      <p className="ll3-refPanel__copy">The prefix tells you what kind of legislative item it is and which chamber introduced it.</p>

      <div className="ll3-refTableWrap" role="region" aria-label="Bill prefixes table">
        <table className="ll3-refTable">
          <thead>
            <tr>
              <th>Prefix</th>
              <th>Meaning</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {BILL_PREFIXES.map((row) => (
              <tr key={row.prefix}>
                <td data-label="Prefix" className="ll3-refMono">{row.prefix}</td>
                <td data-label="Meaning">{row.meaning}</td>
                <td data-label="Notes">{row.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}
