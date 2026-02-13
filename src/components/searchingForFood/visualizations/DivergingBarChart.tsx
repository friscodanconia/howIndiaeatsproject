import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { consumptionGap, dishMap } from '../../../data/searchingForFood';

interface DivergingBarChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dish: string;
  searchRank: number;
  consumptionRank: number;
  gap: number;
  note: string;
}

export function DivergingBarChart({ activeStep }: DivergingBarChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, dish: '', searchRank: 0, consumptionRank: 0, gap: 0, note: '' });

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 20, left: 30 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;
    const midX = w / 2;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const sorted = [...consumptionGap].sort((a, b) => a.searchRank - b.searchRank);
    const barHeight = Math.min(28, (h - 20) / sorted.length);
    const barGap = 3;

    const maxRank = Math.max(
      ...sorted.map(d => d.searchRank),
      ...sorted.map(d => d.consumptionRank)
    );

    const xLeft = d3.scaleLinear().domain([0, maxRank]).range([midX - 20, 0]);
    const xRight = d3.scaleLinear().domain([0, maxRank]).range([midX + 20, w]);

    // Column headers
    g.append('text')
      .attr('x', midX / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('class', 'viz-label')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .text('Google Search Rank');

    g.append('text')
      .attr('x', midX + (w - midX) / 2)
      .attr('y', -15)
      .attr('text-anchor', 'middle')
      .attr('class', 'viz-label')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .text('Consumption Rank');

    // Center line
    g.append('line')
      .attr('x1', midX)
      .attr('x2', midX)
      .attr('y1', -5)
      .attr('y2', h)
      .attr('stroke', '#e7decd')
      .attr('stroke-width', 1);

    sorted.forEach((item, i) => {
      const dish = dishMap.get(item.dishId);
      const color = dish?.color || '#ccc';
      const yPos = i * (barHeight + barGap);
      const showSearch = activeStep >= 0;
      const showConsumption = activeStep >= 1;
      const showGap = activeStep >= 2;

      // Row group for hover
      const rowGroup = g.append('g')
        .attr('class', 'bar-row')
        .attr('data-idx', i)
        .attr('cursor', 'pointer');

      // Invisible hit area
      rowGroup.append('rect')
        .attr('x', 0)
        .attr('y', yPos - 1)
        .attr('width', w)
        .attr('height', barHeight + 2)
        .attr('fill', 'transparent');

      // Dish name at center
      rowGroup.append('text')
        .attr('x', midX)
        .attr('y', yPos + barHeight / 2)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .style('font-family', '"Jost", sans-serif')
        .style('font-size', `${Math.max(8, barHeight * 0.4)}px`)
        .style('font-weight', '500')
        .attr('fill', '#28211e')
        .text(dish?.name || item.dishId);

      // Search bar (left)
      if (showSearch) {
        rowGroup.append('rect')
          .attr('x', xLeft(item.searchRank))
          .attr('y', yPos + 2)
          .attr('width', 0)
          .attr('height', barHeight - 4)
          .attr('fill', color)
          .attr('opacity', 0.7)
          .attr('rx', 2)
          .attr('class', 'search-bar')
          .transition().duration(600).delay(i * 30)
          .attr('width', midX - 20 - xLeft(item.searchRank));

        // Rank number
        rowGroup.append('text')
          .attr('x', xLeft(item.searchRank) - 5)
          .attr('y', yPos + barHeight / 2)
          .attr('text-anchor', 'end')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '9px')
          .attr('class', 'viz-label')
          .attr('opacity', 0)
          .text(`#${item.searchRank}`)
          .transition().duration(400).delay(i * 30 + 300)
          .attr('opacity', 1);
      }

      // Consumption bar (right)
      if (showConsumption) {
        rowGroup.append('rect')
          .attr('x', midX + 20)
          .attr('y', yPos + 2)
          .attr('width', 0)
          .attr('height', barHeight - 4)
          .attr('fill', color)
          .attr('opacity', 0.5)
          .attr('rx', 2)
          .attr('class', 'consumption-bar')
          .transition().duration(600).delay(i * 30 + 200)
          .attr('width', xRight(item.consumptionRank) - (midX + 20));

        rowGroup.append('text')
          .attr('x', xRight(item.consumptionRank) + 5)
          .attr('y', yPos + barHeight / 2)
          .attr('text-anchor', 'start')
          .attr('dominant-baseline', 'middle')
          .style('font-size', '9px')
          .attr('class', 'viz-label')
          .attr('opacity', 0)
          .text(`#${item.consumptionRank}`)
          .transition().duration(400).delay(i * 30 + 500)
          .attr('opacity', 1);
      }

      // Gap highlight
      if (showGap && Math.abs(item.searchRank - item.consumptionRank) > 8) {
        rowGroup.append('rect')
          .attr('x', 0)
          .attr('y', yPos - 1)
          .attr('width', w)
          .attr('height', barHeight + 2)
          .attr('fill', '#f9564e')
          .attr('opacity', 0)
          .attr('rx', 3)
          .attr('class', 'gap-highlight')
          .transition().duration(400).delay(800)
          .attr('opacity', 0.06);
      }

      // Hover interactions
      rowGroup
        .on('mouseenter', (event) => {
          // Dim other rows
          g.selectAll('g.bar-row').each(function () {
            const el = d3.select(this);
            if (el.attr('data-idx') !== String(i)) {
              el.transition().duration(150).attr('opacity', 0.4);
            }
          });

          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mx,
            y: my - 10,
            dish: dish?.name || item.dishId,
            searchRank: item.searchRank,
            consumptionRank: item.consumptionRank,
            gap: item.consumptionRank - item.searchRank,
            note: item.note,
          });
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip(prev => ({ ...prev, x: mx, y: my - 10 }));
        })
        .on('mouseleave', () => {
          g.selectAll('g.bar-row')
            .transition().duration(150)
            .attr('opacity', 1);
          setTooltip(prev => ({ ...prev, visible: false }));
        });
    });

  }, [activeStep, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
      {tooltip.visible && (
        <div
          className="viz-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            opacity: 1,
            maxWidth: 220,
          }}
        >
          <div className="viz-tooltip-title">{tooltip.dish}</div>
          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: '#68594f', marginTop: '0.2rem' }}>
            <span>Search: <strong style={{ color: '#28211e' }}>#{tooltip.searchRank}</strong></span>
            <span>Eaten: <strong style={{ color: '#28211e' }}>#{tooltip.consumptionRank}</strong></span>
          </div>
          {tooltip.gap !== 0 && (
            <div style={{
              fontSize: '0.75rem',
              color: tooltip.gap > 0 ? '#f9564e' : '#23abab',
              marginTop: '0.15rem',
              fontWeight: 500,
            }}>
              {tooltip.gap > 0 ? `Eaten ${tooltip.gap} ranks lower` : `Eaten ${Math.abs(tooltip.gap)} ranks higher`}
            </div>
          )}
          <div style={{ fontSize: '0.75rem', color: '#afa39c', marginTop: '0.25rem', fontStyle: 'italic' }}>
            {tooltip.note}
          </div>
        </div>
      )}
    </div>
  );
}
