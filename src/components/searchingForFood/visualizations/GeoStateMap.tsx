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

export function GeoStateMap({ activeStep }: GeoStateMapProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, stateName: '', dishName: '', visible: false });
  const [popup, setPopup] = useState<PopupState | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);

  // Build lookups
  const trendMap = useRef(new Map(stateTrends.map(s => [s.stateId, s]))).current;

  const getDishColor = useCallback((stateId: string, step: number) => {
    const trend = trendMap.get(stateId);
    if (!trend) return '#e7decd';
    const rankIndex = step >= 3 ? 0 : step >= 2 ? 1 : 0;
    const dish = trend.topDishes[rankIndex];
    if (!dish) return '#e7decd';

    if (step === 1) {
      return dish.dishId === 'biryani' || trend.topDishes[0]?.dishId === 'biryani'
        ? '#ffcc2d'
        : '#e7decd';
    }

    const d = dishMap.get(dish.dishId);
    return d?.color || '#e7decd';
  }, [trendMap]);

  const getDishName = useCallback((stateId: string) => {
    const trend = trendMap.get(stateId);
    if (!trend) return '';
    const dish = trend.topDishes[0];
    if (!dish) return '';
    const d = dishMap.get(dish.dishId);
    return d?.name || dish.dishId;
  }, [trendMap]);

  // Close popup on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopup(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // D3 rendering
  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
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
          dishName: getDishName(stateId),
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

    // Animate in
    merged
      .transition().duration(600).ease(d3.easeCubicInOut)
      .attr('d', pathGen as any)
      .attr('opacity', 1)
      .attr('fill', d => {
        const stateId = stateGeoMapping[d.properties.ST_NM];
        if (!stateId) return '#ece5d8';
        return getDishColor(stateId, activeStep);
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

  }, [activeStep, dimensions, getDishColor, getDishName, trendMap, popup?.stateId]);

  const handleClickOutside = () => {
    setPopup(null);
  };

  // Compute legend dishes based on which rank is shown on the map
  const legendDishes = useMemo(() => {
    const dishIds = new Set<string>();
    // step 0: #1 dishes (colored), step 1: biryani only, step 2: #2 dishes, step 3+: #1 dishes
    const rankIndex = activeStep >= 3 ? 0 : activeStep >= 2 ? 1 : 0;

    if (activeStep === 1) {
      dishIds.add('biryani');
    } else if (activeStep >= 0) {
      stateTrends.forEach(st => {
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
  }, [activeStep]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
        onClick={handleClickOutside}
      />

      {/* Color legend */}
      {legendDishes.length > 0 && (
        <div className="geo-legend" style={{
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
          <div style={{ color: '#68594f' }}>{tooltip.dishName}</div>
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
