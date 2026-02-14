import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { weeklyPatterns, dishMap } from '../../../data/searchingForFood';
import { RichTooltip } from '../RichTooltip';

interface RadialWeekChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dishId: string;
  day: string;
  value: number;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function RadialWeekChart({ activeStep }: RadialWeekChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, dishId: '', day: '', value: 0 });

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

      g.append('path')
        .datum(wp.pattern as number[])
        .attr('d', areaGen as any)
        .attr('fill', color)
        .attr('opacity', opacity * 0.2)
        .attr('data-dish', wp.dishId)
        .transition().duration(600).ease(d3.easeBackOut.overshoot(1.3))
        .attr('opacity', opacity * 0.2);

      // Outline
      g.append('path')
        .datum(wp.pattern as number[])
        .attr('d', lineGen as any)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', strokeWidth)
        .attr('data-dish', wp.dishId)
        .attr('opacity', 0)
        .transition().duration(600).delay(idx * 80).ease(d3.easeBackOut.overshoot(1.3))
        .attr('opacity', opacity);

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

            const rect = containerRef.current?.getBoundingClientRect();
            if (!rect) return;
            setTooltip({
              visible: true,
              x: event.clientX,
              y: event.clientY - 10,
              dishId: wp.dishId,
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

  const legendDishes = useMemo(() => {
    return weeklyPatterns.map(wp => {
      const dish = dishMap.get(wp.dishId);
      return dish ? { id: wp.dishId, name: dish.name, color: dish.color } : null;
    }).filter(Boolean) as { id: string; name: string; color: string }[];
  }, []);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />

      {/* Color legend */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: '0.5rem 1rem',
        padding: '0.5rem 0',
        fontFamily: '"Jost", sans-serif',
        fontSize: '0.75rem',
      }}>
        {legendDishes.map(d => (
          <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <span style={{
              width: 10,
              height: 10,
              borderRadius: 2,
              background: d.color,
              flexShrink: 0,
            }} />
            <span style={{ color: '#68594f' }}>{d.name}</span>
          </div>
        ))}
      </div>

      <RichTooltip
        dishId={tooltip.dishId}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
        extraLabel={tooltip.visible ? `${tooltip.day}: ${tooltip.value}` : undefined}
        sparklineType="weekly"
      />
    </div>
  );
}
