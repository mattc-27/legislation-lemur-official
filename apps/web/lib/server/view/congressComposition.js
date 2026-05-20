import "server-only";
import { pool } from "../db/db";
import { q } from "../db/instrumented-query";


function normalizeSeat(seat = {}) {
    const stateCode = String(seat.stateCode || seat.state_code || "").toUpperCase();
    const district = seat.district;

    return {
        ...seat,
        districtId: seat.districtId || seat.district_id,
        stateCode,
        district,
        districtLabel:
            seat.districtLabel ||
            seat.district_label ||
            (district === 0 || district === "0"
                ? `${stateCode}-AL`
                : `${stateCode}-${district}`),
        partyCode: seat.partyCode || seat.party_code || seat.party || null,
        partyName: seat.partyName || seat.party_name || null,
        isVacant: Boolean(seat.isVacant ?? seat.is_vacant),
        memberId: seat.memberId || seat.member_id || seat.bioguide_id || null,
        memberName: seat.memberName || seat.member_name || seat.name || null,
        imageUrl: seat.imageUrl || seat.image_url || null,
    };
}

function normalizeHouse(row) {
    if (!row) return null;

    return {
        ...row,
        seats: Array.isArray(row.seats) ? row.seats.map(normalizeSeat) : [],
    };
}

export async function getCongressCompositionReferenceData(congress = 119) {
    const client = await pool.connect();

    try {
        const statesPromise = client.query(
            `
                select *
                from sandbox_lemur_app_views_v1.v_congress_composition_state_v1
                where congress = $1
                order by state_code
            `,
            [congress]
        );

        const housePromise = client.query(
            `
                select *
                from sandbox_lemur_app_views_v1.v_house_composition_current_v1
                where congress = $1
                limit 1
            `,
            [congress]
        );

        const [statesRes, houseRes] = await Promise.all([
            statesPromise,
            housePromise,
        ]);

        return {
            congress,
            states: statesRes.rows,
            house: normalizeHouse(houseRes.rows[0] || null),
        };
    } finally {
        client.release();
    }
}