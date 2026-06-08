import clsx from "clsx";

/**
 * Shared main/sidebar layout for bill/member detail pages.
 */
export default function EntityContentLayout({
  children,
  sidebar = null,
  sidebarPosition = "right",
  sidebarWidth = "md",
  className = "",
  mainClassName = "",
  sidebarClassName = "",
  ...props
}) {
  const hasSidebar = !!sidebar;

  return (
    <div
      className={clsx(
        "ll3-entityContentLayout",
        hasSidebar && "ll3-entityContentLayout--hasSidebar",
        sidebarPosition === "left" && "ll3-entityContentLayout--sidebarLeft",
        sidebarWidth && `ll3-entityContentLayout--sidebar-${sidebarWidth}`,
        className
      )}
      {...props}
    >
      <main className={clsx("ll3-entityContentLayout__main", mainClassName)}>
        {children}
      </main>

      {hasSidebar ? (
        <aside className={clsx("ll3-entityContentLayout__sidebar", sidebarClassName)}>
          {sidebar}
        </aside>
      ) : null}
    </div>
  );
}
