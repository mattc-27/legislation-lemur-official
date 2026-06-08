import Link from "next/link";

export default function LLButton({ as: As = "button", href, variant = "secondary", size = "md", full = false, className = "", children, ...props }) {
  const classes = ["ll3-btn", `ll3-btn--${variant}`, size === "sm" ? "ll3-btn--sm" : "", full ? "ll3-btn--full" : "", className].filter(Boolean).join(" ");
  if (href) return <Link href={href} className={classes} {...props}>{children}</Link>;
  return <As className={classes} {...props}>{children}</As>;
}
