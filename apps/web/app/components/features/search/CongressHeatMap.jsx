// components/CongressHexMapGeo.jsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as d3 from "d3";
import { feature } from "topojson-client";
// If your Next/Webpack complains about the JSON assert, remove the `assert { type: "json" }`.
import statesTopo from "us-atlas/states-10m.json";

const PARTY_COLOR = d3
  .scaleOrdinal()
  .domain(["D", "R", "I", "Other"])
  .range(["#2563eb", "#dc2626", "#475569", "#64748b"]); // crisper on light bg

/** FIPS -> USPS postal abbreviation (includes PR, DC). */
const FIPS_TO_ABBR = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO", "09": "CT", "10": "DE",
  "11": "DC", "12": "FL", "13": "GA", "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ", "35": "NM",
  "36": "NY", "37": "NC", "38": "ND", "39": "OH", "40": "OK", "41": "OR", "42": "PA", "44": "RI",
  "45": "SC", "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY", "72": "PR"
};

// Expand {D:5,R:3} -> ["D","D","D","D","D","R","R","R"]
function expandSeats(counts = {}) {
  const arr = [];
  for (const [k, v] of Object.entries(counts)) {
    for (let i = 0; i < (v || 0); i++) arr.push(k);
  }
  return arr;
}
function majorityParty(counts = {}) {
  const e = Object.entries(counts);
  if (!e.length) return "Other";
  e.sort((a, b) => (b[1] || 0) - (a[1] || 0));
  const k = e[0][0];
  return ["D", "R", "I"].includes(k) ? k : "Other";
}

// Build a screen-space hex lattice (flat-top hexes)
function hexCenters(width, height, r) {
  const w = r * Math.sqrt(3); // hex width
  const h = r * 1.5;          // vertical step
  const centers = [];
  for (let y = r + 8; y < height - r - 8; y += h) {
    const row = Math.round((y - (r + 8)) / h);
    const xOffset = row % 2 ? w / 2 : 0;
    for (let x = r + 8; x < width - r - 8; x += w) {
      centers.push([x + xOffset, y]);
    }
  }
  return centers;
}
function hexPath(cx, cy, r) {
  const pts = d3.range(6).map(i => {
    const a = Math.PI / 6 + (i * Math.PI) / 3; // flat-top
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return d3.line()(pts) + "Z";
}

export default function CongressHeatMap({
  data,
  width = 950,
  height = 540,
  hexRadius = 8,
  strokeStates = "#CBD5E1",      // ⟵ light slate-300
  fillBackground = "#F8FAFC",    // ⟵ off-white
  showSenateGlyph = true,
  labelFill = "#0F172A",     // NEW
  labelHalo = "#FFFFFF"       // NEW
}) {

  const svgRef = useRef(null);
  const [loading, setLoading] = useState(true); // ⟵ NEW

  const statesGeo = useMemo(() => {
    const fc = feature(statesTopo, statesTopo.objects.states);
    fc.features.forEach(f => {
      const fips = String(f.id).padStart(2, "0");
      f.properties = f.properties || {};
      f.properties.abbr = FIPS_TO_ABBR[fips] || f.properties.name;
    });
    return fc;
  }, []);

  useEffect(() => {
    setLoading(true);
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // inside CongressHeatMap useEffect, before drawing hexes
    const stateSummary = d3.rollups(
      data.filter(d => d.chamber === "House"),
      v => {
        const dCount = v.filter(x => x.party === "D").length;
        const rCount = v.filter(x => x.party === "R").length;
        return dCount > rCount ? "D" : rCount > dCount ? "R" : "I";
      },
      d => d.state
    );

    // map of state -> majority party
    const stateMajority = new Map(stateSummary);

    svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "auto");

    // Background
    svg.append("rect")
      .attr("x", 0).attr("y", 0).attr("width", width).attr("height", height)
      .attr("fill", fillBackground).attr("rx", 12);

    svg.insert("rect", ":first-child")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width)
      .attr("height", height)
      .attr("fill", fillBackground)
      .lower(); // ensures it's truly behind everything

    const g = svg.append("g");

    const projection = d3.geoAlbersUsa().fitExtent([[10, 10], [width - 10, height - 10]], statesGeo);
    const geoPath = d3.geoPath(projection);

    // State outlines
    g.append("g")
      .selectAll("path.us-state-outline")
      .data(statesGeo.features)
      .enter().append("path")
      .attr("class", "us-state-outline")
      .attr("d", geoPath)
      .attr("fill", "none")
      .attr("stroke", strokeStates)
      .attr("stroke-width", 1);
    // then draw a single large hex (or polygon) per state fill
    g.append("g")
      .selectAll("path.state-fill")
      .data(statesGeo.features)
      .enter()
      .append("path")
      .attr("d", geoPath)
      .attr("fill", d => PARTY_COLOR(stateMajority.get(d.properties.abbr) || "I"))
      .attr("stroke", strokeStates)
      .attr("stroke-width", 1);
      g.append("g")
  .selectAll("circle.senate-dot")
  .data(data.filter(d => d.chamber === "Senate"))
  .enter()
  .append("circle")
  .attr("cx", d => projection([d.lon, d.lat])[0])
  .attr("cy", d => projection([d.lon, d.lat])[1])
  .attr("r", 3)
  .attr("fill", d => PARTY_COLOR(d.party))
  .attr("stroke", "#fff")
  .attr("stroke-width", 1);
    // Precompute hex lattice & state cell buckets
    const centers = hexCenters(width, height, hexRadius);
    const stateHexes = new Map(); // abbr -> [{x,y,dist}]
    const centroids = new Map();  // abbr -> [x,y]

    statesGeo.features.forEach(f => {
      const abbr = f.properties.abbr;
      if (!abbr) return;
      const c = geoPath.centroid(f);
      centroids.set(abbr, c);
      const cells = [];
      for (const [x, y] of centers) {
        const lonlat = projection.invert([x, y]);
        if (!lonlat) continue;
        if (d3.geoContains(f, lonlat)) {
          const dx = x - c[0], dy = y - c[1];
          cells.push({ x, y, dist: Math.hypot(dx, dy) });
        }
      }
      cells.sort((a, b) => a.dist - b.dist);
      stateHexes.set(abbr, cells);
    });

    // Data by state (postal)
    const byState = new Map((data || []).map(d => [d.state, d]));

    // Build seat hex positions per state
    const seatNodes = [];
    for (const f of statesGeo.features) {
      const abbr = f.properties.abbr;
      if (!abbr) continue;

      const rec = byState.get(abbr) || { house_counts: {}, senate_counts: {} };
      const seats = expandSeats(rec.house_counts);
      if (!seats.length) continue;

      const available = stateHexes.get(abbr) || [];
      const use = available.slice(0, seats.length); // one cell per seat

      use.forEach((cell, i) => {
        seatNodes.push({
          state: abbr,
          x: cell.x,
          y: cell.y,
          party: seats[i]
        });
      });

      // Senate glyph near centroid
      if (showSenateGlyph) {
        const c = centroids.get(abbr);
        if (c) {
          const total = Math.min(
            Object.values(rec.senate_counts || {}).reduce((a, b) => a + (b || 0), 0),
            2
          );
          const mParty = majorityParty(rec.senate_counts);
          const color = PARTY_COLOR(mParty);
          const r = 3.2, gx = c[0] + 12, gy = c[1] - 12;
          const sg = g.append("g")
            .attr("class", "senate")
            .attr("transform", `translate(${gx},${gy})`);
          sg.append("circle")
            .attr("cx", -r - 1).attr("cy", 0).attr("r", r)
            .attr("fill", total >= 1 ? color : "#333")
            .attr("stroke", "#111").attr("stroke-width", 0.6);
          sg.append("circle")
            .attr("cx", r + 1).attr("cy", 0).attr("r", r)
            .attr("fill", total >= 2 ? color : "#333")
            .attr("stroke", "#111").attr("stroke-width", 0.6);
        }
      }
    }

    // Render House seat hexes (lighter strokes on light bg)
    g.append("g")
      .selectAll("path.seat-hex")
      .data(seatNodes)
      .enter().append("path")
      .attr("class", "hex seat-hex")
      .attr("d", d => hexPath(d.x, d.y, hexRadius))
      .attr("fill", d => PARTY_COLOR(d.party))
      .attr("stroke", "#94A3B8") // slate-400
      .attr("stroke-width", 0.7);

    // Postal labels (dark)
    g.append("g")
      .selectAll("text.abbr")
      .data(statesGeo.features)
      .enter().append("text")
      .attr("class", "abbr")
      .attr("x", d => geoPath.centroid(d)[0])
      .attr("y", d => geoPath.centroid(d)[1] + 4)
      .attr("text-anchor", "middle")
      .text(d => d.properties.abbr || "")
      .attr("fill", labelFill)
      .attr("font-size", 10)
      .attr("font-weight", 800)
      .attr("stroke", labelHalo)       // halo
      .attr("stroke-width", 2)
      .attr("paint-order", "stroke fill")
      .attr("pointer-events", "none");

    setLoading(false);
  }, [data, width, height, hexRadius, fillBackground, strokeStates, showSenateGlyph, labelFill, labelHalo, statesGeo]);

  return (
    <div className="map-wrap">
      {loading && <div className="map-loading">Loading map…</div>}
      <svg ref={svgRef} className="congress-geo-hexmap" role="img" aria-label="US Congress by state with hexbins" aria-busy={loading} />
    </div>
  );
}
