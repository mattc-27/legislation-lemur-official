// /app/components/features/bills/BillPanelMetricCard.jsx
// 
"use client";

import { useMemo } from "react";
import { ExternalLink, FileText, GitPullRequest, Share2, Sparkles } from "lucide-react";

function getBillSlug(bill) {
    if (!bill?.bill_type || !bill?.bill_number || !bill?.congress) return bill?.bill_id || "";
    return `${bill.bill_type}-${bill.bill_number}-${bill.congress}`.toLowerCase();
}

export default function BillPanelActions({
    bill,
    congressUrl,
    primaryTextUrl,
    amendmentsUrl,
    amendmentCount = 0,
}) {
    const sharePath = useMemo(() => {
        const slug = getBillSlug(bill);
        return slug ? `/bills/${slug}` : null;
    }, [bill]);

    async function shareBill() {
        if (!sharePath) return;

        const absoluteUrl =
            typeof window !== "undefined"
                ? new URL(sharePath, window.location.origin).toString()
                : sharePath;

        const title = bill?.display_title || bill?.title || "Legislation Lemur bill";
        const text = `${String(bill?.bill_type || "").toUpperCase()}. ${bill?.bill_number || ""} — ${title}`;

        try {
            if (navigator.share) {
                await navigator.share({ title, text, url: absoluteUrl });
            } else {
                await navigator.clipboard.writeText(absoluteUrl);
            }
        } catch {
            // user cancelled share or clipboard failed; no-op
        }
    }

    return (
        <div className="llbp-actions">
            <div className="llbp-actions__links">
                {primaryTextUrl ? (
                    <a className="llbp-actionLink" href={primaryTextUrl} target="_blank" rel="noreferrer">
                        <FileText size={16} aria-hidden="true" />
                        Full Text (PDF)
                    </a>
                ) : null}

                {amendmentsUrl ? (
                    <a className="llbp-actionLink" href={amendmentsUrl} target="_blank" rel="noreferrer">
                        <GitPullRequest size={16} aria-hidden="true" />
                        Amendments{Number(amendmentCount) > 0 ? ` (${amendmentCount})` : ""}
                    </a>
                ) : null}

                {sharePath ? (
                    <button type="button" className="llbp-actionLink" onClick={shareBill}>
                        <Share2 size={16} aria-hidden="true" />
                        Share
                    </button>
                ) : null}
            </div>

            {congressUrl ? (
                <a className="llbp-primaryAction" href={congressUrl} target="_blank" rel="noreferrer">
                    <Sparkles size={16} aria-hidden="true" />
                    View on Congress.gov
                    <ExternalLink size={16} aria-hidden="true" />
                </a>
            ) : null}
        </div>
    );
}