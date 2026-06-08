// app/components/features/home/RecentActivitySection.jsx
import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { getHomepageRecentBills } from "@/lib/server/routes/homepage";
import {
  getTopicMeta,
  normalizeTopicLabel,
} from "@/lib/utils/member-info-topics";
import { HOME_RECENT_ACTIVITY } from "@/lib/content/homeContent";

export const revalidate = 900;

function billSlugFromRecord(r) {
  const billType = r?.bill_type ?? r?.billType ?? r?.type;
  const billNumber = r?.bill_number ?? r?.billNumber ?? r?.number;
  const congress = r?.congress ?? r?.congress_num ?? r?.congressNumber;

  if (!billType || !billNumber || !congress) return null;
  return `${billType}-${billNumber}-${congress}`.toLowerCase();
}

function billHrefFromRecord(r) {
  const slug = billSlugFromRecord(r);
  return slug ? `/bills/${slug}` : null;
}

function preferBillHref(r, fallbackUrl = "/bills") {
  return billHrefFromRecord(r) ?? fallbackUrl;
}

function formatDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

function formatBillSummary(bill) {
  const latestAction =
    bill?.latest_action_text ??
    bill?.latestActionText ??
    bill?.summary ??
    bill?.description;

  if (latestAction && String(latestAction).trim()) {
    return String(latestAction).trim();
  }

  return "Recent activity captured for this bill in the current Congress.";
}

function formatBillMeta(bill) {
  const chamber =
    bill?.origin_chamber ??
    bill?.originChamber ??
    bill?.chamber ??
    "";

  const date =
    bill?.latest_action_date ??
    bill?.latestActionDate ??
    bill?.introduced_date ??
    bill?.introducedDate ??
    "";

  const formattedDate = formatDate(date);

  if (chamber && formattedDate) return `${chamber} • ${formattedDate}`;
  if (chamber) return String(chamber);
  if (formattedDate) return formattedDate;

  return "Recent activity";
}

function getBillTopicLabel(bill) {
  return normalizeTopicLabel(
    bill?.policy_area_name ??
    bill?.policyAreaName ??
    bill?.policy_area ??
    bill?.policyArea ??
    bill?.subject ??
    bill?.topic ??
    bill?.primary_subject ??
    bill?.primarySubject
  );
}

function getSafeTopicIcon(topic) {
  const meta = getTopicMeta?.(topic);
  return meta?.icon || BookOpen;
}

function normalizeBill(b, i) {
  const href = preferBillHref(b);
  const topic = getBillTopicLabel(b);

  return {
    id: b?.bill_id ?? b?.id ?? `bill-${i}`,
    title:
      b?.display_title ??
      b?.title ??
      b?.short_title ??
      b?.name ??
      (() => {
        const type = b?.bill_type ?? b?.type;
        const number = b?.bill_number ?? b?.number;
        return type && number
          ? `${String(type).toUpperCase()} ${number}`
          : "Untitled bill";
      })(),
    summary: formatBillSummary(b),
    meta: formatBillMeta(b),
    href,
    topic,
  };
}

export default async function RecentActivitySection({
  maxItems = 3,
  showHeader = true,
  eyebrow = HOME_RECENT_ACTIVITY.eyebrow,
  title = HOME_RECENT_ACTIVITY.title,
  sub = HOME_RECENT_ACTIVITY.description,
  cta = HOME_RECENT_ACTIVITY.cta,
}) {
  let data = { rows: [] };

  try {
    data =
      (await getHomepageRecentBills(null, {
        limit: maxItems,
        sort: "latest_action",
      })) || { rows: [] };
  } catch {
    data = { rows: [] };
  }

  const bills = (data?.rows ?? []).slice(0, maxItems).map(normalizeBill);

  const cards = bills.map((bill) => ({
    id: `bill-${bill.id}`,
    kind: "Recent bill",
    title: bill.title,
    summary: bill.summary,
    meta: bill.meta,
    href: bill.href ?? "/bills",
    topic: bill.topic,
  }));

  return (
    <section className="ll3-homeSection ll3-homeActivity" aria-labelledby="home-activity-title">
      {showHeader && (
        <div className="ll3-homeSection__header ll3-homeSection__header--split">
          <div>
            <div className="ll3-homeEyebrow">{eyebrow}</div>
            <h2 className="ll3-homeSection__title" id="home-activity-title">
              {title}
            </h2>
          </div>

          {cta?.href && cta?.label ? (
            <Link className="ll3-homeSection__action" href={cta.href}>
              {cta.label}
            </Link>
          ) : null}
        </div>
      )}

      {sub ? <p className="ll3-homeSection__sub ll3-homeActivity__sub">{sub}</p> : null}

      {cards.length ? (
        <div className="ll3-activityGrid">
          {cards.map((card) => {
            const TopicIcon = getSafeTopicIcon(card.topic);

            return (
              <Link className="ll3-activityCard" href={card.href} key={card.id}>
                <div
                  className="ll3-activityCard__icon"
                  aria-hidden="true"
                  title={card.topic || "Topic"}
                >
                  <TopicIcon size={18} strokeWidth={2} />
                </div>

                <div className="ll3-activityCard__kind">{card.kind}</div>
                <h3 className="ll3-activityCard__title">{card.title}</h3>
                <p className="ll3-activityCard__summary">{card.summary}</p>

                <div className="ll3-activityCard__footer">
                  <span className="ll3-activityCard__meta">{card.meta}</span>
                  <span className="ll3-activityCard__open">
                    Open
                    <ArrowRight size={14} strokeWidth={2} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="ll3-homePanel ll3-homePanel--empty">
          <p className="text-dim">
            Nothing to show just yet — activity cards will appear here as soon as
            new bills and major actions are ingested.
          </p>
        </div>
      )}
    </section>
  );
}
