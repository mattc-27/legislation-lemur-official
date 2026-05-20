// lib/memberData.js
import { normalizeMemberImageUrl } from "../memberImage";
import { perfLog } from "@/lib/server/debug/perf";

import {
    getMemberProfile,
    getMemberMonthlyStats,
    getMemberSponsoredLegislation,
    getMemberCosponsoredLegislation,
    getMemberKpis,
    getMemberMonthlyActivity,
    getMemberSubjects,
    getMemberBills,
    getHouseMemberAlignmentPanelOverall,
    getHouseMemberAlignmentByPolicy,
    getHouseMemberAlignmentTopDeviations,
} from "../../server/routes/temp/members";

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

export async function fetchMemberData(bioguideId) {
    const totalStart = performance.now();

    try {
        const [
            profileRaw,
            monthly,
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
            timed("memberData:getMemberProfile", () => getMemberProfile(bioguideId), { bioguideId }),
            timed("memberData:getMemberMonthlyStats", () => getMemberMonthlyStats(bioguideId), { bioguideId }),
            timed("memberData:getMemberSponsoredLegislation", () =>
                getMemberSponsoredLegislation(bioguideId, { max: 250 }), { bioguideId }
            ),
            timed("memberData:getMemberCosponsoredLegislation", () =>
                getMemberCosponsoredLegislation(bioguideId, { max: 250 }), { bioguideId }
            ),

            timed("memberData:getHouseMemberAlignmentPanelOverall", () =>
                getHouseMemberAlignmentPanelOverall(bioguideId), { bioguideId }
            ),
            timed("memberData:getHouseMemberAlignmentByPolicy", () =>
                getHouseMemberAlignmentByPolicy(bioguideId, { minVotes: 10, sort: "votes" }), { bioguideId }
            ),
            timed("memberData:getHouseMemberAlignmentTopDeviations", () =>
                getHouseMemberAlignmentTopDeviations(bioguideId, { minVotes: 10 }), { bioguideId }
            ),

            timed("memberData:getMemberKpis", () => getMemberKpis(bioguideId), { bioguideId }),
            timed("memberData:getMemberMonthlyActivity", () => getMemberMonthlyActivity(bioguideId), { bioguideId }),
            timed("memberData:getMemberSubjects", () =>
                getMemberSubjects(bioguideId, { limit: 12 }), { bioguideId }
            ),
            timed("memberData:getMemberBills", () =>
                getMemberBills(bioguideId, { limit: 50 }), { bioguideId }
            ),
        ]);

        const profile = {
            ...profileRaw,
            imageUrl: normalizeMemberImageUrl(profileRaw?.imageUrl),
        };

        return {
            profile,
            monthly,
            sponsoredRes,
            cosponsoredRes,

            alignmentPanel: {
                overall: alignOverall,
                byPolicy: alignByPolicy,
                topDeviations: alignDeviations,
                minVotes: 10,
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
        perfLog(`memberData:total: ${Math.round(performance.now() - totalStart)}ms`, {
            bioguideId,
        });
    }
}