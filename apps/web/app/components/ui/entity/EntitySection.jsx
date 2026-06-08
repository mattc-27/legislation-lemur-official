import clsx from "clsx";
import EntityCardHeader from "./EntityCardHeader";

/**
 * Shared vertical section wrapper.
 * Use when you need a semantic section but not necessarily a visual card.
 */
export default function EntitySection({
  as: Component = "section",
  eyebrow = null,
  title = null,
  description = null,
  meta = null,
  action = null,
  headingLevel = 2,
  gap = "md",
  className = "",
  headerClassName = "",
  children,
  ...props
}) {
  const hasHeader = eyebrow || title || description || meta || action;

  return (
    <Component
      className={clsx(
        "ll3-entitySection",
        gap && `ll3-entitySection--gap-${gap}`,
        className
      )}
      {...props}
    >
      {hasHeader ? (
        <EntityCardHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
          meta={meta}
          action={action}
          headingLevel={headingLevel}
          className={headerClassName}
        />
      ) : null}

      {children}
    </Component>
  );
}
