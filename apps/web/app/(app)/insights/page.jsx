// app/(app)/insights/page.jsx
import Link from "next/link";

import { getBillsDirectoryV2, getBillsFilterOptionsV2, getBillsFacetCountsV2 } from "@/lib/server/bills";
import { parseBillsFiltersV2 } from "@/lib/domains/bills/queryV2";

import PolicyAreaBreakdownPanel from "@/app/components/features/bills/PolicyAreaBreakdownPanel";
import "@/app/styles/active/insights/ll3.insights.layout.css"
import "@/app/styles/active/insights/ll3.insights.policy-area.panel.css";
import WipBannerClient from "@/app/components/features/WipBannerClient";
import "@/app/styles/active/insights/ll3.insights.banner.css";

import ImpactTrendingScatterPanel from "@/app/components/features/insights/ImpactTrendingScatterPanel";
import { getImpactTrendingMap } from "@/lib/server/insights";

import "@/app/styles/active/insights/ll3.insights.scatter.css";


// Optional: if your site uses a shared “active” tokens file, keep it.
// Otherwise rely on bills tokens/ui already loaded globally.
// import "@/app/styles/active/home.ll3.css";

function toParams(searchParams) {
    // Next passes `searchParams` as an object; URLSearchParams wants string values.
    const p = new URLSearchParams();
    Object.entries(searchParams || {}).forEach(([k, v]) => {
        if (v == null) return;
        if (Array.isArray(v)) v.forEach((x) => p.append(k, String(x)));
        else p.set(k, String(v));
    });
    return p;
}

export default async function InsightsPage({ searchParams }) {
    // Reuse your existing filter parsing so Insights matches Bills behavior.
    const parsed = parseBillsFiltersV2(searchParams || {});
    const baseParams = toParams(searchParams || {});

    // Insights is “analytics over current filter set” → always reset paging params in links.
    baseParams.set("offset", "0");

    // Reuse existing server calls:
    // - filterOptions => policy area dictionary (and more for future panels)
    // - facetCounts   => policy area counts (and more)
    // - directory     => total matching bills (useful KPI)
    const [filterOptions, facetCounts, directory, scatter] = await Promise.all([
        getBillsFilterOptionsV2(),
        getBillsFacetCountsV2(parsed),
        getBillsDirectoryV2(parsed),
        getImpactTrendingMap({ congress: parsed?.congress ?? null, limit: 600 }),
    ]);
    // Expected shapes (based on your prior usage patterns):
    // facetCounts.policyAreaCounts: [{ policy_area_id, bill_count }]
    // filterOptions.policyAreas: [{ policy_area_id, policy_area_name, policy_area_slug }]
    // directory.totalCount: number
    const counts = facetCounts?.policyAreaCounts || facetCounts?.policy_area_counts || [];
    const dict = filterOptions?.policyAreas || filterOptions?.policy_areas || [];
    const total = Number(directory?.totalCount ?? directory?.total_count ?? 0);

    return (
        <div className="ll3-insights">
            <header className="ll3-head">
                <div className="ll3-head__top">
                    <h1 className="ll3-h1">Insights</h1>

                    <div className="ll3-head__meta">
                        <div className="ll3-kpi">
                            <div className="ll3-kpi__label">Matching bills</div>
                            <div className="ll3-kpi__value">{total.toLocaleString()}</div>
                        </div>

                        {/* Quick escape hatch back to the directory */}
                        <Link className="ll3-linkbtn" href={`/bills?${baseParams.toString()}`} prefetch={false}>
                            View bills
                        </Link>
                    </div>
                </div>

                <p className="ll3-sub">
                    A neutral breakdown of where the current result set clusters. (Filters will come next.)
                </p>
            </header>

            <div className="ll3-insights__banner">
                <WipBannerClient />
            </div>
            <div className="ll3-insightsGrid">
                <ImpactTrendingScatterPanel data={scatter} baseParams={baseParams} />

                <PolicyAreaBreakdownPanel
                    counts={counts}
                    dict={dict}
                    total={total}
                    limit={10}
                    currentPolicyAreaId={parsed?.policyAreaId ?? null}
                    baseParams={baseParams}
                />
                {/* placeholder... */}
                <PolicyAreaBreakdownPanel
                    counts={counts}
                    dict={dict}
                    total={total}
                    limit={10}
                    currentPolicyAreaId={parsed?.policyAreaId ?? null}
                    baseParams={baseParams}
                    title="Policy areas"
                    subtitle="Where these bills cluster"
                />

                {/* Placeholder for next panel */}
                <section className="ll3-insightsPanel" aria-label="Coming soon">
                    <h3 className="ll3-h3" style={{ margin: 0, color: "var(--ll3-ink)", fontWeight: 900 }}>
                        More insights
                    </h3>
                    <p className="ll3-muted" style={{ marginTop: 6 }}>
                        Next: status stage breakdown, chamber split, and top subjects.
                    </p>
                </section>
            </div>
        </div>
    );
}
