"use client";

export default function WipBannerClient({
    title = "New page — work in progress",
    subtitle = "Insights is being built panel-by-panel. Expect changes as we add filters and more breakdowns.",
    tag = "WIP",

    // NEW: image slot (optional)
    imageUrl = 'https://storage.googleapis.com/legislation-lemur-images/lemur-new-feature.png',
    imageAlt = "Work in progress illustration",
    imageHref = null, // optional: make image clickable
}) {
    const Img = imageUrl ? (
        <div className="ll3-wipBanner__media" aria-hidden={imageAlt ? "false" : "true"}>
            {imageHref ? (
                <a className="ll3-wipBanner__mediaLink" href={imageHref} target="_blank" rel="noreferrer">
                    <img className="ll3-wipBanner__img" src={imageUrl} alt={imageAlt} loading="lazy" />
                </a>
            ) : (
                <img className="ll3-wipBanner__img" src={imageUrl} alt={imageAlt} loading="lazy" />
            )}
        </div>
    ) : (
        <div className="ll3-wipBanner__media ll3-wipBanner__media--placeholder" aria-hidden="true">
            <div className="ll3-wipBanner__phIcon" />
            <div className="ll3-wipBanner__phText">Image slot</div>
        </div>
    );

    return (
        <aside className="ll3-wipBanner" role="status" aria-live="polite">
            <div className="ll3-wipBanner__left">
                <div className="ll3-wipBanner__top">
                    <span className="ll3-wipBanner__pill">{tag}</span>
                </div>

                <p className="ll3-wipBanner__title">{title}</p>
                <p className="ll3-wipBanner__sub">{subtitle}</p>
            </div>

            {Img}
        </aside>
    );
}
