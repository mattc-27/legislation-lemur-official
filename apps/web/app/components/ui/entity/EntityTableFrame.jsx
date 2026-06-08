import clsx from "clsx";
import EntityEmptyState from "./EntityEmptyState";

/**
 * Shared scroll/frame wrapper for tables and list-style tables.
 */
export default function EntityTableFrame({
  children,
  tight = false,
  scroll = false,
  empty = false,
  emptyTitle = "No results found",
  emptyDescription = null,
  className = "",
  bodyClassName = "",
  ...props
}) {
  return (
    <div
      className={clsx(
        "ll3-entityTableFrame",
        tight && "ll3-entityTableFrame--tight",
        scroll && "ll3-entityTableFrame--scroll",
        className
      )}
      {...props}
    >
      {empty ? (
        <EntityEmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        <div className={clsx("ll3-entityTableFrame__body", bodyClassName)}>
          {children}
        </div>
      )}
    </div>
  );
}
