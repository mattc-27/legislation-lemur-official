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
} from "../server/routes_stage/members";




export async function fetchMemberData(bioguideId) {
    try {
        const [
            profileRaw,
            monthly,
            sponsoredRes,
            cosponsoredRes,
            alignment,
            kpis,
            monthlyActivity,
            subjects,
            bills,
        ] = await Promise.all([
            getMemberProfile(bioguideId),
            getMemberMonthlyStats(bioguideId),
            getMemberSponsoredLegislation(bioguideId, { max: 250 }),
            getMemberCosponsoredLegislation(bioguideId, { max: 250 }),
            getHouseMemberVoteAlignment(bioguideId),
            getMemberVoteAlignment(bioguideId),
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
            alignment,
            kpis,
            monthlyActivity,
            subjects,
            bills,
        };
    } catch (err) {
        // Cloud Logging-friendly structured error
        console.error("[fetchMemberData]", {
            message: err?.message,
            name: err?.name,
            code: err?.code,           // pg code like 42P01, etc.
            severity: err?.severity,
            routine: err?.routine,
            bioguideId,
            service: process.env.K_SERVICE || null,
            revision: process.env.K_REVISION || null,
        });

        throw err; // let Next error boundary handle UI
    }
}
