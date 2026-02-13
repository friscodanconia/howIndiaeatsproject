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

interface BubbleChartProps {
  activeStep: number;
}

interface BubbleNode extends d3.SimulationNodeDatum {
  dishId: string;
  name: string;
  nameHindi?: string;
  color: string;
  volume: number;
  rank: number;
  r: number;
}

interface PopupState {
  visible: boolean;
  dishId: string;
  x: number;
  y: number;
}

export function BubbleChart({ activeStep }: BubbleChartProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const simulationRef = useRef<d3.Simulation<BubbleNode, undefined> | null>(null);
  const [popup, setPopup] = useState<PopupState>({ visible: false, dishId: '', x: 0, y: 0 });
  const mergedRef = useRef<d3.Selection<SVGGElement, BubbleNode, SVGSVGElement, unknown> | null>(null);

  const closePopup = useCallback(() => {
    setPopup(prev => ({ ...prev, visible: false }));
    if (mergedRef.current) {
      mergedRef.current.transition().duration(200).attr('opacity', 1);
      mergedRef.current.selectAll('circle.bubble-img')
        .transition().duration(200)
        .attr('stroke-width', 2);
    }
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    // Determine which bubbles to show based on step
    let visibleCount: number;
    if (activeStep === 0) visibleCount = 1;
    else if (activeStep === 1) visibleCount = 5;
    else visibleCount = 20;

    const visibleData = nationalTrends.slice(0, visibleCount);

    const radiusScale = d3.scaleSqrt()
      .domain([0, 100])
      .range([0, Math.min(width, height) * 0.18]);

    const nodes: BubbleNode[] = visibleData.map(t => {
      const dish = dishMap.get(t.dishId);
      return {
        dishId: t.dishId,
        name: dish?.name || t.dishId,
        nameHindi: dish?.nameHindi,
        color: dish?.color || '#ccc',
        volume: t.searchVolume,
        rank: t.rank,
        r: radiusScale(t.searchVolume),
        x: width / 2 + (Math.random() - 0.5) * 50,
        y: height / 2 + (Math.random() - 0.5) * 50,
      };
    });

    // Stop old simulation
    if (simulationRef.current) simulationRef.current.stop();

    // Ensure <defs> exists for clip paths and patterns
    let defs = svg.select<SVGDefsElement>('defs');
    if (defs.empty()) {
      defs = svg.append('defs');
    }

    // Create clip-path + image pattern for each dish
    nodes.forEach(node => {
      const clipId = `clip-${node.dishId}`;
      const patternId = `img-${node.dishId}`;

      // Clip path
      let clip = defs.select<SVGClipPathElement>(`#${clipId}`);
      if (clip.empty()) {
        clip = defs.append('clipPath').attr('id', clipId);
        clip.append('circle');
      }
      clip.select('circle').attr('r', node.r);

      // Image pattern
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

    // Join data
    const bubbleGroup = svg.selectAll<SVGGElement, BubbleNode>('g.bubble')
      .data(nodes, d => d.dishId);

    // Exit
    bubbleGroup.exit()
      .transition().duration(400)
      .attr('opacity', 0)
      .remove();

    // Enter
    const enter = bubbleGroup.enter()
      .append('g')
      .attr('class', 'bubble')
      .attr('opacity', 0)
      .style('cursor', 'pointer');

    // Background circle (fallback color + border)
    enter.append('circle')
      .attr('class', 'bubble-bg')
      .attr('r', d => d.r)
      .attr('fill', d => d.color)
      .attr('opacity', 0.2);

    // Image circle (pattern fill) — radius set immediately; parent <g> handles fade-in
    enter.append('circle')
      .attr('class', 'bubble-img')
      .attr('r', d => d.r)
      .attr('fill', d => `url(#img-${d.dishId})`)
      .attr('stroke', d => d3.color(d.color)?.darker(0.2)?.toString() || d.color)
      .attr('stroke-width', 2);

    // Label
    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', d => d.r + Math.max(12, d.r * 0.2))
      .attr('class', 'viz-label')
      .attr('fill', '#28211e')
      .style('font-size', d => `${Math.max(9, d.r * 0.22)}px`)
      .style('font-weight', '600')
      .style('pointer-events', 'none')
      .text(d => d.r > 18 ? d.name : '');

    // Merge enter + update
    const merged = enter.merge(bubbleGroup);
    mergedRef.current = merged;

    merged.transition().duration(600).ease(d3.easeCubicInOut)
      .attr('opacity', 1);

    // Update radii — important for existing bubbles that change size between steps
    merged.select('circle.bubble-bg')
      .attr('r', d => d.r);

    merged.select('circle.bubble-img')
      .attr('r', d => d.r)
      .attr('fill', d => `url(#img-${d.dishId})`);

    merged.select('text')
      .text(d => d.r > 18 ? d.name : '')
      .attr('dy', d => d.r + Math.max(12, d.r * 0.2))
      .style('font-size', d => `${Math.max(9, d.r * 0.22)}px`);

    // Click interactions — show popup card
    merged
      .on('click', function (event, d) {
        event.stopPropagation();

        // If clicking same bubble, toggle off
        if (popup.dishId === d.dishId && popup.visible) {
          closePopup();
          return;
        }

        // Dim other bubbles
        merged.filter(n => n.dishId !== d.dishId)
          .transition().duration(200)
          .attr('opacity', 0.3);
        // Highlight clicked
        d3.select(this).transition().duration(200).attr('opacity', 1);
        d3.select(this).select('circle.bubble-img')
          .transition().duration(200)
          .attr('stroke-width', 3);

        // Position popup near the bubble
        const nodeX = d.x ?? 0;
        const nodeY = d.y ?? 0;
        setPopup({
          visible: true,
          dishId: d.dishId,
          x: nodeX + d.r + 15,
          y: nodeY - 20,
        });
      });

    // Force simulation
    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(2))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<BubbleNode>().radius(d => d.r + Math.max(16, d.r * 0.25)).strength(0.8))
      .force('x', d3.forceX(width / 2).strength(0.05))
      .force('y', d3.forceY(height / 2).strength(0.05))
      .alpha(0.6)
      .on('tick', () => {
        merged.attr('transform', d => `translate(${d.x},${d.y})`);
      });

    simulationRef.current = simulation;

    return () => {
      simulation.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep, dimensions]);

  // Render popup card
  const dish = popup.visible ? dishMap.get(popup.dishId) : null;
  const trend = popup.visible ? nationalTrends.find(t => t.dishId === popup.dishId) : null;

  // Clamp popup position within container
  const cardW = 260;
  const cardH = dish?.funFact ? 340 : 260;
  let popLeft = popup.x;
  let popTop = popup.y;
  if (popLeft + cardW > dimensions.width) popLeft = popup.x - cardW - 30;
  if (popLeft < 0) popLeft = 8;
  if (popTop < 0) popTop = 8;
  if (popTop + cardH > dimensions.height) popTop = dimensions.height - cardH - 8;

  // Click outside to close popup
  useEffect(() => {
    if (!popup.visible) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Don't close if clicking inside the popup card or a bubble
      if (target.closest('.bubble-popup-card') || target.closest('g.bubble')) return;
      closePopup();
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [popup.visible, closePopup]);

  // Close popup when step changes
  useEffect(() => {
    closePopup();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeStep]);

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
          {/* Desktop: floating card positioned near bubble */}
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

          {/* Mobile: bottom sheet popup */}
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
