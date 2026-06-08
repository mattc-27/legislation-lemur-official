//
import { NextResponse } from "next/server";
import { searchGlobal } from "@/lib/server/search/searchGlobal";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const entityTypes = searchParams.getAll("entityType");

    const result = await searchGlobal({
        q: searchParams.get("q"),
        entityTypes,
        chamber: searchParams.get("chamber"),
        stateCode: searchParams.get("state"),
        statusCode: searchParams.get("status"),
        policyAreaId: searchParams.get("policyAreaId"),
        hasSummary: searchParams.get("hasSummary"),
        sort: searchParams.get("sort"),
        limit: searchParams.get("limit"),
        offset: searchParams.get("offset"),
    });

    return NextResponse.json(result);
}