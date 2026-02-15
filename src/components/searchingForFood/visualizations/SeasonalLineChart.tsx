import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { seasonalTrends, dishMap } from '../../../data/searchingForFood';
import { RichTooltip } from '../RichTooltip';

interface SeasonalLineChartProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  month: string;
  dishId: string;
  items: { name: string; color: string; value: number; dishId: string }[];
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function SeasonalLineChart({ activeStep }: SeasonalLineChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, month: '', dishId: '', items: [] });
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

      // Solo highlight overrides step-based highlighting
      let isHighlighted: boolean;
      if (soloHighlight) {
        isHighlighted = st.dishId === soloHighlight;
      } else {
        isHighlighted = highlighted.length === 0 || highlighted.includes(st.dishId);
      }

      const opacity = isHighlighted ? 0.9 : 0.1;
      const strokeWidth = isHighlighted && (highlighted.length > 0 || soloHighlight) ? 3 : 1.5;

      // Area
      const areaGen = d3.area<number>()
        .x((_, i) => x(i))
        .y0(h)
        .y1(d => y(d))
        .curve(d3.curveMonotoneX);

      if (isHighlighted && (highlighted.length > 0 || soloHighlight)) {
        g.append('path')
          .datum(st.monthly)
          .attr('d', areaGen)
          .attr('fill', color)
          .attr('opacity', 0)
          .transition().duration(600).delay(idx * 60).ease(d3.easeBackOut.overshoot(1.3))
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
        .transition().duration(600).delay(idx * 60).ease(d3.easeBackOut.overshoot(1.3))
        .attr('opacity', opacity);

      // Label on highlighted lines
      if (isHighlighted && (highlighted.length > 0 || soloHighlight) && dish) {
        const maxVal = Math.max(...st.monthly);
        const maxIdx = st.monthly.indexOf(maxVal);

        const labelX = Math.max(30, Math.min(w - 30, x(maxIdx)));
        g.append('text')
          .attr('x', labelX)
          .attr('y', y(maxVal) - 10)
          .attr('text-anchor', labelX <= 30 ? 'start' : labelX >= w - 30 ? 'end' : 'middle')
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

          const fLabelX = Math.max(30, Math.min(w - 30, x(f.month)));
          g.append('text')
            .attr('x', fLabelX)
            .attr('y', -5)
            .attr('text-anchor', fLabelX <= 30 ? 'start' : fLabelX >= w - 30 ? 'end' : 'middle')
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

    // Shared hover/touch logic
    const showTooltipAtMonth = (clientX: number, clientY: number, mx: number) => {
      const monthIdx = Math.round(x.invert(mx));
      const clampedIdx = Math.max(0, Math.min(11, monthIdx));
      const xPos = x(clampedIdx);

      crosshair.attr('x1', xPos).attr('x2', xPos).attr('opacity', 0.6);

      const items: { name: string; color: string; value: number; dishId: string }[] = [];
      hoverDots.selectAll('*').remove();

      seasonalTrends.forEach(st => {
        const dish = dishMap.get(st.dishId);
        let isVis: boolean;
        if (soloHighlight) {
          isVis = st.dishId === soloHighlight;
        } else {
          isVis = highlighted.length === 0 || highlighted.includes(st.dishId);
        }
        if (!isVis || !dish) return;

        const val = st.monthly[clampedIdx];
        items.push({ name: dish.name, color: dish.color, value: val, dishId: st.dishId });

        hoverDots.append('circle')
          .attr('cx', xPos)
          .attr('cy', y(val))
          .attr('r', 4)
          .attr('fill', dish.color)
          .attr('stroke', 'white')
          .attr('stroke-width', 1.5);
      });

      const sortedItems = items.sort((a, b) => b.value - a.value);
      setTooltip({
        visible: true,
        x: clientX,
        y: clientY - 10,
        month: MONTHS[clampedIdx],
        dishId: sortedItems[0]?.dishId || '',
        items: sortedItems,
      });
    };

    const hideTooltip = () => {
      crosshair.attr('opacity', 0);
      hoverDots.selectAll('*').remove();
      setTooltip(prev => ({ ...prev, visible: false }));
    };

    // Invisible overlay for mouse/touch tracking
    const overlay = g.append('rect')
      .attr('width', w)
      .attr('height', h)
      .attr('fill', 'transparent')
      .attr('cursor', 'crosshair');

    // Desktop mouse events
    overlay
      .on('mousemove', (event) => {
        const [mx] = d3.pointer(event);
        showTooltipAtMonth(event.clientX, event.clientY, mx);
      })
      .on('mouseleave', hideTooltip);

    // Mobile touch events
    overlay.node()?.addEventListener('touchstart', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const touch = event.touches[0];
      const svgRect = svgRef.current!.getBoundingClientRect();
      const mx = touch.clientX - svgRect.left - margin.left;
      showTooltipAtMonth(touch.clientX, touch.clientY, mx);

      // Dismiss on touch-outside
      const dismissOnTouch = (e: TouchEvent) => {
        const target = e.target as Element;
        if (!svgRef.current?.contains(target)) {
          hideTooltip();
          document.removeEventListener('touchstart', dismissOnTouch);
        }
      };
      setTimeout(() => {
        document.addEventListener('touchstart', dismissOnTouch, { once: false, passive: true });
        // Also dismiss on scroll
        window.addEventListener('scroll', () => {
          hideTooltip();
          document.removeEventListener('touchstart', dismissOnTouch);
        }, { once: true, passive: true });
      }, 50);
    }, { passive: false });

  }, [activeStep, dimensions, soloHighlight]);

  const legendDishes = useMemo(() => {
    return seasonalTrends.map(st => {
      const dish = dishMap.get(st.dishId);
      return dish ? { id: st.dishId, name: dish.name, color: dish.color } : null;
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
        items={tooltip.visible ? tooltip.items.map(i => ({ name: i.name, color: i.color, value: i.value })) : undefined}
        sparklineType="seasonal"
      />
    </div>
  );
}
