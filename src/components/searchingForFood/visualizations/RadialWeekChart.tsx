import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
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
  const [soloHighlight, setSoloHighlight] = useState<string | null>(null);

  const dismissTooltip = useCallback(() => {
    setTooltip(prev => ({ ...prev, visible: false }));
  }, []);

  // Dismiss tooltip on scroll (for mobile split-screen)
  useEffect(() => {
    if (!tooltip.visible) return;
    const onScroll = () => dismissTooltip();
    window.addEventListener('scroll', onScroll, { passive: true, once: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [tooltip.visible, dismissTooltip]);

  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;
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

      let isHighlighted: boolean;
      if (soloHighlight) {
        isHighlighted = wp.dishId === soloHighlight;
      } else {
        isHighlighted =
          (activeStep === 1 && wp.dishId === 'biryani') ||
          (activeStep === 2 && wp.dishId === 'dal-rice') ||
          activeStep === 0;
      }

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

    // Helper: restore opacities based on current state
    const restoreOpacities = () => {
      g.selectAll('path').each(function () {
        const el = d3.select(this);
        const elDish = el.attr('data-dish');
        if (!elDish) return;
        let isH: boolean;
        if (soloHighlight) {
          isH = elDish === soloHighlight;
        } else {
          isH =
            (activeStep === 1 && elDish === 'biryani') ||
            (activeStep === 2 && elDish === 'dal-rice') ||
            activeStep === 0;
        }
        const fill = el.attr('fill');
        const baseOpacity = fill !== 'none'
          ? (isH ? 0.85 : 0.12) * 0.2
          : (isH ? 0.85 : 0.12);
        el.transition().duration(200).attr('opacity', baseOpacity);
      });
    };

    // Shared tooltip show logic
    const showTooltipForPoint = (clientX: number, clientY: number, dishId: string, dayIdx: number, val: number) => {
      // Highlight this dish, dim others
      g.selectAll('path').attr('opacity', function () {
        const el = d3.select(this);
        return el.attr('data-dish') === dishId ? 0.9 : 0.05;
      });

      setTooltip({
        visible: true,
        x: clientX,
        y: clientY - 10,
        dishId,
        day: DAYS[dayIdx],
        value: val,
      });
    };

    const hideTooltip = () => {
      restoreOpacities();
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    // Invisible overlay circles at each data point for hover + touch
    weeklyPatterns.forEach(wp => {
      let isHighlighted: boolean;
      if (soloHighlight) {
        isHighlighted = wp.dishId === soloHighlight;
      } else {
        isHighlighted =
          (activeStep === 1 && wp.dishId === 'biryani') ||
          (activeStep === 2 && wp.dishId === 'dal-rice') ||
          activeStep === 0;
      }

      if (!isHighlighted) return;

      wp.pattern.forEach((val, dayIdx) => {
        const angle = angleScale(dayIdx) - Math.PI / 2;
        const r = radiusScale(val);

        const circle = g.append('circle')
          .attr('cx', r * Math.cos(angle))
          .attr('cy', r * Math.sin(angle))
          .attr('r', 8)
          .attr('fill', 'transparent')
          .attr('cursor', 'pointer')
          .attr('data-touchable', 'true');

        // Desktop mouse events
        circle
          .on('mouseenter', (event) => {
            showTooltipForPoint(event.clientX, event.clientY, wp.dishId, dayIdx, val);
          })
          .on('mouseleave', hideTooltip);

        // Mobile touch events
        circle.node()?.addEventListener('touchstart', (event) => {
          event.preventDefault();
          event.stopPropagation();
          const touch = event.touches[0];
          showTooltipForPoint(touch.clientX, touch.clientY, wp.dishId, dayIdx, val);

          const dismissOnTouch = (e: TouchEvent) => {
            const target = e.target as Element;
            if (!(target as Element).closest('[data-touchable]')) {
              hideTooltip();
              document.removeEventListener('touchstart', dismissOnTouch);
            }
          };
          setTimeout(() => {
            document.addEventListener('touchstart', dismissOnTouch, { passive: true });
            window.addEventListener('scroll', () => {
              hideTooltip();
              document.removeEventListener('touchstart', dismissOnTouch);
            }, { once: true, passive: true });
          }, 50);
        }, { passive: false });
      });
    });

  }, [activeStep, dimensions, soloHighlight]);

  const legendDishes = useMemo(() => {
    return weeklyPatterns.map(wp => {
      const dish = dishMap.get(wp.dishId);
      return dish ? { id: wp.dishId, name: dish.name, color: dish.color } : null;
    }).filter(Boolean) as { id: string; name: string; color: string }[];
  }, []);

  return (
    <div ref={containerRef} className="viz-chart-container" style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="viz-chart-svg"
        style={{ overflow: 'visible' }}
      />

      {/* Clickable legend */}
      <div className="chart-legend viz-chart-controls">
        {legendDishes.map(d => {
          const isActive = soloHighlight === d.id;
          const isDimmed = soloHighlight !== null && soloHighlight !== d.id;
          return (
            <div
              key={d.id}
              className={`chart-legend-item${isActive ? ' active' : ''}${isDimmed ? ' dimmed' : ''}`}
              style={isActive ? { borderColor: d.color, background: d.color + '15' } : undefined}
              onClick={() => setSoloHighlight(prev => prev === d.id ? null : d.id)}
            >
              <span className="legend-swatch" style={{ background: d.color }} />
              <span className="legend-label">{d.name}</span>
            </div>
          );
        })}
      </div>

      <RichTooltip
        dishId={tooltip.dishId}
        x={tooltip.x}
        y={tooltip.y}
        visible={tooltip.visible}
        extraLabel={tooltip.visible ? `${tooltip.day}\nSearch index: ${tooltip.value}` : undefined}
        sparklineType="weekly"
      />
    </div>
  );
}
