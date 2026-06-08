// app/components/shared/explorer/ExplorerSidePanel.jsx

export default function ExplorerSidePanel({
    as: As = "aside",
    id,
    title,
    description,
    sectionLabel,
    ariaLabel,
    className = "",
    children,
}) {
    return (
        <As
            id={id}
            className={["ll3-explorerRail", "ll3-sidePanel", className]
                .filter(Boolean)
                .join(" ")}
            aria-label={ariaLabel || title}
        >
            <div className="ll3-sidePanel__inner">
                {(title || description) ? (
                    <div className="ll3-sidePanel__head">
                        {title ? <h2 className="ll3-sidePanel__title">{title}</h2> : null}
                        {description ? (
                            <p className="ll3-sidePanel__description">{description}</p>
                        ) : null}
                    </div>
                ) : null}

                {sectionLabel ? (
                    <div className="ll3-sidePanel__sectionLabel">{sectionLabel}</div>
                ) : null}

                <div className="ll3-sidePanel__body">{children}</div>
            </div>
        </As>
    );
}