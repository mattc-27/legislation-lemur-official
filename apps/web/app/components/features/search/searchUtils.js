export const ENTITY_OPTIONS = [
  { value: "", label: "All" },
  { value: "bill", label: "Bills" },
  { value: "member", label: "Members" },
  { value: "committee", label: "Committees" },
  { value: "seat", label: "Seats" },
];

export const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "latest_action", label: "Latest action" },
  { value: "updated", label: "Recently updated" },
  { value: "introduced", label: "Introduced date" },
];

export const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "introduced", label: "Introduced" },
  { value: "committee", label: "In committee" },
  { value: "reported", label: "Reported" },
  { value: "passed_house", label: "Passed House" },
  { value: "passed_senate", label: "Passed Senate" },
  { value: "passed_chamber", label: "Passed chamber" },
  { value: "enacted", label: "Enacted / law" },
];

export const POLICY_AREA_OPTIONS = [
  { value: "", label: "All policy areas" },
  { value: "2000", label: "Agriculture and Food" },
  { value: "2001", label: "Armed Forces and National Security" },
  { value: "2002", label: "Commerce" },
  { value: "2003", label: "Crime and Law Enforcement" },
  { value: "2004", label: "Economics and Public Finance" },
  { value: "2005", label: "Education" },
  { value: "2006", label: "Energy" },
  { value: "2007", label: "Environmental Protection" },
  { value: "2008", label: "Health" },
  { value: "2009", label: "Immigration" },
  { value: "2010", label: "Taxation" },
  { value: "2011", label: "Transportation and Public Works" },
];

export function entityLabel(type, plural = false) {
  if (type === "bill") return plural ? "Bills" : "Bill";
  if (type === "member") return plural ? "Members" : "Member";
  if (type === "committee") return plural ? "Committees" : "Committee";
  if (type === "seat") return plural ? "Seats" : "Seat";
  return plural ? "Results" : "Result";
}

export function stripMarks(html = "") {
  return String(html)
    .replaceAll("<mark>", "")
    .replaceAll("</mark>", "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getEntityCounts(grouped = {}, rows = []) {
  return {
    all: rows.length || 0,
    bill: grouped?.bills?.length || 0,
    member: grouped?.members?.length || 0,
    committee: grouped?.committees?.length || 0,
    seat: grouped?.seats?.length || 0,
  };
}

export function paramsFrom(filters = {}, patch = {}) {
  const params = new URLSearchParams();
  const merged = { ...filters, ...patch };

  if (merged.q) params.set("q", merged.q);

  const entityTypes = Array.isArray(merged.entityTypes)
    ? merged.entityTypes
    : merged.entityType
      ? [merged.entityType]
      : [];

  entityTypes.filter(Boolean).forEach((v) => params.append("entityType", v));

  if (merged.chamber) params.set("chamber", merged.chamber);
  if (merged.stateCode) params.set("state", String(merged.stateCode).toUpperCase());
  if (merged.statusCode) params.set("status", merged.statusCode);
  if (merged.policyAreaId) params.set("policyAreaId", merged.policyAreaId);
  if (merged.hasSummary) params.set("hasSummary", "true");
  if (merged.sort && merged.sort !== "relevance") params.set("sort", merged.sort);

  return params.toString() ? `/search?${params.toString()}` : "/search";
}
