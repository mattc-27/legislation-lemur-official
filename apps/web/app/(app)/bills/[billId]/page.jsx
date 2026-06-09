// @app/bills/[billId]/page.jsx

import { notFound } from "next/navigation";

import { getBillPanelDetail } from "@/lib/server/bills/indexV2";

// import BillPanelDetail from "@/app/components/features/bills/BillPanelDetail";
import BillPanelDetail from "@/app/components/features/bills/BillPanelDetail.updated";
import EntityDetailShell from "@/app/components/ui/EntityDetailShell";

import "@/app/styles/active/bills//ll3.bills.tokens.css";
import "@/app/styles/active/bills/ll3.bills.ui.css";


import "@/app/styles/active/core/ll3.entity-detail.css";
import "@/app/styles/active/core/ll3.entity-ui.css";

import "@/app/styles/active/bills/ll3.bills.details.css";
import "@/app/styles/active/bills/ll3.bill-panel.css";

export const revalidate = 600;

function parseBillSlug(value) {
    const slug = decodeURIComponent((value ?? "").toString().trim()).toLowerCase();
    const parts = slug.split("-");

    if (parts.length === 2) {
        const match = parts[0].match(/^([a-z]+)(\d+)$/);
        const congress = Number(parts[1]);

        if (!match || !Number.isFinite(congress)) return null;

        const [, type, numberStr] = match;
        const number = Number(numberStr);

        return {
            slug,
            type,
            number,
            congress,
            billId: `${type}${number}-${congress}`,
        };
    }

    if (parts.length === 3) {
        const [type, numberStr, congressStr] = parts;
        const number = Number(numberStr);
        const congress = Number(congressStr);

        if (!type || !Number.isFinite(number) || !Number.isFinite(congress)) {
            return null;
        }

        return {
            slug,
            type,
            number,
            congress,
            billId: `${type}${number}-${congress}`,
        };
    }

    return null;
}

export default async function BillPage({ params, searchParams }) {
    const resolvedParams = await params;
    const resolvedSearchParams = await searchParams;

    //  console.log("[BillPage] params:", resolvedParams);
    // console.log("[BillPage] searchParams:", resolvedSearchParams);
    // console.log("[BillPage] fromMember:", resolvedSearchParams?.fromMember);
    //console.log("[BillPage] fromMemberName:", resolvedSearchParams?.fromMemberName);

    const parsed = parseBillSlug(resolvedParams?.billId);

    if (!parsed) return notFound();

    const bill = await getBillPanelDetail({
        billId: parsed.billId,
        type: parsed.type,
        number: parsed.number,
        congress: parsed.congress,
    });

    if (!bill) return notFound();

    const fromMember = resolvedSearchParams?.fromMember || null;
    const fromMemberName = resolvedSearchParams?.fromMemberName || null;

    return (
        <EntityDetailShell entity="bill" variant="default" className="llbd3-page">
            <BillPanelDetail
                bill={bill}
                mode="page"
                sourceMember={
                    fromMember
                        ? {
                            bioguideId: fromMember,
                            name: fromMemberName,
                        }
                        : null
                }
            />
        </EntityDetailShell>
    );
}