"use client";
import React, { useEffect, useRef } from "react";
import * as d3 from "d3";


export default function BillActivityMini({ data = [] }) {
    const ref = useRef(null);


    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.innerHTML = '';


        const w = el.clientWidth || 800;
        const h = 180;
        const m = { top: 16, right: 16, bottom: 24, left: 32 };


        const svg = d3.select(el).append('svg').attr('width', w).attr('height', h);
        const g = svg.append('g').attr('transform', `translate(${m.left},${m.top})`);


        const innerW = w - m.left - m.right;
        const innerH = h - m.top - m.bottom;


        const parse = (d) => ({
            week: new Date(d.week),
            introduced: +d.introduced || 0,
            actions: +d.actions || 0,
        });
        const ds = data.map(parse);


        const x = d3.scaleTime()
            .domain(d3.extent(ds, d => d.week))
            .range([0, innerW]);


        const y = d3.scaleLinear()
            .domain([0, d3.max(ds, d => Math.max(d.introduced, d.actions)) || 1])
            .nice()
            .range([innerH, 0]);


        const lineIntro = d3.line().x(d => x(d.week)).y(d => y(d.introduced));
        const lineActs = d3.line().x(d => x(d.week)).y(d => y(d.actions));


        g.append('path').datum(ds).attr('class', 'chart__line').attr('d', lineIntro);
        g.append('path').datum(ds).attr('class', 'chart__line chart__line--secondary').attr('d', lineActs);


        const ax = d3.axisBottom(x).ticks(6).tickFormat(d3.timeFormat('%b %d'));
        const ay = d3.axisLeft(y).ticks(4);


        g.append('g').attr('transform', `translate(0,${innerH})`).attr('class', 'axis').call(ax);
        g.append('g').attr('class', 'axis').call(ay);


        const legend = svg.append('g').attr('transform', `translate(${m.left},8)`);
        legend.append('circle').attr('r', 4).attr('class', 'legend-dot');
        legend.append('text').attr('x', 10).attr('y', 4).attr('class', 'legend-text').text('Introduced');
        legend.append('circle').attr('cx', 120).attr('r', 4).attr('class', 'legend-dot legend-dot--secondary');
        legend.append('text').attr('x', 130).attr('y', 4).attr('class', 'legend-text').text('Latest actions');
    }, [data]);


    return <div ref={ref} className="chart chart--mini" />;
}