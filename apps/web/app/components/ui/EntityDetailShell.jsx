function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

const WIDTH_CLASS = {
  default: "ll3-detailWrap--default",
  narrow: "ll3-detailWrap--narrow",
  wide: "ll3-detailWrap--wide",
  full: "ll3-detailWrap--full",
};

/**
 * Shared direct entity detail page shell.
 *
 * Owns the page-level wrapper only. Bill/member/detail content should remain
 * inside feature components so the same content can also render in RoutePanelShell.
 */
export default function EntityDetailShell({
  as: Component = "main",
  entity = "generic",
  mode = "page",
  width = "default",
  variant,
  className,
  wrapClassName,
  children,
  ...props
}) {
  const resolvedWidth = variant || width;
  const widthClass = WIDTH_CLASS[resolvedWidth] || WIDTH_CLASS.default;

  return (
    <Component
      className={cx(
        "ll3-entityDetail",
        mode && `ll3-entityDetail--${mode}`,
        entity && `ll3-entityDetail--${entity}`,
        className
      )}
      data-view-mode={mode}
      data-entity={entity}
      {...props}
    >
      <div
        className={cx(
          "ll3-detailWrap",
          "ll3-entityDetail__wrap",
          widthClass,
          wrapClassName
        )}
      >
        {children}
      </div>
    </Component>
  );
}

export function EntityDetailTop({ className, children, ...props }) {
  return <div className={cx("ll3-entityDetail__top", className)} {...props}>{children}</div>;
}

export function EntityDetailTopRow({ className, children, ...props }) {
  return <div className={cx("ll3-entityDetail__topRow", className)} {...props}>{children}</div>;
}

export function EntityDetailBody({ className, children, ...props }) {
  return <div className={cx("ll3-entityDetail__body", className)} {...props}>{children}</div>;
}

export function EntityDetailMain({ className, children, ...props }) {
  return <div className={cx("ll3-entityDetail__main", className)} {...props}>{children}</div>;
}

export function EntityDetailAside({ className, children, ...props }) {
  return <aside className={cx("ll3-entityDetail__aside", className)} {...props}>{children}</aside>;
}

export function EntityDetailCard({ as: Component = "section", soft = false, hero = false, className, children, ...props }) {
  return (
    <Component
      className={cx("ll3-entityDetailCard", soft && "ll3-entityDetailCard--soft", hero && "ll3-entityDetailCard--hero", className)}
      {...props}
    >
      {children}
    </Component>
  );
}

export function EntityDetailPanel({ as: Component = "section", className, children, ...props }) {
  return <Component className={cx("ll3-entityDetailPanel", className)} {...props}>{children}</Component>;
}
