import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { weeklyPatterns, dishMap } from '../../../data/searchingForFood';

interface RadialWeekChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dish: string;
  color: string;
  day: string;
  value: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function RadialWeekChart({ activeStep }: RadialWeekChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, dish: '', color: '', day: '', value: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(width, height) * 0.42;
    const innerRadius = maxRadius * 0.2;

    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Angle scale (7 days + close the loop)
    const angleScale = d3.scaleLinear()
      .domain([0, 7])
      .range([0, Math.PI * 2]);

    // Radius scale
    const radiusScale = d3.scaleLinear()
      .domain([0, 100])
      .range([innerRadius, maxRadius]);

    // Draw day labels
    DAYS.forEach((day, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      const r = maxRadius + 18;
      g.append('text')
        .attr('x', r * Math.cos(angle))
        .attr('y', r * Math.sin(angle))
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('class', 'viz-label')
        .style('font-size', '11px')
        .text(day);
    });

    // Draw radial grid
    [25, 50, 75, 100].forEach(v => {
      const r = radiusScale(v);
      g.append('circle')
        .attr('r', r)
        .attr('fill', 'none')
        .attr('stroke', '#e7decd')
        .attr('stroke-width', 1);
    });

    // Draw spokes
    DAYS.forEach((_, i) => {
      const angle = angleScale(i) - Math.PI / 2;
      g.append('line')
        .attr('x1', innerRadius * Math.cos(angle))
        .attr('y1', innerRadius * Math.sin(angle))
        .attr('x2', maxRadius * Math.cos(angle))
        .attr('y2', maxRadius * Math.sin(angle))
        .attr('stroke', '#e7decd')
        .attr('stroke-width', 0.5);
    });

    // Line generator
    const lineGen = d3.lineRadial<number>()
      .angle((_, i) => angleScale(i))
      .radius(d => radiusScale(d))
      .curve(d3.curveCardinalClosed.tension(0.4));

    // Store dish groups for hover interactions
    const dishGroups: { dishId: string; area: d3.Selection<SVGPathElement, number[], null, undefined>; line: d3.Selection<SVGPathElement, number[], null, undefined>; color: string; name: string }[] = [];

    // Draw each dish's radial line
    weeklyPatterns.forEach((wp, idx) => {
      const dish = dishMap.get(wp.dishId);
      const color = dish?.color || '#ccc';

      const isHighlighted =
        (activeStep === 1 && wp.dishId === 'biryani') ||
        (activeStep === 2 && wp.dishId === 'dal-rice') ||
        activeStep === 0;

      const opacity = isHighlighted ? 0.85 : 0.12;
      const strokeWidth = isHighlighted ? 2.5 : 1.5;

      // Area fill
      const areaGen = d3.areaRadial<number>()
        .angle((_, i) => angleScale(i))
        .innerRadius(innerRadius)
        .outerRadius(d => radiusScale(d))
        .curve(d3.curveCardinalClosed.tension(0.4));

      const area = g.append('path')
        .datum(wp.pattern as number[])
        .attr('d', areaGen as any)
        .attr('fill', color)
        .attr('opacity', opacity * 0.2)
        .attr('data-dish', wp.dishId)
        .transition().duration(600)
        .attr('opacity', opacity * 0.2);

      // Outline
      const line = g.append('path')
        .datum(wp.pattern as number[])
        .attr('d', lineGen as any)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('data-dish', wp.dishId)
        .attr('opacity', 0)
        .transition().duration(600).delay(idx * 80)
        .attr('opacity', opacity);

      dishGroups.push({
        dishId: wp.dishId,
        area: g.select(`path[data-dish="${wp.dishId}"][fill="${color}"]`) as any,
        line: g.select(`path[data-dish="${wp.dishId}"][stroke="${color}"]`) as any,
        color,
        name: dish?.name || wp.dishId,
      });

      // Label
      if (isHighlighted && dish) {
        const maxVal = Math.max(...wp.pattern);
        const maxIdx = wp.pattern.indexOf(maxVal);
        const angle = angleScale(maxIdx) - Math.PI / 2;
        const r = radiusScale(maxVal) + 14;

        g.append('text')
          .attr('x', r * Math.cos(angle))
          .attr('y', r * Math.sin(angle))
          .attr('text-anchor', 'middle')
          .style('font-family', '"Jost", sans-serif')
          .style('font-size', '11px')
          .style('font-weight', '600')
          .attr('fill', color)
          .attr('opacity', 0)
          .text(dish.name)
          .transition().duration(600).delay(400)
          .attr('opacity', 1);
      }
    });

    // Invisible overlay circles at each data point for hover
    weeklyPatterns.forEach(wp => {
      const dish = dishMap.get(wp.dishId);
      const color = dish?.color || '#ccc';

      const isHighlighted =
        (activeStep === 1 && wp.dishId === 'biryani') ||
        (activeStep === 2 && wp.dishId === 'dal-rice') ||
        activeStep === 0;

      if (!isHighlighted) return;

      wp.pattern.forEach((val, dayIdx) => {
        const angle = angleScale(dayIdx) - Math.PI / 2;
        const r = radiusScale(val);

        g.append('circle')
          .attr('cx', r * Math.cos(angle))
          .attr('cy', r * Math.sin(angle))
          .attr('r', 8)
          .attr('fill', 'transparent')
          .attr('cursor', 'pointer')
          .on('mouseenter', (event) => {
            // Highlight this dish, dim others
            g.selectAll('path').attr('opacity', function () {
              const el = d3.select(this);
              return el.attr('data-dish') === wp.dishId ? 0.9 : 0.05;
            });

            const [mx, my] = d3.pointer(event, containerRef.current);
            setTooltip({
              visible: true,
              x: mx,
              y: my - 10,
              dish: dish?.name || wp.dishId,
              color,
              day: DAYS[dayIdx],
              value: val,
            });
          })
          .on('mouseleave', () => {
            // Restore opacities
            g.selectAll('path').each(function () {
              const el = d3.select(this);
              const elDish = el.attr('data-dish');
              if (!elDish) return;
              const wp2 = weeklyPatterns.find(w => w.dishId === elDish);
              if (!wp2) return;
              const isH =
                (activeStep === 1 && elDish === 'biryani') ||
                (activeStep === 2 && elDish === 'dal-rice') ||
                activeStep === 0;
              const fill = el.attr('fill');
              const baseOpacity = fill !== 'none'
                ? (isH ? 0.85 : 0.12) * 0.2
                : (isH ? 0.85 : 0.12);
              el.transition().duration(200).attr('opacity', baseOpacity);
            });
            setTooltip(prev => ({ ...prev, visible: false }));
          });
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
          }}
        >
          <div className="viz-tooltip-title" style={{ color: tooltip.color }}>{tooltip.dish}</div>
          <div style={{ color: '#68594f', fontSize: '0.8rem' }}>
            {tooltip.day}: <strong>{tooltip.value}</strong>
          </div>
        </div>
      )}
    </div>
  );
}
