"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import StateCompositionModal from "./StateCompositionModal";

const DEBUG_MAP = true;

const PARTY_CLASS = {
    D: "ll3-mapState--dem",
    R: "ll3-mapState--rep",
    I: "ll3-mapState--ind",
    split: "ll3-mapState--split",
    unknown: "ll3-mapState--unknown",
};

const STATE_NAME_TO_CODE = {
    Alabama: "AL",
    Alaska: "AK",
    Arizona: "AZ",
    Arkansas: "AR",
    California: "CA",
    Colorado: "CO",
    Connecticut: "CT",
    Delaware: "DE",
    Florida: "FL",
    Georgia: "GA",
    Hawaii: "HI",
    Idaho: "ID",
    Illinois: "IL",
    Indiana: "IN",
    Iowa: "IA",
    Kansas: "KS",
    Kentucky: "KY",
    Louisiana: "LA",
    Maine: "ME",
    Maryland: "MD",
    Massachusetts: "MA",
    Michigan: "MI",
    Minnesota: "MN",
    Mississippi: "MS",
    Missouri: "MO",
    Montana: "MT",
    Nebraska: "NE",
    Nevada: "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    Ohio: "OH",
    Oklahoma: "OK",
    Oregon: "OR",
    Pennsylvania: "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    Tennessee: "TN",
    Texas: "TX",
    Utah: "UT",
    Vermont: "VT",
    Virginia: "VA",
    Washington: "WA",
    "West Virginia": "WV",
    Wisconsin: "WI",
    Wyoming: "WY",
};

function normalizeStateCode(value) {
    return String(value || "").trim().toUpperCase();
}

function getFeatureStateCode(feature) {
    const props = feature?.properties || {};

    return normalizeStateCode(
        props.postal ||
        props.STUSPS ||
        props.state_code ||
        props.abbr ||
        props.STATE_ABBR ||
        STATE_NAME_TO_CODE[props.name] ||
        STATE_NAME_TO_CODE[props.NAME]
    );
}

function dominantParty(row) {
    const counts = row?.combined_counts || row?.combinedCounts || {};

    const d = Number(
        counts.D ?? Number(row?.house_d || 0) + Number(row?.senate_d || 0)
    );
    const r = Number(
        counts.R ?? Number(row?.house_r || 0) + Number(row?.senate_r || 0)
    );
    const i = Number(
        counts.I ?? Number(row?.house_i || 0) + Number(row?.senate_i || 0)
    );

    const max = Math.max(d, r, i);
    if (!max) return "unknown";

    const winners = [
        d === max ? "D" : null,
        r === max ? "R" : null,
        i === max ? "I" : null,
    ].filter(Boolean);

    return winners.length === 1 ? winners[0] : "split";
}

export default function CongressCompositionMap({ states = [] }) {
    const svgRef = useRef(null);
    const wrapRef = useRef(null);
    const [geo, setGeo] = useState(null);
    const [selectedState, setSelectedState] = useState(null);

    const stateMap = useMemo(() => {
        const map = new Map();

        states.forEach((row) => {
            map.set(normalizeStateCode(row.state_code || row.state), row);
        });

        return map;
    }, [states]);

    useEffect(() => {
        let alive = true;

        fetch("/maps/us-states.geojson")
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to load map: ${res.status}`);
                return res.json();
            })
            .then((json) => {
                if (DEBUG_MAP) {
                    console.log("[CongressCompositionMap] GeoJSON loaded", {
                        type: json?.type,
                        featureCount: json?.features?.length,
                        firstFeatureProps: json?.features?.[0]?.properties,
                    });
                }

                if (alive) setGeo(json);
            })
            .catch((error) => {
                console.error("[CongressCompositionMap] Failed to load GeoJSON", error);
                if (alive) setGeo(null);
            });

        return () => {
            alive = false;
        };
    }, []);

    useEffect(() => {
        if (!geo || !svgRef.current || !wrapRef.current) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll("*").remove();

        const width = wrapRef.current.clientWidth || 900;
        const height = Math.max(320, Math.round(width * 0.58));

        svg.attr("viewBox", `0 0 ${width} ${height}`);
        svg.attr("preserveAspectRatio", "xMidYMid meet");

        const featureDiagnostics = (geo.features || []).map((feature) => {
            const code = getFeatureStateCode(feature);

            return {
                code,
                included: Boolean(code && stateMap.has(code)),
                properties: feature.properties,
            };
        });

        const stateFeatures = (geo.features || []).filter((feature) => {
            const code = getFeatureStateCode(feature);
            return code && stateMap.has(code);
        });

        if (DEBUG_MAP) {
            console.groupCollapsed("[CongressCompositionMap] Feature diagnostics");
            console.log("stateMap keys", Array.from(stateMap.keys()));
            console.log("all features", featureDiagnostics);
            console.log(
                "rejected features",
                featureDiagnostics.filter((item) => !item.included)
            );
            console.log(
                "accepted features",
                featureDiagnostics.filter((item) => item.included)
            );
            console.groupEnd();
        }

        const featureCollection = {
            type: "FeatureCollection",
            features: stateFeatures,
        };

        const projection = d3.geoAlbersUsa().fitSize([width, height], featureCollection);
        const path = d3.geoPath(projection);

        svg.append("g")
            .attr("class", "ll3-mapStates")
            .selectAll("path")
            .data(stateFeatures)
            .join("path")
            .attr("d", path)
            .attr("class", (feature) => {
                const code = getFeatureStateCode(feature);
                const row = stateMap.get(code);
                const party = dominantParty(row);

                return `ll3-mapState ${PARTY_CLASS[party] || PARTY_CLASS.unknown}`;
            })
            .attr("tabindex", 0)
            .attr("role", "button")
            .attr("aria-label", (feature) => {
                const code = getFeatureStateCode(feature);
                return code
                    ? `View ${code} congressional composition`
                    : "View congressional composition";
            })
            .on("click", (_, feature) => {
                const code = getFeatureStateCode(feature);
                const row = stateMap.get(code);

                if (DEBUG_MAP) {
                    console.log("[CongressCompositionMap] clicked state", {
                        code,
                        row,
                        properties: feature.properties,
                    });
                }

                if (row) setSelectedState(row);
            })
            .on("keydown", (event, feature) => {
                if (event.key !== "Enter" && event.key !== " ") return;
                event.preventDefault();

                const code = getFeatureStateCode(feature);
                const row = stateMap.get(code);

                if (row) setSelectedState(row);
            });
    }, [geo, stateMap]);

    return (
        <div className="ll3-compositionPanel">
            <div className="ll3-compositionPanel__meta">
                <div>
                    <h3>State delegation map</h3>
                    <p>Click a state to view House and Senate delegation details.</p>
                </div>

                <div className="ll3-compositionLegend" aria-label="Map legend">
                    <span className="is-dem">Democratic</span>
                    <span className="is-rep">Republican</span>
                    <span className="is-ind">Independent</span>
                    <span className="is-split">Split</span>
                </div>
            </div>

            <div ref={wrapRef} className="ll3-mapShell">
                {geo ? (
                    <svg
                        ref={svgRef}
                        className="ll3-compositionMap"
                        fill="none"
                        aria-label="State delegation composition map"
                    />
                ) : (
                    <div className="ll3-mapFallback">Map data unavailable.</div>
                )}
            </div>

            <StateCompositionModal
                state={selectedState}
                onClose={() => setSelectedState(null)}
            />
        </div>
    );
}