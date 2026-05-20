export default function CongressCompositionSkeleton() {
    return (
        <div className="ll3-refComposition ll3-refComposition--loading">
            <div className="ll3-refComposition__head">
                <div>
                    <div className="ll3-skel ll3-skel--eyebrow" />
                    <div className="ll3-skel ll3-skel--title" />
                    <div className="ll3-skel ll3-skel--line" />
                </div>
                <div className="ll3-skel ll3-skel--toggle" />
            </div>

            <div className="ll3-compositionPanel">
                <div className="ll3-compositionPanel__meta">
                    <div>
                        <div className="ll3-skel ll3-skel--smallTitle" />
                        <div className="ll3-skel ll3-skel--lineShort" />
                    </div>
                </div>

                <div className="ll3-compositionLoadingMap">
                    <div className="ll3-skel ll3-skel--map" />
                </div>
            </div>
        </div>
    );
}