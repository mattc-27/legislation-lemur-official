"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import GlobalSearchBoxClient from "./GlobalSearchBoxClient";
import SearchFilterDrawer from "./SearchFilterDrawer";
import SearchResultsHeader from "./SearchResultsHeader";
import SearchResultCard from "./SearchResultCard";
import SearchResultsGrouped from "./SearchResultsGrouped";
import ExplorerToolLinks from "@/app/components/shared/navigation/ExplorerToolLinks";
import { EmptyWorkspace, NoResultsState } from "./SearchEmptyState";

export default function SearchWorkspaceClient({ filters, rows = [], grouped = {}, hasQuery, mode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const bestMatches = useMemo(() => rows.slice(0, 3), [rows]);
  const resolvedMode = mode || (hasQuery ? "results" : "landing");
  return (
    <main className={`ll3-searchPage ${hasQuery ? "is-results" : "is-empty"}`} data-mode={resolvedMode}>
      <section className="ll3-searchHero">

        <div className="container ll3-searchHero__inner">


          {/* 
          <div className="ll3-searchHero__copy">
            <div className="ll3-searchHero__eyebrow">Smart search</div>
            <h1 className="ll3-searchHero__title">Search Congress</h1>
            <p className="ll3-searchHero__sub">
              Find bills, members, committees, topics, and legislative context from one search workspace.
            </p>
          </div>
          */}
          <div className="ll3-searchHero__miniHead">
            <span className="ll3-searchHero__eyebrow">Lemur Explorer</span>
            <h1>Search Congress</h1>
          </div>
          <GlobalSearchBoxClient
            variant="searchPage"
            initialQuery=""
            showPopular={false}
            showPreview={!hasQuery}
            placeholder={
              hasQuery
                ? "Search again…"
                : "Search bills, members, committees, votes, topics…"
            }
          />
          <div className="ll3-searchHero__directoryLinks ll3-searchHero__linksRow">

            {hasQuery ? (
              <>
                <Link href="/search" className="ll3-searchHero__clearLink">
                  Reset search
                </Link>
              </>
            ) : null}
          </div>
        </div>
      </section>
      <section className="ll3-searchBody">
        <div className="ll3-searchContent">
          {!hasQuery ? (
            <EmptyWorkspace />
          ) : (
            <>
              <SearchResultsHeader
                filters={filters}
                rows={rows}
                grouped={grouped}
                onOpenFilters={() => setDrawerOpen(true)}
              />

              {rows.length === 0 ? (
                <NoResultsState query={filters.q} />
              ) : (
                <>


                  <SearchResultsGrouped grouped={grouped} />
                </>
              )}
            </>
          )}
        </div>
      </section>
      <SearchFilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} filters={filters} />
    </main >
  );
}
