import { searchGlobal } from "@/lib/server/search/searchGlobal";
import { getBillsFilterOptionsV2 } from "@/lib/server/bills/indexV2";
import SearchWorkspaceClient from "@/app/components/features/search/SearchWorkspaceClient";

import "@/app/styles/active/core/ll3.tokens.css";
import "@/app/styles/active/core/ll3.type.css";
import "@/app/styles/active/core/ll3.buttons.css";
import "@/app/styles/active/core/ll3.forms.css";
import "@/app/styles/active/core/ll3.cards.css";
import "@/app/styles/active/core/ll3.filters.css";
import "@/app/styles/active/core/ll3.global-search.css";
// import "@/app/styles/active/core/ll3.search.css";
import "@/app/styles/active/core/ll3.search.refactored.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
function first(value) { if (Array.isArray(value)) return value[0] || ""; return value || ""; }
function all(searchParams, key) { const raw = searchParams?.[key]; if (Array.isArray(raw)) return raw.filter(Boolean).map(String); return raw ? [String(raw)] : []; }
function normalizeSearchFilters(searchParams = {}) { const entityTypes = all(searchParams, "entityType"); return { q: String(first(searchParams.q)).trim(), entityTypes, chamber: String(first(searchParams.chamber)).trim(), stateCode: String(first(searchParams.state)).trim().toUpperCase(), statusCode: String(first(searchParams.status)).trim(), policyAreaId: first(searchParams.policyAreaId) ? Number(first(searchParams.policyAreaId)) : null, hasSummary: first(searchParams.hasSummary) === "true", party: String(first(searchParams.party)).trim(), seatStatus: String(first(searchParams.seatStatus)).trim(), sort: String(first(searchParams.sort) || "relevance").trim(), limit: Number(first(searchParams.limit) || 40), offset: Number(first(searchParams.offset) || 0) }; }
function groupRows(rows = []) { return { bills: rows.filter((r) => r.entity_type === "bill"), members: rows.filter((r) => r.entity_type === "member"), committees: rows.filter((r) => r.entity_type === "committee"), seats: rows.filter((r) => r.entity_type === "seat") }; }
async function getSearchFilterOptionsSafe() { try { const options = await getBillsFilterOptionsV2(); return { statuses: options?.statuses || [], policyAreas: options?.policyAreas || [] }; } catch { return { statuses: [], policyAreas: [] }; } }
export default async function SearchPage({ searchParams }) { const sp = await searchParams; const filters = normalizeSearchFilters(sp); const hasQuery = Boolean(filters.q); const [searchResult, filterOptions] = await Promise.all([hasQuery ? searchGlobal({ q: filters.q, entityTypes: filters.entityTypes, chamber: filters.chamber, stateCode: filters.stateCode, statusCode: filters.statusCode, policyAreaId: filters.policyAreaId, hasSummary: filters.hasSummary, sort: filters.sort, limit: filters.limit, offset: filters.offset }) : Promise.resolve({ rows: [], grouped: { bills: [], members: [], committees: [], seats: [] } }), getSearchFilterOptionsSafe()]); const rows = searchResult?.rows || []; const grouped = searchResult?.grouped || groupRows(rows); return <SearchWorkspaceClient filters={filters} rows={rows} grouped={grouped} hasQuery={hasQuery} filterOptions={filterOptions} mode={hasQuery ? "results" : "landing"} />; }
