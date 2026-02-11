export default function StatsBand({
    billsTotal = "13,185",
    houseD = 215,
    houseR = 220,
    senateD = 45,
    senateR = 53,
}) {
    return (
        <section className="home-stats">
            <div className="container">
                <div className="home-stats__band">
                    {/* Bills */}
                    <div className="home-stats__cell">
                        <div className="home-stats__label">Bills (this Congress)</div>
                        <div className="home-stats__value">{billsTotal}</div>
                    </div>

                    {/* House */}
                    <div className="home-stats__cell">
                        <div className="home-stats__label">House</div>
                        <div className="home-stats__counts">
                            <span className="count count--d">D {houseD}</span>
                            <span className="count__sep">•</span>
                            <span className="count count--r">R {houseR}</span>
                        </div>
                    </div>

                    {/* Senate */}
                    <div className="home-stats__cell">
                        <div className="home-stats__label">Senate</div>
                        <div className="home-stats__counts">
                            <span className="count count--d">D {senateD}</span>
                            <span className="count__sep">•</span>
                            <span className="count count--r">R {senateR}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

