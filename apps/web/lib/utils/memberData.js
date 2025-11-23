// lib/memberData.js
import * as Sentry from "@sentry/nextjs";
import {
    getMemberProfile,
    getMemberMonthlyStats,
    getMemberSponsoredLegislation,
    getMemberCosponsoredLegislation,
    // getMemberRecentVotes,
    getHouseMemberVoteAlignment,
    getMemberKpis,
    getMemberMonthlyActivity,
    getMemberSubjects,
    getMemberBills,
    getMemberVoteAlignment,
} from "../server/members";

export async function fetchMemberData(bioguideId) {
    try {
        const [
            profile,
            monthly,
            sponsoredRes,
            cosponsoredRes,
            // recentVotes,
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
            // getMemberRecentVotes(bioguideId, { limit: 25 }),
            getHouseMemberVoteAlignment(bioguideId),
            getMemberVoteAlignment(bioguideId),
            getMemberKpis(bioguideId),
            getMemberMonthlyActivity(bioguideId),
            getMemberSubjects(bioguideId, { limit: 12 }),
            getMemberBills(bioguideId, { limit: 50 }),
        ]);

        return {
            profile,
            monthly,
            sponsoredRes,
            cosponsoredRes,
            // recentVotes,
            alignment,
            kpis,
            monthlyActivity,
            subjects,
            bills,
        };
    } catch (err) {
        Sentry.captureException(err, {
            tags: { helper: "fetchMemberData" },
            extra: { bioguideId },
        });
        throw err; // still let the page error; Sentry now has the context
    }
}
