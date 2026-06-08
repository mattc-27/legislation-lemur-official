import clsx from "clsx";

/**
 * Shared card/panel primitive for bill/member detail pages.
 *
 * Replaces most use-cases for:
 * - llmp3-card / llmp3-panel
 * - llbd3-card / llbd3-panel
 */
export default function EntityCard({
  as: Component = "section",
  variant = "default",
  tone = "default",
  padded = true,
  className = "",
  children,
  ...props
}) {
  return (
    <Component
      className={clsx(
        "ll3-entityCard",
        variant !== "default" && `ll3-entityCard--${variant}`,
        tone !== "default" && `ll3-entityCard--tone-${tone}`,
        !padded && "ll3-entityCard--flush",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
