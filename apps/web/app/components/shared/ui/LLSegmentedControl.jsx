import Link from "next/link";

export default function LLSegmentedControl({ label, items = [], activeValue, className = "" }) {
  return (
    <div className={["ll3-segmented", className].filter(Boolean).join(" ")} aria-label={label}>
      {items.map((item) => {
        const active = item.value === activeValue || item.active;
        const classes = ["ll3-segmented__item", active ? "is-active" : ""].filter(Boolean).join(" ");
        if (item.href) {
          return <Link key={item.value || item.label} href={item.href} className={classes} aria-current={active ? "page" : undefined}>{item.icon}{item.label}</Link>;
        }
        return <button key={item.value || item.label} type="button" className={classes} aria-pressed={active} onClick={item.onClick}>{item.icon}{item.label}</button>;
      })}
    </div>
  );
}
