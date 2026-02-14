import { NextResponse } from "next/server";
import { autocompleteSubjects } from "@/lib/server/bills";

export async function GET(req) {
    const { searchParams } = new URL(req.url);
    const prefix = (searchParams.get("q") || "").trim();
    if (prefix.length < 2) return NextResponse.json({ items: [] });

    const items = await autocompleteSubjects(prefix);
    return NextResponse.json({ items });
}
