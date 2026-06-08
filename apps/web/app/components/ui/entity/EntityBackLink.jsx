"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import clsx from "clsx";

/**
 * Shared back link/button for direct entity pages.
 *
 * Use mode="link" for predictable navigation.
 * Use mode="back" only where router.back() is desired.
 */
export default function EntityBackLink({
  href = "/",
  children = "Back",
  mode = "link",
  fallbackHref = "/",
  icon = <ArrowLeft size={16} aria-hidden="true" />,
  className = "",
  ...props
}) {
  const router = useRouter();

  const classes = clsx("ll3-entityBackLink", className);

  if (mode === "back") {
    return (
      <button
        type="button"
        className={classes}
        onClick={() => {
          if (typeof window !== "undefined" && window.history.length > 1) {
            router.back();
          } else {
            router.push(fallbackHref || href || "/");
          }
        }}
        {...props}
      >
        {icon}
        <span>{children}</span>
      </button>
    );
  }

  return (
    <Link href={href || fallbackHref || "/"} className={classes} {...props}>
      {icon}
      <span>{children}</span>
    </Link>
  );
}
