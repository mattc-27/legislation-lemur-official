// Canonical: lib/utils/memberData.js
// Bill activity is loaded through lib/server/routes/members.js, which reads
// sandbox_lemur_app_views_v1.mv_member_bill_activity_v2.
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

        perfLog(`${label}: ${Math.round(performance.now() - start)}ms`, {
            ...meta,
        });

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
    return [...monthlyActivity]
        .reverse()
        .map((row) => ({
            month: row.month,
            sponsored: row.sponsored_count ?? 0,
            cosponsored: row.cosponsored_count ?? 0,
        }));
}

export async function fetchMemberData(
    bioguideId,
    {
        congress = 119,
        billLimit = 50,
        legislationLimit = 250,
        subjectLimit = 12,
        policyMinVotes = 10,
    } = {}
) {
    const totalStart = performance.now();

    try {
        const [
            profileRaw,
            sponsoredRes,
            cosponsoredRes,
            alignOverall,
            alignByPolicy,
            alignDeviations,
            kpis,
            monthlyActivity,
            subjects,
            bills,
        ] = await Promise.all([
            timed(
                "memberData:getMemberProfile",
                () => getMemberProfile(bioguideId),
                { bioguideId }
            ),
            timed(
                "memberData:getMemberSponsoredLegislation",
                () =>
                    getMemberSponsoredLegislation(bioguideId, {
                        max: legislationLimit,
                    }),
                { bioguideId, legislationLimit }
            ),
            timed(
                "memberData:getMemberCosponsoredLegislation",
                () =>
                    getMemberCosponsoredLegislation(bioguideId, {
                        max: legislationLimit,
                    }),
                { bioguideId, legislationLimit }
            ),
            timed(
                "memberData:getHouseMemberAlignmentPanelOverall",
                () => getHouseMemberAlignmentPanelOverall(bioguideId),
                { bioguideId }
            ),
            timed(
                "memberData:getHouseMemberAlignmentByPolicy",
                () =>
                    getHouseMemberAlignmentByPolicy(bioguideId, {
                        minVotes: policyMinVotes,
                        sort: "votes",
                    }),
                { bioguideId, policyMinVotes }
            ),
            timed(
                "memberData:getHouseMemberAlignmentTopDeviations",
                () =>
                    getHouseMemberAlignmentTopDeviations(bioguideId, {
                        minVotes: policyMinVotes,
                    }),
                { bioguideId, policyMinVotes }
            ),
            timed(
                "memberData:getMemberKpis",
                () => getMemberKpis(bioguideId),
                { bioguideId }
            ),
            timed(
                "memberData:getMemberMonthlyActivity",
                () => getMemberMonthlyActivity(bioguideId),
                { bioguideId }
            ),
            timed(
                "memberData:getMemberSubjects",
                () => getMemberSubjects(bioguideId, { limit: subjectLimit }),
                { bioguideId, subjectLimit }
            ),
            timed(
                "memberData:getMemberBills",
                () =>
                    getMemberBills(bioguideId, {
                        congress,
                        limit: billLimit,
                    }),
                { bioguideId, congress, billLimit }
            ),
        ]);

        const profile = profileRaw
            ? {
                ...profileRaw,
                imageUrl: normalizeMemberImageUrl(profileRaw.imageUrl),
            }
            : null;

        return {
            profile,
            monthly: toMonthlyStats(monthlyActivity),
            sponsoredRes,
            cosponsoredRes,

            alignmentPanel: {
                overall: alignOverall,
                byPolicy: alignByPolicy,
                topDeviations: alignDeviations,
                minVotes: policyMinVotes,
                sortDefault: "votes",
            },

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
        perfLog(
            `memberData:total: ${Math.round(performance.now() - totalStart)}ms`,
            { bioguideId }
        );
    }
}
