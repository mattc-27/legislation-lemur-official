// apps/web/app/api/search/preview/route.js
import { NextResponse } from "next/server";
import { searchPreview } from "@/lib/server/search/searchPreview";

export async function GET(req) {
    const { searchParams } = new URL(req.url);

    const result = await searchPreview({
        q: searchParams.get("q"),
        entityTypes: searchParams.getAll("entityType"),
        limit: searchParams.get("limit"),
    });

    return NextResponse.json(result);
}