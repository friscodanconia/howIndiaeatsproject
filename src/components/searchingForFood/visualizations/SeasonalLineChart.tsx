import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { seasonalTrends, dishMap } from '../../../data/searchingForFood';

interface SeasonalLineChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  month: string;
  items: { name: string; color: string; value: number }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SeasonalLineChart({ activeStep }: SeasonalLineChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, month: '', items: [] });

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 30, right: 20, bottom: 40, left: 40 };
    const w = width - margin.left - margin.right;
    const h = height - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 11]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .attr('class', 'viz-axis')
      .call(d3.axisBottom(x)
        .ticks(12)
        .tickFormat((_, i) => MONTHS[i] || '')
      )
      .call(g => g.select('.domain').remove());

    // Y axis
    g.append('g')
      .attr('class', 'viz-axis')
      .call(d3.axisLeft(y).ticks(5).tickSize(-w))
      .call(g => g.select('.domain').remove())
      .call(g => g.selectAll('.tick line').attr('stroke', '#e7decd'));

    // Highlighted dishes per step
    const highlightMap: Record<number, string[]> = {
      0: [],
      1: ['modak'],
      2: ['ladoo', 'gulab-jamun'],
      3: ['haleem', 'biryani'],
    };
    const highlighted = highlightMap[activeStep] || [];

    // Line generator
    const lineGen = d3.line<number>()
      .x((_, i) => x(i))
      .y(d => y(d))
      .curve(d3.curveMonotoneX);

    // Draw lines
    seasonalTrends.forEach((st, idx) => {
      const dish = dishMap.get(st.dishId);
      const color = dish?.color || '#ccc';
      const isHighlighted = highlighted.length === 0 || highlighted.includes(st.dishId);
      const opacity = isHighlighted ? 0.9 : 0.1;
      const strokeWidth = isHighlighted && highlighted.length > 0 ? 3 : 1.5;

      // Area
      const areaGen = d3.area<number>()
        .x((_, i) => x(i))
        .y0(h)
        .y1(d => y(d))
        .curve(d3.curveMonotoneX);

      if (isHighlighted && highlighted.length > 0) {
        g.append('path')
          .datum(st.monthly)
          .attr('d', areaGen)
          .attr('fill', color)
          .attr('opacity', 0)
          .transition().duration(600).delay(idx * 60)
          .attr('opacity', 0.08);
      }

      // Line
      g.append('path')
        .datum(st.monthly)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('class', 'seasonal-line')
        .attr('data-dish', st.dishId)
        .attr('opacity', 0)
        .transition().duration(600).delay(idx * 60)
        .attr('opacity', opacity);

      // Label on highlighted lines
      if (isHighlighted && highlighted.length > 0 && dish) {
        const maxVal = Math.max(...st.monthly);
        const maxIdx = st.monthly.indexOf(maxVal);

        g.append('text')
          .attr('x', x(maxIdx))
          .attr('y', y(maxVal) - 10)
          .attr('text-anchor', 'middle')
          .style('font-family', '"Jost", sans-serif')
          .style('font-size', '11px')
          .style('font-weight', '600')
          .attr('fill', color)
          .attr('opacity', 0)
          .text(dish.name)
          .transition().duration(600).delay(400)
          .attr('opacity', 1);

        // Festival markers
        st.festivals?.forEach(f => {
          g.append('line')
            .attr('x1', x(f.month))
            .attr('x2', x(f.month))
            .attr('y1', 0)
            .attr('y2', h)
            .attr('stroke', color)
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '4,4')
            .attr('opacity', 0)
            .transition().duration(600).delay(600)
            .attr('opacity', 0.5);

          g.append('text')
            .attr('x', x(f.month))
            .attr('y', -5)
            .attr('text-anchor', 'middle')
            .attr('class', 'viz-annotation')
            .style('font-size', '10px')
            .attr('opacity', 0)
            .text(f.name)
            .transition().duration(600).delay(700)
            .attr('opacity', 1);
        });
      }
    });

    // Crosshair line (hidden initially)
    const crosshair = g.append('line')
      .attr('class', 'crosshair')
      .attr('y1', 0)
      .attr('y2', h)
      .attr('stroke', '#afa39c')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3,3')
      .attr('opacity', 0);

    // Hover dots
    const hoverDots = g.append('g').attr('class', 'hover-dots');

    // Invisible overlay for mouse tracking
    g.append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair')
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        const monthIdx = Math.round(x.invert(mx));
        const clampedIdx = Math.max(0, Math.min(11, monthIdx));
        const xPos = x(clampedIdx);

        // Show crosshair
        crosshair.attr('x1', xPos).attr('x2', xPos).attr('opacity', 0.6);

        // Get values for visible dishes at this month
        const items: { name: string; color: string; value: number }[] = [];
        hoverDots.selectAll('*').remove();

        seasonalTrends.forEach(st => {
          const dish = dishMap.get(st.dishId);
          const isHighlighted = highlighted.length === 0 || highlighted.includes(st.dishId);
          if (!isHighlighted || !dish) return;

          const val = st.monthly[clampedIdx];
          items.push({ name: dish.name, color: dish.color, value: val });

          hoverDots.append('circle')
            .attr('cx', xPos)
            .attr('cy', y(val))
            .attr('r', 4)
            .attr('fill', dish.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 1.5);
        });

        const [containerX, containerY] = d3.pointer(event, containerRef.current);
        setTooltip({
          visible: true,
          x: containerX,
          y: containerY - 10,
          month: MONTHS[clampedIdx],
          items: items.sort((a, b) => b.value - a.value),
        });
      })
      .on('mouseleave', () => {
        crosshair.attr('opacity', 0);
        hoverDots.selectAll('*').remove();
        setTooltip(prev => ({ ...prev, visible: false }));
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
            minWidth: 120,
          }}
        >
          <div className="viz-tooltip-title">{tooltip.month}</div>
          {tooltip.items.map(item => (
            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
              <span style={{ color: '#68594f' }}>{item.name}</span>
              <span style={{ marginLeft: 'auto', fontWeight: 600, color: '#28211e' }}>{item.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
