import Link from "next/link";
import { GitBranch, ArrowRightLeft, Scale, FileText } from "lucide-react";

const RELATION_LABELS = {
    "related bill": "Related",
    "procedurally related": "Procedural",
    "identical bill": "Identical",
    "companion bill": "Companion",
    "related": "Related",
};

function normalizeRelationType(value) {
    const raw = String(value || "").trim().toLowerCase();
    if (!raw) return "related";

    if (raw.includes("procedur")) return "procedurally related";
    if (raw.includes("identical")) return "identical bill";
    if (raw.includes("companion")) return "companion bill";
    if (raw.includes("related")) return "related bill";

    return raw;
}

function groupRelatedBills(items = []) {
    const groups = {
        "companion bill": [],
        "identical bill": [],
        "related bill": [],
        "procedurally related": [],
        other: [],
    };

    for (const item of items) {
        const type = normalizeRelationType(
            item.relationshipType ||
            item.relationType ||
            item.type ||
            item.relationship_identification ||
            item.relationshipDetails?.type
        );

        if (groups[type]) groups[type].push(item);
        else groups.other.push(item);
    }

    return Object.entries(groups).filter(([, bills]) => bills.length > 0);
}

function getGroupIcon(type) {
    switch (type) {
        case "companion bill":
            return <ArrowRightLeft size={15} strokeWidth={2.2} />;
        case "identical bill":
            return <Scale size={15} strokeWidth={2.2} />;
        case "procedurally related":
            return <GitBranch size={15} strokeWidth={2.2} />;
        case "related bill":
        default:
            return <FileText size={15} strokeWidth={2.2} />;
    }
}

function getBillHref(bill) {
    return (
        bill.href ||
        bill.url ||
        bill.link ||
        (bill.congress && bill.type && bill.number
            ? `/bills/${bill.congress}/${String(bill.type).toLowerCase()}/${bill.number}`
            : "#")
    );
}

function getBillLabel(bill) {
    if (bill.displayNumber) return bill.displayNumber;
    if (bill.numberLabel) return bill.numberLabel;

    const type = bill.type ? String(bill.type).toUpperCase() : "";
    const number = bill.number ? String(bill.number) : "";
    const congress = bill.congress ? ` (${bill.congress})` : "";

    if (type && number) return `${type}. ${number}${congress}`;
    return bill.title || "Bill";
}

function getBillMeta(bill) {
    return (
        bill.latestActionText ||
        bill.latestAction ||
        bill.summary ||
        bill.title ||
        ""
    );
}

export default function RelatedBillsGraph({
    currentBill,
    relatedBills = [],
    maxPerGroup = 6,
}) {
    if (!relatedBills?.length) return null;

    const grouped = groupRelatedBills(relatedBills);

    return (
        <div className="llbd3-networkCard">
            <div className="llbd3-card__head">
                <h2 className="llbd3-h2">
                    <GitBranch size={16} strokeWidth={2.2} />
                    Bill network
                </h2>
            </div>

            <div className="llbd3-network">
                <div className="llbd3-network__centerWrap">
                    <div className="llbd3-network__spokes" aria-hidden="true">
                        {grouped.map(([type], i) => (
                            <span
                                key={type}
                                className={`llbd3-network__spoke llbd3-network__spoke--${(i % 4) + 1}`}
                            />
                        ))}
                    </div>

                    <div className="llbd3-network__center">
                        <div className="llbd3-network__centerEyebrow">Current bill</div>
                        <div className="llbd3-network__centerTitle">
                            {currentBill?.displayNumber ||
                                currentBill?.billNumber ||
                                currentBill?.numberLabel ||
                                currentBill?.shortLabel ||
                                currentBill?.title ||
                                "Current bill"}
                        </div>
                        {currentBill?.title ? (
                            <div className="llbd3-network__centerSub">{currentBill.title}</div>
                        ) : null}
                    </div>
                </div>

                <div className="llbd3-network__groups">
                    {grouped.map(([type, bills]) => {
                        const visibleBills = bills.slice(0, maxPerGroup);
                        const hiddenCount = Math.max(0, bills.length - visibleBills.length);

                        return (
                            <section
                                key={type}
                                className={`llbd3-networkGroup llbd3-networkGroup--${type
                                    .replaceAll(" ", "-")
                                    .replaceAll("/", "-")}`}
                            >
                                <div className="llbd3-networkGroup__head">
                                    <div className="llbd3-networkGroup__label">
                                        {getGroupIcon(type)}
                                        <span>{RELATION_LABELS[type] || type}</span>
                                    </div>

                                    <div className="llbd3-networkGroup__count">
                                        {bills.length}
                                    </div>
                                </div>

                                <div className="llbd3-networkGroup__grid">
                                    {visibleBills.map((bill, index) => (
                                        <Link
                                            key={`${getBillLabel(bill)}-${index}`}
                                            href={getBillHref(bill)}
                                            className="llbd3-networkNode"
                                        >
                                            <div className="llbd3-networkNode__top">
                                                <div className="llbd3-networkNode__title">
                                                    {getBillLabel(bill)}
                                                </div>
                                                <span className="llbd3-networkNode__badge">
                                                    {RELATION_LABELS[type] || "Related"}
                                                </span>
                                            </div>

                                            {getBillMeta(bill) ? (
                                                <div className="llbd3-networkNode__meta">
                                                    {getBillMeta(bill)}
                                                </div>
                                            ) : null}
                                        </Link>
                                    ))}

                                    {hiddenCount > 0 ? (
                                        <div className="llbd3-networkNode llbd3-networkNode--more">
                                            <div className="llbd3-networkNode__moreText">
                                                +{hiddenCount} more
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}