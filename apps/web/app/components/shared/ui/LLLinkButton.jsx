import Link from "next/link";

export default function LLLinkButton({ href, variant = "secondary", size = "md", full = false, className = "", children, ...props }) {
  return (
    <Link href={href} className={["ll3-linkBtn", `ll3-linkBtn--${variant}`, size === "sm" ? "ll3-linkBtn--sm" : "", full ? "ll3-linkBtn--full" : "", className].filter(Boolean).join(" ")} {...props}>
      {children}
    </Link>
  );
}
