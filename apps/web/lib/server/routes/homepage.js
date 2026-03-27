import "server-only";
import { getBillsDirectoryV2 } from "../bills";

export async function getHomepageRecentBills(
    congress,
    { limit = 6, sort = "latest_action", chamber = null } = {}
) {
    const safeLimit = Math.max(1, Math.min(Number(limit) || 6, 12));

    const res = await getBillsDirectoryV2(congress, {
        sort,
        limit: safeLimit,
        offset: 0,
        chamber,
    });

    console.log(res)

    return {
        rows: res?.rows ?? [],
        total: res?.total ?? 0,
        congress: res?.congress ?? null,
        sort,
        limit: safeLimit,
    };
}