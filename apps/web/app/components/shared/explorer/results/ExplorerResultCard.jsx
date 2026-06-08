import Link from "next/link";
export default function ExplorerResultCard({ href, icon, kicker, title, sub, summary, actions, className = "" }) {
  const Inner = () => <><span className="ll3-resultCard__icon" aria-hidden="true">{icon}</span><span className="ll3-resultCard__body">{kicker ? <span className="ll3-resultCard__kicker">{kicker}</span> : null}<h3 className="ll3-resultCard__title">{title}</h3>{sub ? <p className="ll3-resultCard__sub">{sub}</p> : null}{summary ? <p className="ll3-resultCard__summary">{summary}</p> : null}</span>{actions || <span className="ll3-searchResult__arrow" aria-hidden="true">→</span>}</>;
  if (href) return <Link href={href} className={["ll3-resultCard", className].filter(Boolean).join(" ")}><Inner /></Link>;
  return <article className={["ll3-resultCard", className].filter(Boolean).join(" ")}><Inner /></article>;
}
