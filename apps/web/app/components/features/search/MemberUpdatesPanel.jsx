import Link from "next/link";
import {
    Clock3,
    RefreshCcw,
    Shuffle,
    UserCheck,
    UserMinus,
    UserPlus,
} from "lucide-react";

const SEAT_CHANGE_TYPES = new Set([
    "seat_became_vacant",
    "seat_filled",
    "member_replaced",
]);

function isSeatChange(change) {
    return SEAT_CHANGE_TYPES.has(change?.changeType);
}

function iconFor(type) {
    if (type === "member_joined" || type === "became_current") return UserPlus;
    if (type === "member_left" || type === "became_former") return UserMinus;
    if (type === "seat_became_vacant") return UserMinus;
    if (type === "seat_filled") return UserCheck;
    if (type === "member_replaced") return Shuffle;
    return RefreshCcw;
}

function badgeFor(change) {
    const type = change?.changeType;

    if (change?.isVacant || type === "seat_became_vacant") {
        return { label: "Vacant", className: "is-vacant" };
    }

    if (type === "seat_filled") {
        return { label: "Filled", className: "is-filled" };
    }

    if (type === "member_replaced") {
        return { label: "Replacement", className: "is-filled" };
    }

    if (type === "party_changed") {
        return { label: "Party change", className: "is-party" };
    }

    if (type === "member_joined" || type === "became_current") {
        return { label: "New member", className: "is-new" };
    }

    return { label: "Update", className: "is-update" };
}

function formatDistrict(row) {
    const stateCode = row?.stateCode || "";
    const chamber = row?.chamber || "";

    if (chamber === "Senate") return `${stateCode} · Senate`;

    if (row?.district == null) return `${stateCode} · House`;

    const district = Number(row.district);
    const districtText = Number.isFinite(district) && district === 0
        ? "AL"
        : row.district;

    return `${stateCode}-${districtText} · House`;
}

function formatDate(value) {
    if (!value) return "Recently";

    return new Date(value).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

function hrefFor(change) {
    const stateCode = String(change?.stateCode || "").toUpperCase();

    if (change?.isVacant) {
        const params = new URLSearchParams();

        if (stateCode) params.set("state", stateCode);
        if (change?.district != null) params.set("district", String(change.district));
        params.set("seatStatus", "vacant");

        return `/members?${params.toString()}`;
    }

    if (isSeatChange(change) && !change?.bioguideId) {
        const params = new URLSearchParams();

        if (stateCode) params.set("state", stateCode);
        if (change?.district != null) params.set("district", String(change.district));

        return `/members?${params.toString()}`;
    }

    if (change?.bioguideId) {
        return `/member/${change.bioguideId}`;
    }

    const params = new URLSearchParams();

    if (stateCode) params.set("state", stateCode);
    if (change?.district != null) params.set("district", String(change.district));

    return `/members${params.toString() ? `?${params.toString()}` : ""}`;
}

function ctaTextFor(change) {
    if (change?.isVacant) return "View vacant seat";
    if (isSeatChange(change)) return "View seat";
    if (change?.bioguideId) return "View profile";
    return "View directory";
}

export default function MemberUpdatesPanel({ changes = [] }) {
    if (!changes.length) return null;

    return (
        <section className="ll3-memberUpdates" aria-label="Recent member and seat changes">
            <div className="ll3-memberUpdates__head">
                <div>
                    <h2 className="ll3-h2">What’s changed</h2>
                    <p className="ll3-muted">
                        Recent member and House seat updates detected in congressional data.
                    </p>
                </div>
            </div>

            <div className="ll3-memberUpdates__list">
                {changes.map((change, index) => {
                    const Icon = iconFor(change.changeType);
                    const badge = badgeFor(change);
                    const href = hrefFor(change);

                    return (
                        <article
                            key={`${change.districtId || change.bioguideId || "change"}-${change.changeType}-${change.detectedAt}-${index}`}
                            className={`ll3-memberUpdateCard ${change.isVacant ? "is-vacant" : ""}`}
                        >
                            <div className="ll3-memberUpdateCard__icon">
                                <Icon size={18} aria-hidden="true" />
                            </div>

                            <div className="ll3-memberUpdateCard__body">
                                <div className="ll3-memberUpdateCard__topline">
                                    <h3 className="ll3-memberUpdateCard__headline">
                                        {change.headline || `${change.name || "Seat"} updated`}
                                    </h3>

                                    <span className={`ll3-memberUpdateCard__badge ${badge.className}`}>
                                        {badge.label}
                                    </span>
                                </div>

                                <p className="ll3-memberUpdateCard__meta">
                                    {formatDistrict(change)}
                                    <span className="ll3-metaSep">•</span>
                                    <Clock3 size={13} aria-hidden="true" />
                                    {formatDate(change.detectedAt)}
                                </p>

                                <Link className="ll3-memberUpdateCard__link" href={href}>
                                    {ctaTextFor(change)} <span aria-hidden="true">→</span>
                                </Link>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}