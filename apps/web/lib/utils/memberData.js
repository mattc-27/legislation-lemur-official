// Canonical: lib/utils/memberData.js
import "server-only";

import { normalizeMemberImageUrl } from "./memberImage";
import { perfLog } from "@/lib/server/debug/perf";

import {
    getMemberProfile,
    getMemberSponsoredLegislation,
    getMemberCosponsoredLegislation,
    getMemberKpis,
    getMemberMonthlyActivity,
    getMemberSubjects,
    getMemberBills,
    getHouseMemberAlignmentPanelOverall,
    getHouseMemberAlignmentByPolicy,
    getHouseMemberAlignmentTopDeviations,
} from "../server/routes/members";

async function timed(label, fn, meta = {}) {
    const start = performance.now();
    try {
        const result = await fn();
        perfLog(`${label}: ${Math.round(performance.now() - start)}ms`, meta);
        return result;
    } catch (err) {
        perfLog(`${label}:error:${Math.round(performance.now() - start)}ms`, {
            message: err?.message,
            code: err?.code,
            ...meta,
        });
        throw err;
    }
}

function toMonthlyStats(monthlyActivity = []) {
    return [...monthlyActivity].reverse().map((row) => ({
        month: row.month,
        sponsored: row.sponsored_count ?? 0,
        cosponsored: row.cosponsored_count ?? 0,
    }));
}

function parseCongress(value) {
    const parsed = Number.parseInt(String(value ?? ""), 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function resolveCongress(profile, requestedCongress) {
    const available = Array.isArray(profile?.availableCongresses)
        ? profile.availableCongresses.map(Number).filter(Number.isInteger)
        : [];
    const requested = parseCongress(requestedCongress);

    if (requested && available.includes(requested)) return requested;

    const preferred = profile?.isCurrent
        ? parseCongress(profile.memberCongress)
        : parseCongress(profile.lastCongressServed);

    if (preferred && (!available.length || available.includes(preferred))) return preferred;
    return available[0] ?? preferred ?? null;
}

function emptyResult(profile = null) {
    return {
        profile,
        selectedCongress: null,
        monthly: [],
        sponsoredRes: { groups: {}, legacy: [], items: [] },
        cosponsoredRes: { groups: {}, legacy: [], items: [] },
        alignmentPanel: null,
        kpis: null,
        monthlyActivity: [],
        subjects: [],
        bills: [],
    };
}

export async function fetchMemberData(
    bioguideId,
    {
        congress = null,
        billLimit = 50,
        legislationLimit = 250,
        subjectLimit = 12,
        policyMinVotes = 10,
    } = {}
) {
    const totalStart = performance.now();

    try {
        const profileRaw = await timed(
            "memberData:getMemberProfile",
            () => getMemberProfile(bioguideId),
            { bioguideId }
        );

        if (!profileRaw) return emptyResult(null);

        const selectedCongress = resolveCongress(profileRaw, congress);
        if (!selectedCongress) {
            return emptyResult({
                ...profileRaw,
                imageUrl: normalizeMemberImageUrl(profileRaw.imageUrl),
            });
        }

        const serviceEndDate = profileRaw.isCurrent ? null : profileRaw.serviceEndDate;
        const isCurrentCongress =
            profileRaw.isCurrent === true &&
            selectedCongress === parseCongress(profileRaw.memberCongress);
        const isHouse =
            profileRaw.chamber === "House" ||
            profileRaw.chamber === "House of Representatives";
        const allowCurrentHouseComparisons = isHouse && isCurrentCongress;

        const [
            sponsoredRes,
            cosponsoredRes,
            kpis,
            monthlyActivity,
            subjects,
            bills,
            alignOverall,
            alignByPolicy,
            alignDeviations,
        ] = await Promise.all([
            timed(
                "memberData:getMemberSponsoredLegislation",
                () => getMemberSponsoredLegislation(bioguideId, {
                    congress: selectedCongress,
                    max: legislationLimit,
                    serviceEndDate,
                }),
                { bioguideId, selectedCongress, legislationLimit, serviceEndDate }
            ),
            timed(
                "memberData:getMemberCosponsoredLegislation",
                () => getMemberCosponsoredLegislation(bioguideId, {
                    congress: selectedCongress,
                    max: legislationLimit,
                    serviceEndDate,
                }),
                { bioguideId, selectedCongress, legislationLimit, serviceEndDate }
            ),
            isCurrentCongress
                ? timed("memberData:getMemberKpis", () => getMemberKpis(bioguideId), {
                    bioguideId,
                    selectedCongress,
                })
                : Promise.resolve(null),
            timed(
                "memberData:getMemberMonthlyActivity",
                () => getMemberMonthlyActivity(bioguideId, {
                    congress: selectedCongress,
                    serviceEndDate,
                }),
                { bioguideId, selectedCongress, serviceEndDate }
            ),
            timed(
                "memberData:getMemberSubjects",
                () => getMemberSubjects(bioguideId, {
                    congress: selectedCongress,
                    limit: subjectLimit,
                    serviceEndDate,
                }),
                { bioguideId, selectedCongress, subjectLimit, serviceEndDate }
            ),
            timed(
                "memberData:getMemberBills",
                () => getMemberBills(bioguideId, {
                    congress: selectedCongress,
                    limit: billLimit,
                    serviceEndDate,
                }),
                { bioguideId, selectedCongress, billLimit, serviceEndDate }
            ),
            allowCurrentHouseComparisons
                ? timed("memberData:getHouseMemberAlignmentPanelOverall", () =>
                    getHouseMemberAlignmentPanelOverall(bioguideId), { bioguideId })
                : Promise.resolve(null),
            allowCurrentHouseComparisons
                ? timed("memberData:getHouseMemberAlignmentByPolicy", () =>
                    getHouseMemberAlignmentByPolicy(bioguideId, {
                        minVotes: policyMinVotes,
                        sort: "votes",
                    }), { bioguideId, policyMinVotes })
                : Promise.resolve([]),
            allowCurrentHouseComparisons
                ? timed("memberData:getHouseMemberAlignmentTopDeviations", () =>
                    getHouseMemberAlignmentTopDeviations(bioguideId, {
                        minVotes: policyMinVotes,
                    }), { bioguideId, policyMinVotes })
                : Promise.resolve([]),
        ]);

        const profile = {
            ...profileRaw,
            imageUrl: normalizeMemberImageUrl(profileRaw.imageUrl),
            selectedCongress,
        };

        return {
            profile,
            selectedCongress,
            monthly: toMonthlyStats(monthlyActivity),
            sponsoredRes,
            cosponsoredRes,
            alignmentPanel: allowCurrentHouseComparisons
                ? {
                    overall: alignOverall,
                    byPolicy: alignByPolicy,
                    topDeviations: alignDeviations,
                    minVotes: policyMinVotes,
                    sortDefault: "votes",
                }
                : null,
            kpis,
            monthlyActivity,
            subjects,
            bills,
        };
    } catch (err) {
        console.error("[fetchMemberData]", {
            message: err?.message,
            name: err?.name,
            code: err?.code,
            severity: err?.severity,
            routine: err?.routine,
            bioguideId,
            service: process.env.K_SERVICE || null,
            revision: process.env.K_REVISION || null,
        });
        throw err;
    } finally {
        perfLog(`memberData:total: ${Math.round(performance.now() - totalStart)}ms`, {
            bioguideId,
        });
    }
}
