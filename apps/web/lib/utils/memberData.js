// lib/memberData.js
import { normalizeMemberImageUrl } from "./memberImage";
import {
    getMemberProfile,
    getMemberMonthlyStats,
    getMemberSponsoredLegislation,
    getMemberCosponsoredLegislation,
    getHouseMemberVoteAlignment,
    getMemberKpis,
    getMemberMonthlyActivity,
    getMemberSubjects,
    getMemberBills,
    getMemberVoteAlignment,
    getHouseMemberAlignmentPanelOverall,
    getHouseMemberAlignmentByPolicy,
    getHouseMemberAlignmentTopDeviations
} from "../server/routes_stage/members";


export async function fetchMemberData(bioguideId) {
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
            getMemberProfile(bioguideId),
            getMemberMonthlyStats(bioguideId),
            getMemberSponsoredLegislation(bioguideId, { max: 250 }),
            getMemberCosponsoredLegislation(bioguideId, { max: 250 }),

            getHouseMemberAlignmentPanelOverall(bioguideId),
            getHouseMemberAlignmentByPolicy(bioguideId, { minVotes: 10, sort: "votes" }),
            getHouseMemberAlignmentTopDeviations(bioguideId, { minVotes: 10 }),

            getMemberKpis(bioguideId),
            getMemberMonthlyActivity(bioguideId),
            getMemberSubjects(bioguideId, { limit: 12 }),
            getMemberBills(bioguideId, { limit: 50 }),
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
    }
}