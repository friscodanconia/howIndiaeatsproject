import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { consumptionGap, dishMap } from '../../../data/searchingForFood';
import { RichTooltip } from '../RichTooltip';

interface DivergingBarChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dishId: string;
  searchRank: number;
  consumptionRank: number;
  gap: number;
  note: string;
}

export function DivergingBarChart({ activeStep }: DivergingBarChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, dishId: '', searchRank: 0, consumptionRank: 0, gap: 0, note: '' });

  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const isMobile = width < 500;
    const margin = { top: isMobile ? 25 : 40, right: isMobile ? 5 : 30, bottom: 20, left: isMobile ? 5 : 30 };
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

    // Bar length = intensity (rank #1 = longest bar, higher rank = shorter bar)
    // barWidth maps a rank to its pixel width (inverted: lower rank number = wider)
    const halfWidth = midX - 20;
    const barWidth = (rank: number) => halfWidth * (maxRank + 1 - rank) / maxRank;

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

      // Search bar (left) — grows leftward from center
      if (showSearch) {
        const sw = barWidth(item.searchRank);
        rowGroup.append('rect')
          .attr('x', midX - 20 - sw)
          .attr('y', yPos + 2)
          .attr('width', 0)
          .attr('height', barHeight - 4)
          .attr('fill', color)
          .attr('opacity', 0.7)
          .attr('rx', 2)
          .attr('class', 'search-bar')
          .transition().duration(600).delay(i * 30).ease(d3.easeBackOut.overshoot(1.3))
          .attr('width', sw);

        // Rank number
        rowGroup.append('text')
          .attr('x', midX - 20 - sw - 5)
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

      // Consumption bar (right) — grows rightward from center
      if (showConsumption) {
        const cw = barWidth(item.consumptionRank);
        rowGroup.append('rect')
          .attr('x', midX + 20)
          .attr('y', yPos + 2)
          .attr('width', 0)
          .attr('height', barHeight - 4)
          .attr('fill', color)
          .attr('opacity', 0.5)
          .attr('rx', 2)
          .attr('class', 'consumption-bar')
          .transition().duration(600).delay(i * 30 + 200).ease(d3.easeBackOut.overshoot(1.3))
          .attr('width', cw);

        rowGroup.append('text')
          .attr('x', midX + 20 + cw + 5)
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

          setTooltip({
            visible: true,
            x: event.clientX,
            y: event.clientY - 10,
            dishId: item.dishId,
            searchRank: item.searchRank,
            consumptionRank: item.consumptionRank,
            gap: item.consumptionRank - item.searchRank,
            note: item.note,
          });
        })
        .on('mousemove', (event) => {
          setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY - 10 }));
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
      <RichTooltip
        dishId={tooltip.dishId}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
        extraLabel={tooltip.visible ? `Search #${tooltip.searchRank} · Eaten #${tooltip.consumptionRank}${tooltip.gap !== 0 ? ` (${tooltip.gap > 0 ? '↓' : '↑'}${Math.abs(tooltip.gap)})` : ''}` : undefined}
      />
    </div>
  );
}
