// app/(app)/test_/BillChip.jsx
import Link from "next/link";
import { FileText } from "lucide-react";
/**
 * BillChip
 * - Reusable "bill chip" pill used on BillCard
 * - Example: "HCONRES. 61 • House • 119"
 */
export default function BillChip({
  href,
  billCode,
  chamber,
  congress,
  className = "",
  icon: Icon = FileText,
  "aria-label": ariaLabel,
}) {
  return (
    <Link
      className={`ll3-chip ${className}`}
      href={href}
      aria-label={ariaLabel || `Open ${billCode} (${congress})`}
      title={`${billCode} • ${chamber} • ${congress}`}
    >
      <span className="ll3-chip__icon" aria-hidden="true">
        <Icon size={16} />
      </span>

      <span className="ll3-chip__code">{billCode}</span>

      <span className="ll3-chip__sep" aria-hidden="true">
        •
      </span>
      <span className="ll3-chip__meta">{chamber}</span>

      <span className="ll3-chip__sep" aria-hidden="true">
        •
      </span>
      <span className="ll3-chip__meta">{congress}</span>
    </Link>
  );
}
