import Link from "next/link";

const TOOL_ITEMS = [
  { href: "/search", label: "Smart Search", key: "search" },
  { href: "/bills", label: "Legislation Archive", key: "bills" },
  { href: "/member", label: "Member Directory", key: "member" },
  { href: "/committees", label: "Committees", key: "committees" },
];

export default function ExplorerToolLinks({ active = "", ariaLabel = "Related search tools", className = "", items }) {
  const links = items || (active === "search" ? [{ href: "/", label: "Home", key: "home" }, ...TOOL_ITEMS.filter((x) => x.key !== "search")] : TOOL_ITEMS);
  return (
    <nav className={["ll3-explorerLinks", className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      {links.map((item) => {
        const isActive = item.key === active || item.href === active;
        return <Link key={item.key || item.href} href={item.href} className={["ll3-explorerLink", isActive ? "is-active" : ""].filter(Boolean).join(" ")} aria-current={isActive ? "page" : undefined}><span className="ll3-explorerLink__label">{item.label}</span></Link>;
      })}
    </nav>
  );
}
