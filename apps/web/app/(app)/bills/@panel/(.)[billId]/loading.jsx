import BillPanelOverlayClient from "@/app/components/features/bills/BillPanelOverlayClient";

import "@/app/styles/active/bills/ll3.bill-panel.css";

export default function LoadingBillPanel() {
    return (
        <BillPanelOverlayClient>
            <div className="llbp-panel llbp-panel--loading">
                <div className="llbp-skeleton llbp-skeleton--eyebrow" />
                <div className="llbp-skeleton llbp-skeleton--title" />
                <div className="llbp-skeleton llbp-skeleton--line" />
                <div className="llbp-skeleton llbp-skeleton--line short" />

                <div className="llbp-skeletonCard" />
                <div className="llbp-skeletonCard" />
            </div>
        </BillPanelOverlayClient>
    );
}