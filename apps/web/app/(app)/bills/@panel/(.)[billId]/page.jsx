// app/bills/@panel/(.)[billId]/page.jsx
import { notFound } from "next/navigation";

import { getBillPanelDetail } from "@/lib/server/bills/indexV2";
import BillPanelDetail from "@/app/components/features/bills/BillPanelDetail";
import BillPanelOverlayClient from "@/app/components/features/bills/BillPanelOverlayClient";


import "@/app/styles/active/bills/ll3.bills.details.css";
import "@/app/styles/active/core/ll3.route-panel.css";
import "@/app/styles/active/bills/ll3.bill-panel.css";

function parseBillSlug(value) {
    const slug = decodeURIComponent((value ?? "").toString().trim()).toLowerCase();
    const parts = slug.split("-");

    if (parts.length === 2) {
        const match = parts[0].match(/^([a-z]+)(\d+)$/);
        const congress = Number(parts[1]);

        if (!match || !Number.isFinite(congress)) return null;

        const [, type, numberStr] = match;
        const number = Number(numberStr);

        if (!Number.isFinite(number)) return null;

        return { slug, type, number, congress, billId: `${type}${number}-${congress}` };
    }

    if (parts.length === 3) {
        const [type, numberStr, congressStr] = parts;
        const number = Number(numberStr);
        const congress = Number(congressStr);

        if (!type || !Number.isFinite(number) || !Number.isFinite(congress)) return null;

        return { slug, type, number, congress, billId: `${type}${number}-${congress}` };
    }

    return null;
}

export default async function BillPanelRoute({ params }) {
    const resolvedParams = await params;
    const parsed = parseBillSlug(resolvedParams?.billId);

    if (!parsed) return notFound();

    const bill = await getBillPanelDetail({
        billId: parsed.billId,
        type: parsed.type,
        number: parsed.number,
        congress: parsed.congress,
    });

    if (!bill) return notFound();

    return (
        <BillPanelOverlayClient>
            <BillPanelDetail bill={bill} mode="panel" />
        </BillPanelOverlayClient>
    );
}
