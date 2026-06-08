import Link from "next/link";
import { Building2, FileText, MapPin, UserRound } from "lucide-react";

const ENTITY_META = {
  bill: {
    label: "Bill",
    icon: FileText,
    className: "ll3-searchResult--bill",
  },
  member: {
    label: "Member",
    icon: UserRound,
    className: "ll3-searchResult--member",
  },
  committee: {
    label: "Committee",
    icon: Building2,
    className: "ll3-searchResult--committee",
  },
  seat: {
    label: "Seat",
    icon: MapPin,
    className: "ll3-searchResult--seat",
  },
};

function entityHref(item) {
  if (item?.href) return item.href;

  if (item?.entity_type === "bill") {
    const slug =
      item?.slug ||
      item?.entity_slug ||
      item?.bill_slug ||
      item?.url_slug ||
      item?.entity_id;

    return slug ? `/bills/${slug}` : "/bills";
  }

  if (item?.entity_type === "member") {
    const id =
      item?.bioguide_id ||
      item?.bioguideId ||
      item?.entity_id ||
      item?.member_id;

    return id ? `/member/${id}` : "/member";
  }

  if (item?.entity_type === "committee") {
    const id =
      item?.committee_code ||
      item?.committee_system_code ||
      item?.entity_id;

    return id ? `/committees/${id}` : "/committees";
  }

  return "/search";
}

function clean(value) {
  if (value == null) return "";
  return String(value).trim();
}

function titleFor(item) {
  return (
    clean(item?.title) ||
    clean(item?.display_title) ||
    clean(item?.name) ||
    clean(item?.entity_title) ||
    "Untitled result"
  );
}

function snippetFor(item) {
  return (
    clean(item?.snippet) ||
    clean(item?.summary) ||
    clean(item?.summary_short) ||
    clean(item?.description) ||
    clean(item?.search_text)
  );
}

function metaParts(item) {
  const parts = [];

  if (item?.bill_type || item?.bill_number) {
    const billCode = [item?.bill_type, item?.bill_number].filter(Boolean).join(" · ");
    if (billCode) parts.push(String(billCode).toUpperCase());
  }

  if (item?.origin_chamber || item?.chamber) {
    parts.push(clean(item.origin_chamber || item.chamber));
  }

  if (item?.status_label || item?.status) {
    parts.push(clean(item.status_label || item.status));
  }

  if (item?.committee_type) {
    parts.push(clean(item.committee_type));
  }

  if (item?.party || item?.state || item?.district) {
    const district = item?.district ? `${item?.state || ""}-${item.district}` : item?.state;
    const personMeta = [item?.party, district].filter(Boolean).join(" · ");
    if (personMeta) parts.push(personMeta);
  }

  return parts.filter(Boolean);
}

function factParts(item) {
  const facts = [];

  if (item?.latest_action_date) facts.push(`Latest action: ${item.latest_action_date}`);
  if (item?.latest_action_text) facts.push(item.latest_action_text);
  if (Number.isFinite(item?.cosponsor_count)) facts.push(`${item.cosponsor_count} cosponsors`);
  if (Number.isFinite(item?.subcommittee_count)) facts.push(`${item.subcommittee_count} subcommittees`);

  return facts.filter(Boolean).slice(0, 2);
}

export default function SearchResultCard({ item, featured = false }) {
  const meta = ENTITY_META[item?.entity_type] || ENTITY_META.bill;
  const Icon = meta.icon;
  const href = entityHref(item);
  const title = titleFor(item);
  const snippet = snippetFor(item);
  const parts = metaParts(item);
  const facts = factParts(item);

  return (
    <Link
      href={href}
      className={[
        "ll3-searchResult",
        meta.className,
        featured ? "is-featured" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="ll3-searchResult__stripe" aria-hidden="true" />

      <div className="ll3-searchResult__icon">
        <Icon size={16} aria-hidden="true" />
      </div>

      <div className="ll3-searchResult__body">
        <div className="ll3-searchResult__topline">
          <span className="ll3-searchResult__type">{meta.label}</span>
          {item?.status_label ? (
            <span className="ll3-searchResult__badge">{item.status_label}</span>
          ) : null}
        </div>

        <h3 className="ll3-searchResult__title">{title}</h3>

        {parts.length ? (
          <div className="ll3-searchResult__meta">
            {parts.map((part, index) => (
              <span key={`${part}-${index}`}>{part}</span>
            ))}
          </div>
        ) : null}

        {snippet ? (
          <p className="ll3-searchResult__snippet">{snippet}</p>
        ) : null}

        {facts.length ? (
          <div className="ll3-searchResult__facts">
            {facts.map((fact, index) => (
              <span key={`${fact}-${index}`}>{fact}</span>
            ))}
          </div>
        ) : null}
      </div>

      <span className="ll3-searchResult__arrow" aria-hidden="true">
        →
      </span>
    </Link>
  );
}