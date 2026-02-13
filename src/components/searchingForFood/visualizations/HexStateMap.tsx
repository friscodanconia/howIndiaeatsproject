import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { stateHexGrid, stateTrends, dishMap } from '../../../data/searchingForFood';

interface HexStateMapProps {
  activeStep: number;
}

export function HexStateMap({ activeStep }: HexStateMapProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);

    // Calculate hex size based on available space
    const hexRadius = Math.min(width / 18, height / 16, 35);
    const hexWidth = hexRadius * Math.sqrt(3);
    const hexHeight = hexRadius * 2;

    // Center the grid
    const minRow = Math.min(...stateHexGrid.map(s => s.row));
    const maxRow = Math.max(...stateHexGrid.map(s => s.row));
    const minCol = Math.min(...stateHexGrid.map(s => s.col));
    const maxCol = Math.max(...stateHexGrid.map(s => s.col));

    const gridWidth = (maxCol - minCol + 1) * hexWidth;
    const gridHeight = (maxRow - minRow + 1) * hexHeight * 0.75 + hexHeight * 0.25;
    const offsetX = (width - gridWidth) / 2 - minCol * hexWidth;
    const offsetY = (height - gridHeight) / 2 - minRow * hexHeight * 0.75;

    // Hex path
    const hexPath = (r: number) => {
      const points = d3.range(6).map(i => {
        const angle = (Math.PI / 180) * (60 * i - 30);
        return [r * Math.cos(angle), r * Math.sin(angle)];
      });
      return 'M' + points.map(p => p.join(',')).join('L') + 'Z';
    };

    // Build state → trend lookup
    const trendMap = new Map(stateTrends.map(s => [s.stateId, s]));

    // Determine which rank to show
    const rankIndex = activeStep >= 3 ? 0 : activeStep >= 2 ? 1 : 0;

    // Color based on top dish
    const getDishColor = (stateId: string) => {
      const trend = trendMap.get(stateId);
      if (!trend) return '#e7decd';
      const dish = trend.topDishes[rankIndex];
      if (!dish) return '#e7decd';
      const d = dishMap.get(dish.dishId);
      return d?.color || '#e7decd';
    };

    const getLabel = (stateId: string) => {
      const trend = trendMap.get(stateId);
      if (!trend) return '';
      const dish = trend.topDishes[rankIndex];
      if (!dish) return '';
      const d = dishMap.get(dish.dishId);
      return d?.name || dish.dishId;
    };

    // Data join
    const hexes = svg.selectAll<SVGGElement, typeof stateHexGrid[0]>('g.hex')
      .data(stateHexGrid, d => d.id);

    const enter = hexes.enter()
      .append('g')
      .attr('class', 'hex')
      .attr('opacity', 0);

    enter.append('path')
      .attr('d', hexPath(hexRadius * 0.92))
      .attr('stroke', '#f4efe5')
      .attr('stroke-width', 2);

    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '-0.1em')
      .attr('class', 'viz-label')
      .style('font-size', `${Math.max(8, hexRadius * 0.35)}px`)
      .style('font-weight', '600');

    enter.append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '1.1em')
      .attr('class', 'hex-dish-label')
      .style('font-family', '"Zilla Slab", serif')
      .style('font-size', `${Math.max(6, hexRadius * 0.25)}px`);

    const merged = enter.merge(hexes);

    merged
      .transition().duration(600).ease(d3.easeCubicInOut)
      .attr('transform', d => {
        const x = offsetX + d.col * hexWidth + (d.row % 2 === 1 ? hexWidth / 2 : 0);
        const y = offsetY + d.row * hexHeight * 0.75;
        return `translate(${x + hexWidth / 2},${y + hexHeight / 2})`;
      })
      .attr('opacity', () => {
        if (activeStep === 1) return 1; // highlight biryani states handled below
        return 1;
      });

    merged.select('path')
      .transition().duration(600).ease(d3.easeCubicInOut)
      .attr('fill', d => {
        if (activeStep === 1) {
          // Highlight biryani states
          const trend = trendMap.get(d.id);
          const topDish = trend?.topDishes[0];
          if (topDish?.dishId === 'biryani') return '#ffcc2d';
          return '#e7decd';
        }
        return getDishColor(d.id);
      });

    merged.select('text.viz-label')
      .text(d => d.abbreviation)
      .attr('fill', d => {
        const c = d3.color(getDishColor(d.id));
        if (!c) return '#28211e';
        const rgb = c.rgb();
        const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
        return lum > 160 ? '#28211e' : '#f4efe5';
      });

    merged.select('text.hex-dish-label')
      .text(d => activeStep >= 2 ? '' : getLabel(d.id))
      .attr('fill', d => {
        const c = d3.color(getDishColor(d.id));
        if (!c) return '#68594f';
        const rgb = c.rgb();
        const lum = 0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b;
        return lum > 160 ? '#68594f' : '#e7decd';
      });

  }, [activeStep, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ overflow: 'visible' }}
      />
    </div>
  );
}
