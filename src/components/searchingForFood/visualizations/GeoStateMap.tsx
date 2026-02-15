import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import * as d3 from 'd3';
import * as topojson from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { stateTrends, dishMap, stateGeoMapping } from '../../../data/searchingForFood';
import topoData from '../../../data/searchingForFood/india-states.topo.json';
import { DishPopupCard } from '../DishPopupCard';

interface StateProperties {
  ST_NM: string;
  [key: string]: unknown;
}

interface GeoStateMapProps {
  activeStep: number;
}

interface TooltipState {
  x: number;
  y: number;
  stateName: string;
  dishName: string;
  visible: boolean;
}

interface PopupState {
  stateId: string;
  stateName: string;
  x: number;
  y: number;
}

// India geographic center (approx)
const INDIA_CENTER: [number, number] = [78.9, 22.5];

export function GeoStateMap({ activeStep }: GeoStateMapProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, stateName: '', dishName: '', visible: false });
  const [popup, setPopup] = useState<PopupState | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const [showRank, setShowRank] = useState<1 | 2>(1);
  const prevRankRef = useRef<1 | 2>(1);

  // Build lookups
  const trendMap = useRef(new Map(stateTrends.map(s => [s.stateId, s]))).current;

  // Auto-toggle rank based on scroll step
  useEffect(() => {
    if (activeStep >= 2) {
      setShowRank(2);
    } else {
      setShowRank(1);
    }
  }, [activeStep]);

  const getDishForState = useCallback((stateId: string, rank: 1 | 2) => {
    const trend = trendMap.get(stateId);
    if (!trend) return null;
    const rankIndex = rank - 1;
    return trend.topDishes[rankIndex] || null;
  }, [trendMap]);

  const getDishColor = useCallback((stateId: string, rank: 1 | 2, step: number) => {
    const trend = trendMap.get(stateId);
    if (!trend) return '#e7decd';

    // Step 1: all biryani gold
    if (step === 1 && rank === 1) {
      return trend.topDishes[0]?.dishId === 'biryani' ? '#ffcc2d' : '#e7decd';
    }

    const dish = getDishForState(stateId, rank);
    if (!dish) return '#e7decd';
    const d = dishMap.get(dish.dishId);
    return d?.color || '#e7decd';
  }, [trendMap, getDishForState]);

  const getDishName = useCallback((stateId: string, rank: 1 | 2) => {
    const dish = getDishForState(stateId, rank);
    if (!dish) return '';
    const d = dishMap.get(dish.dishId);
    return d?.name || dish.dishId;
  }, [getDishForState]);

  // Close popup on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopup(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Close popup on scroll
  useEffect(() => {
    if (!popup) return;
    const handleScroll = () => setPopup(null);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [popup]);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;
    const { width, height } = dimensions;
    if (width === 0 || height === 0) return;
    const svg = d3.select(svgRef.current);

    // Parse TopoJSON — filter out island territories that distort the projection
    const EXCLUDED = new Set(['Andaman and Nicobar Islands', 'Lakshadweep']);
    const topo = topoData as unknown as Topology;
    const objectKey = Object.keys(topo.objects)[0];
    const allFeatures = topojson.feature(
      topo,
      topo.objects[objectKey] as GeometryCollection<StateProperties>
    );
    const geoFeatures = {
      ...allFeatures,
      features: allFeatures.features.filter(
        f => !EXCLUDED.has(f.properties.ST_NM)
      ),
    };

    // Projection — fit to mainland only
    const projection = d3.geoMercator().fitSize(
      [width, height * 0.95],
      geoFeatures as any
    );
    projectionRef.current = projection;

    const pathGen = d3.geoPath().projection(projection);

    // Compute India center in screen coords for distance-based stagger
    const indiaScreenCenter = projection(INDIA_CENTER) || [width / 2, height / 2];

    // Compute centroid distances for stagger
    const centroidDistances = new Map<string, number>();
    let maxDist = 0;
    geoFeatures.features.forEach(f => {
      const centroid = pathGen.centroid(f as any);
      const dist = Math.sqrt(
        Math.pow(centroid[0] - indiaScreenCenter[0], 2) +
        Math.pow(centroid[1] - indiaScreenCenter[1], 2)
      );
      centroidDistances.set(f.properties.ST_NM, dist);
      if (dist > maxDist) maxDist = dist;
    });

    // Did rank change from previous render?
    const isRankTransition = prevRankRef.current !== showRank;
    prevRankRef.current = showRank;

    // Data join
    const paths = svg.selectAll<SVGPathElement, typeof geoFeatures.features[0]>('path.state')
      .data(geoFeatures.features, (d: any) => d.properties.ST_NM);

    const enter = paths.enter()
      .append('path')
      .attr('class', 'state')
      .attr('d', pathGen as any)
      .attr('fill', '#e7decd')
      .attr('stroke', '#f4efe5')
      .attr('stroke-width', 1.5)
      .attr('cursor', d => {
        const stateId = stateGeoMapping[d.properties.ST_NM];
        return stateId && trendMap.has(stateId) ? 'pointer' : 'default';
      })
      .attr('opacity', 0)
      .on('mouseenter', function (event, d) {
        const stateId = stateGeoMapping[d.properties.ST_NM];
        if (!stateId || !trendMap.has(stateId)) return;

        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltip({
          x: mx,
          y: my - 10,
          stateName: d.properties.ST_NM,
          dishName: getDishName(stateId, showRank),
          visible: true,
        });

        d3.select(this).attr('stroke', '#28211e').attr('stroke-width', 2);
      })
      .on('mousemove', function (event) {
        const [mx, my] = d3.pointer(event, svgRef.current);
        setTooltip(prev => ({ ...prev, x: mx, y: my - 10 }));
      })
      .on('mouseleave', function (_, d) {
        setTooltip(prev => ({ ...prev, visible: false }));
        const stateId = stateGeoMapping[d.properties.ST_NM];
        const isSelected = popup?.stateId === stateId;
        d3.select(this)
          .attr('stroke', isSelected ? '#f9564e' : '#f4efe5')
          .attr('stroke-width', isSelected ? 2.5 : 1.5);
      })
      .on('click', function (event, d) {
        const stateId = stateGeoMapping[d.properties.ST_NM];
        if (!stateId || !trendMap.has(stateId)) return;

        event.stopPropagation();

        // Get centroid for popup positioning
        const centroid = pathGen.centroid(d as any);
        setPopup({
          stateId,
          stateName: d.properties.ST_NM,
          x: centroid[0],
          y: centroid[1],
        });
      });

    const merged = enter.merge(paths);

    // Animate fill with staggered wave when rank changes
    merged.each(function (d) {
      const stateId = stateGeoMapping[d.properties.ST_NM];
      if (!stateId) return;
      const targetColor = getDishColor(stateId, showRank, activeStep);
      const dist = centroidDistances.get(d.properties.ST_NM) || 0;
      const normalizedDist = maxDist > 0 ? dist / maxDist : 0;
      const staggerDelay = isRankTransition ? normalizedDist * 800 : 0;

      d3.select(this)
        .transition()
        .duration(600)
        .delay(staggerDelay)
        .ease(d3.easeBackOut.overshoot(1.3))
        .attr('opacity', 1)
        .attr('fill', targetColor);
    });

    // Update selected state ring
    merged.each(function (d) {
      const stateId = stateGeoMapping[d.properties.ST_NM];
      const isSelected = popup?.stateId === stateId;
      if (isSelected) {
        d3.select(this).attr('stroke', '#f9564e').attr('stroke-width', 2.5);
      }
    });

    paths.exit().remove();

  }, [activeStep, dimensions, getDishColor, getDishName, trendMap, popup?.stateId, showRank]);

  const handleClickOutside = () => {
    setPopup(null);
  };

  // Compute legend dishes based on current rank view
  const legendDishes = useMemo(() => {
    const dishIds = new Set<string>();

    if (activeStep === 1 && showRank === 1) {
      dishIds.add('biryani');
    } else {
      stateTrends.forEach(st => {
        const rankIndex = showRank - 1;
        const dish = st.topDishes[rankIndex];
        if (dish) dishIds.add(dish.dishId);
      });
    }

    return Array.from(dishIds)
      .map(id => {
        const dish = dishMap.get(id);
        return dish ? { id, name: dish.name, color: dish.color } : null;
      })
      .filter(Boolean) as { id: string; name: string; color: string }[];
  }, [activeStep, showRank]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
        onClick={handleClickOutside}
      />

      {/* Rank toggle button */}
      <div className="geo-rank-toggle">
        <button
          className={`geo-rank-btn ${showRank === 1 ? 'active' : ''}`}
          onClick={() => setShowRank(1)}
        >
          #1 Dishes
        </button>
        <button
          className={`geo-rank-btn ${showRank === 2 ? 'active' : ''}`}
          onClick={() => setShowRank(2)}
        >
          Runners-up
        </button>
      </div>

      {/* Color legend */}
      {legendDishes.length > 0 && (
        <div className="geo-legend" style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '0.25rem 0.6rem',
          padding: '0.25rem 0',
          fontFamily: '"Jost", sans-serif',
          fontSize: '0.7rem',
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
      )}

      {/* Hover tooltip — hidden when popup is open */}
      {tooltip.visible && !popup && (
        <div
          className="viz-tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: 'translate(-50%, -100%)',
            opacity: 1,
          }}
        >
          <div className="viz-tooltip-title">{tooltip.stateName}</div>
          <div style={{ color: '#68594f' }}>
            {showRank === 2 ? 'Runner-up: ' : ''}{getDishName(
              stateGeoMapping[tooltip.stateName] || '',
              showRank
            )}
          </div>
        </div>
      )}

      {/* Click popup */}
      {popup && (
        <DishPopupCard
          stateId={popup.stateId}
          stateName={popup.stateName}
          x={popup.x}
          y={popup.y}
          containerWidth={dimensions.width}
          containerHeight={dimensions.height}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  );
}
