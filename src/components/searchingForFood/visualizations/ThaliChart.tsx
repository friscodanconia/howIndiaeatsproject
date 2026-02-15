import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { nationalTrends, dishMap } from '../../../data/searchingForFood';

const CATEGORY_LABELS: Record<string, string> = {
  rice: 'Rice Dish',
  bread: 'Bread',
  curry: 'Curry',
  snack: 'Snack',
  sweet: 'Sweet',
  drink: 'Drink',
  'street-food': 'Street Food',
  lentil: 'Lentil Dish',
  seafood: 'Seafood',
};

interface ThaliChartProps {
  activeStep: number;
}

interface KatoriNode {
  dishId: string;
  name: string;
  nameHindi?: string;
  color: string;
  volume: number;
  rank: number;
  r: number;
  targetX: number;
  targetY: number;
}

interface PopupState {
  visible: boolean;
  dishId: string;
  x: number;
  y: number;
}

export function ThaliChart({ activeStep }: ThaliChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [popup, setPopup] = useState<PopupState>({ visible: false, dishId: '', x: 0, y: 0 });
  const prevStepRef = useRef(-1);

  const closePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, visible: false }));
  }, []);

  // Close popup on step change
  useEffect(() => {
    closePopup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;
    const svg = d3.select(svgRef.current);
    const cx = width / 2;
    const cy = height / 2;

    // Plate sizing
    const plateRadius = Math.min(width, height) * 0.44;
    const innerRingRadius = plateRadius * 0.42;
    const outerRingRadius = plateRadius * 0.78;

    // Determine which katoris to show
    let visibleCount: number;
    if (activeStep === 0) visibleCount = 1;
    else if (activeStep === 1) visibleCount = 5;
    else visibleCount = 20;

    const visibleData = nationalTrends.slice(0, visibleCount);

    // Radius scale for katoris
    const radiusScale = d3.scaleSqrt()
      .domain([0, 100])
      .range([0, Math.min(width, height) * 0.12]);

    // Compute katori positions
    const nodes: KatoriNode[] = visibleData.map((t, i) => {
      const dish = dishMap.get(t.dishId);
      const r = radiusScale(t.searchVolume);
      let targetX = cx;
      let targetY = cy;

      if (i === 0) {
        // Biryani: center
        targetX = cx;
        targetY = cy;
      } else if (i < 5) {
        // Inner ring: items 1-4
        const angle = ((i - 1) / 4) * Math.PI * 2 - Math.PI / 2;
        targetX = cx + innerRingRadius * Math.cos(angle);
        targetY = cy + innerRingRadius * Math.sin(angle);
      } else {
        // Outer ring: items 5-19
        const angle = ((i - 5) / 15) * Math.PI * 2 - Math.PI / 2;
        targetX = cx + outerRingRadius * Math.cos(angle);
        targetY = cy + outerRingRadius * Math.sin(angle);
      }

      return {
        dishId: t.dishId,
        name: dish?.name || t.dishId,
        nameHindi: dish?.nameHindi,
        color: dish?.color || '#ccc',
        volume: t.searchVolume,
        rank: t.rank,
        r,
        targetX,
        targetY,
      };
    });

    const isNewStep = prevStepRef.current !== activeStep;
    prevStepRef.current = activeStep;

    // Ensure <defs> exists
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
    }

    // Plate shadow filter
    let dropShadow = defs.select('#plate-shadow');
    if (dropShadow.empty()) {
      const filter = defs.append('filter')
        .attr('id', 'plate-shadow')
        .attr('x', '-10%').attr('y', '-10%')
        .attr('width', '120%').attr('height', '120%');
      filter.append('feDropShadow')
        .attr('dx', 0).attr('dy', 2)
        .attr('stdDeviation', 6)
        .attr('flood-color', 'rgba(97, 61, 31, 0.12)');
    }

    // Katori glow filter
    let glowFilter = defs.select('#katori-glow-filter');
    if (glowFilter.empty()) {
      const gf = defs.append('filter')
        .attr('id', 'katori-glow-filter')
        .attr('x', '-50%').attr('y', '-50%')
        .attr('width', '200%').attr('height', '200%');
      gf.append('feGaussianBlur')
        .attr('in', 'SourceGraphic')
        .attr('stdDeviation', 4);
    }

    // Create patterns for each katori
    nodes.forEach(node => {
      const patternId = `thali-img-${node.dishId}`;
      let pattern = defs.select<SVGPatternElement>(`#${patternId}`);
      if (pattern.empty()) {
        pattern = defs.append('pattern')
          .attr('id', patternId)
          .attr('patternUnits', 'objectBoundingBox')
          .attr('width', 1)
          .attr('height', 1);
        pattern.append('rect').attr('fill', node.color + '30');
        pattern.append('image')
          .attr('preserveAspectRatio', 'xMidYMid slice');
      }
      const size = node.r * 2;
      pattern.select('rect').attr('width', size).attr('height', size);
      pattern.select('image')
        .attr('href', `/images/food-guide/dishes/${node.dishId}.jpg`)
        .attr('width', size)
        .attr('height', size);
    });

    // Draw plate (background circle)
    let plate = svg.select<SVGCircleElement>('circle.thali-plate');
    if (plate.empty()) {
      plate = svg.append('circle')
        .attr('class', 'thali-plate')
        .attr('r', 0)
        .attr('fill', '#f8f2e8')
        .attr('stroke', '#e7decd')
        .attr('stroke-width', 3)
        .attr('filter', 'url(#plate-shadow)');
    }
    plate
      .attr('cx', cx)
      .attr('cy', cy)
      .transition().duration(800).ease(d3.easeBackOut.overshoot(1.0))
      .attr('r', plateRadius);

    // Plate rim decoration
    let rimOuter = svg.select<SVGCircleElement>('circle.thali-rim-outer');
    if (rimOuter.empty()) {
      rimOuter = svg.append('circle')
        .attr('class', 'thali-rim-outer')
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', '#e7decd')
        .attr('stroke-width', 1)
        .attr('stroke-dasharray', '4,6');
    }
    rimOuter
      .attr('cx', cx).attr('cy', cy)
      .transition().duration(800).ease(d3.easeBackOut.overshoot(1.0))
      .attr('r', plateRadius * 0.92);

    let rimInner = svg.select<SVGCircleElement>('circle.thali-rim-inner');
    if (rimInner.empty()) {
      rimInner = svg.append('circle')
        .attr('class', 'thali-rim-inner')
        .attr('r', 0)
        .attr('fill', 'none')
        .attr('stroke', '#e7decd')
        .attr('stroke-width', 0.5);
    }
    rimInner
      .attr('cx', cx).attr('cy', cy)
      .transition().duration(800).ease(d3.easeBackOut.overshoot(1.0))
      .attr('r', plateRadius * 0.60);

    // Data join for katoris
    const katoriGroup = svg.selectAll<SVGGElement, KatoriNode>('g.katori')
      .data(nodes, d => d.dishId);

    // Exit
    katoriGroup.exit()
      .transition().duration(400)
      .attr('opacity', 0)
      .attr('transform', d => `translate(${cx},${cy}) scale(0)`)
      .remove();

    // Enter
    const enter = katoriGroup.enter()
      .append('g')
      .attr('class', 'katori')
      .attr('transform', `translate(${cx},${cy}) scale(0)`)
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    // Hit area
    enter.append('circle')
      .attr('class', 'katori-hit')
      .attr('r', d => Math.max(22, d.r))
      .attr('fill', 'transparent');

    // Bowl shadow
    enter.append('ellipse')
      .attr('class', 'katori-shadow')
      .attr('rx', d => d.r * 0.9)
      .attr('ry', d => d.r * 0.3)
      .attr('cy', d => d.r * 0.7)
      .attr('fill', 'rgba(97, 61, 31, 0.08)');

    // Hover glow ring (hidden by default)
    enter.append('circle')
      .attr('class', 'katori-glow')
      .attr('r', d => d.r + 8)
      .attr('fill', 'none')
      .attr('stroke', d => d.color)
      .attr('stroke-width', 6)
      .attr('opacity', 0)
      .attr('filter', 'url(#katori-glow-filter)');

    // Bowl background (katori rim)
    enter.append('circle')
      .attr('class', 'katori-rim')
      .attr('r', d => d.r + 3)
      .attr('fill', '#e7decd')
      .attr('stroke', '#d4c4ac')
      .attr('stroke-width', 1);

    // Image circle
    enter.append('circle')
      .attr('class', 'katori-img')
      .attr('r', d => d.r)
      .attr('fill', d => `url(#thali-img-${d.dishId})`)
      .attr('stroke', d => d3.color(d.color)?.darker(0.2)?.toString() || d.color)
      .attr('stroke-width', 2);

    // Label
    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.r + Math.max(14, d.r * 0.25))
      .attr('class', 'viz-label')
      .attr('fill', '#28211e')
      .style('font-size', d => `${Math.max(8, d.r * 0.2)}px`)
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => d.r > 14 ? d.name : '');

    // Merge
    const merged = enter.merge(katoriGroup);

    // Ring-aware stagger: plate first, then center, inner ring, outer ring
    const getStaggerDelay = (index: number): number => {
      if (index === 0) return 200;                    // center biryani: after plate
      if (index < 5) return 400 + (index - 1) * 80;  // inner ring: 400-640ms
      return 800 + (index - 5) * 40;                  // outer ring: 800-1360ms
    };

    // Animate to target positions with ring-aware stagger
    merged.each(function (d, i) {
      const el = d3.select(this);
      const isEntering = el.attr('opacity') === '0' || el.attr('opacity') === null;
      const staggerDelay = isNewStep ? getStaggerDelay(i) : 0;
      const ease = isEntering ? d3.easeBackOut.overshoot(1.0) : d3.easeCubicOut;

      el.transition()
        .duration(800)
        .delay(staggerDelay)
        .ease(ease)
        .attr('transform', `translate(${d.targetX},${d.targetY}) scale(1)`)
        .attr('opacity', 1);
    });

    // Subtle center katori pulse after full thali lands (step 2+)
    if (activeStep >= 2 && isNewStep) {
      const centerKatori = merged.filter(d => d.rank === 1);
      centerKatori.each(function (d) {
        d3.select(this)
          .transition('pulse')
          .delay(1400)
          .duration(300)
          .attr('transform', `translate(${d.targetX},${d.targetY}) scale(1.05)`)
          .transition('pulse')
          .duration(300)
          .attr('transform', `translate(${d.targetX},${d.targetY}) scale(1)`);
      });
    }

    // Update sizes for existing katoris
    merged.select('circle.katori-hit')
      .attr('r', d => Math.max(22, d.r));
    merged.select('circle.katori-glow')
      .attr('r', d => d.r + 8)
      .attr('stroke', d => d.color);
    merged.select('circle.katori-rim')
      .attr('r', d => d.r + 3);
    merged.select('circle.katori-img')
      .attr('r', d => d.r)
      .attr('fill', d => `url(#thali-img-${d.dishId})`);
    merged.select('ellipse.katori-shadow')
      .attr('rx', d => d.r * 0.9)
      .attr('ry', d => d.r * 0.3)
      .attr('cy', d => d.r * 0.7);
    merged.select('text')
      .text(d => d.r > 14 ? d.name : '')
      .attr('dy', d => d.r + Math.max(14, d.r * 0.25))
      .style('font-size', d => `${Math.max(8, d.r * 0.2)}px`);

    // Hover effects (with glow)
    merged
      .on('mouseenter', function (_, d) {
        d3.select(this).select('circle.katori-glow')
          .transition().duration(200)
          .attr('opacity', 0.6);
        d3.select(this).select('circle.katori-img')
          .transition().duration(200)
          .attr('stroke-width', 3);
        d3.select(this)
          .transition().duration(200)
          .attr('transform', `translate(${d.targetX},${d.targetY}) scale(1.08)`);
      })
      .on('mouseleave', function (_, d) {
        if (popup.dishId === d.dishId && popup.visible) return;
        d3.select(this).select('circle.katori-glow')
          .transition().duration(200)
          .attr('opacity', 0);
        d3.select(this).select('circle.katori-img')
          .transition().duration(200)
          .attr('stroke-width', 2);
        d3.select(this)
          .transition().duration(200)
          .attr('transform', `translate(${d.targetX},${d.targetY}) scale(1)`);
      })
      .on('click', function (event, d) {
        event.stopPropagation();

        if (popup.dishId === d.dishId && popup.visible) {
          closePopup();
          return;
        }

        // Dim other katoris
        merged.filter(n => n.dishId !== d.dishId)
          .transition().duration(200)
          .attr('opacity', 0.3);
        d3.select(this).transition().duration(200).attr('opacity', 1);

        setPopup({
          visible: true,
          dishId: d.dishId,
          x: d.targetX + d.r + 15,
          y: d.targetY - 20,
        });
      });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, dimensions]);

  // Click outside to close
  useEffect(() => {
    if (!popup.visible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('.bubble-popup-card') || target.closest('g.katori')) return;
      closePopup();
      // Restore all katori opacity
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll('g.katori')
          .transition().duration(200).attr('opacity', 1);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popup.visible, closePopup]);

  // Close popup on scroll
  useEffect(() => {
    if (!popup.visible) return;
    const handleScroll = () => closePopup();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popup.visible, closePopup]);

  // Render popup
  const dish = popup.visible ? dishMap.get(popup.dishId) : null;
  const trend = popup.visible ? nationalTrends.find(t => t.dishId === popup.dishId) : null;

  const cardW = 260;
  const cardH = dish?.funFact ? 340 : 260;
  let popLeft = popup.x;
  let popTop = popup.y;
  if (popLeft + cardW > dimensions.width) popLeft = popup.x - cardW - 30;
  if (popLeft < 0) popLeft = 8;
  if (popTop < 0) popTop = 8;
  if (popTop + cardH > dimensions.height) popTop = dimensions.height - cardH - 8;

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
      {popup.visible && dish && trend && (
        <>
          {/* Desktop: floating card */}
          <div
            className="dish-popup-card bubble-popup-card"
            style={{ left: popLeft, top: popTop }}
          >
            <button
              className="dish-popup-close"
              onClick={(e) => { e.stopPropagation(); closePopup(); }}
              aria-label="Close"
            >&times;</button>
            <div className="dish-popup-hero-img" style={{ backgroundColor: dish.color + '20' }}>
              <img
                src={`/images/food-guide/dishes/${dish.id}.jpg`}
                alt={dish.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="dish-popup-body">
              <div className="dish-popup-header">
                <div className="dish-popup-dish-name">{dish.name}</div>
                <div className="dish-popup-dish-hindi">{dish.nameHindi}</div>
              </div>
              <div className="dish-popup-meta-list">
                <div className="dish-popup-meta">
                  <span className="dish-popup-meta-label">Origin</span>
                  <span className="dish-popup-meta-value">{dish.region.join(', ')}</span>
                </div>
                <div className="dish-popup-meta">
                  <span className="dish-popup-meta-label">Type</span>
                  <span className="dish-popup-meta-value">
                    {CATEGORY_LABELS[dish.category] || dish.category}
                    <span className={`dish-popup-veg-badge ${dish.isVeg ? 'veg' : 'nonveg'}`}>
                      {dish.isVeg ? 'Veg' : 'Non-veg'}
                    </span>
                  </span>
                </div>
              </div>
              {dish.funFact && (
                <div className="dish-popup-funfact">{dish.funFact}</div>
              )}
              {dish.recipeUrl && (
                <a
                  className="dish-popup-recipe-link"
                  href={dish.recipeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Recipe &rarr;
                </a>
              )}
            </div>
          </div>

          {/* Mobile: bottom sheet */}
          <div className="bubble-popup-card mobile-sheet">
            <button
              className="dish-popup-close"
              onClick={(e) => { e.stopPropagation(); closePopup(); }}
              aria-label="Close"
            >&times;</button>
            <div className="dish-popup-hero-img" style={{ backgroundColor: dish.color + '20' }}>
              <img
                src={`/images/food-guide/dishes/${dish.id}.jpg`}
                alt={dish.name}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="dish-popup-body">
              <div className="dish-popup-header">
                <div className="dish-popup-dish-name">{dish.name}</div>
                <div className="dish-popup-dish-hindi">{dish.nameHindi}</div>
              </div>
              <div className="dish-popup-meta-list">
                <div className="dish-popup-meta">
                  <span className="dish-popup-meta-label">Origin</span>
                  <span className="dish-popup-meta-value">{dish.region.join(', ')}</span>
                </div>
                <div className="dish-popup-meta">
                  <span className="dish-popup-meta-label">Type</span>
                  <span className="dish-popup-meta-value">
                    {CATEGORY_LABELS[dish.category] || dish.category}
                    <span className={`dish-popup-veg-badge ${dish.isVeg ? 'veg' : 'nonveg'}`}>
                      {dish.isVeg ? 'Veg' : 'Non-veg'}
                    </span>
                  </span>
                </div>
              </div>
              {dish.funFact && (
                <div className="dish-popup-funfact">{dish.funFact}</div>
              )}
              {dish.recipeUrl && (
                <a
                  className="dish-popup-recipe-link"
                  href={dish.recipeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Recipe &rarr;
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
