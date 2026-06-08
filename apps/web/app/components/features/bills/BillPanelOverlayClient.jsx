"use client";

import RoutePanelShell from "@/app/components/ui/RoutePanelShell";

export default function BillPanelOverlayClient({ children }) {
    return (
        <RoutePanelShell
            ariaLabel="Bill details"
            closeLabel="Close bill details"
            backLabel="Bills"
            fallbackHref="/bills"
            entity="bill"
            mode="panel"
            className="llbp-routePanel"
            bodyClassName="ll3-routePanel__body--bill"
        >
            {children}
        </RoutePanelShell>
    );
}