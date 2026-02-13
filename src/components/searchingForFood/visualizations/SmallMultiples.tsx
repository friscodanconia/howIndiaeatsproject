import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { useResponsiveSvg } from '../hooks/useResponsiveSvg';
import { pandemicShifts, dishMap } from '../../../data/searchingForFood';

interface SmallMultiplesProps {
  activeStep: number;
}

interface TooltipState {
  visible: boolean;
  x: number;
  y: number;
  dish: string;
  color: string;
  preAvg: number;
  postAvg: number;
  changePercent: number;
}

const MONTHS_SHORT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export function SmallMultiples({ activeStep }: SmallMultiplesProps) {
  const { containerRef, dimensions } = useResponsiveSvg();
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>({ visible: false, x: 0, y: 0, dish: '', color: '', preAvg: 0, postAvg: 0, changePercent: 0 });

  useEffect(() => {
    if (!svgRef.current) return;

    const { width, height } = dimensions;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const cols = 3;
    const rows = 2;
    const margin = { top: 10, right: 10, bottom: 10, left: 10 };
    const cellPad = { top: 28, right: 8, bottom: 22, left: 25 };
    const cellW = (width - margin.left - margin.right) / cols;
    const cellH = (height - margin.top - margin.bottom) / rows;

    pandemicShifts.forEach((ps, idx) => {
      const dish = dishMap.get(ps.dishId);
      const color = dish?.color || '#ccc';
      const col = idx % cols;
      const row = Math.floor(idx / cols);

      const gx = margin.left + col * cellW;
      const gy = margin.top + row * cellH;
      const g = svg.append('g')
        .attr('transform', `translate(${gx},${gy})`)
        .attr('class', 'small-multiple-cell')
        .attr('data-idx', idx)
        .attr('cursor', 'pointer');

      const innerW = cellW - cellPad.left - cellPad.right;
      const innerH = cellH - cellPad.top - cellPad.bottom;

      const x = d3.scaleLinear().domain([0, 11]).range([cellPad.left, cellPad.left + innerW]);
      const y = d3.scaleLinear().domain([0, 100]).range([cellPad.top + innerH, cellPad.top]);

      // Background rect for hover highlight
      g.append('rect')
        .attr('x', 2)
        .attr('y', 2)
        .attr('width', cellW - 4)
        .attr('height', cellH - 4)
        .attr('rx', 6)
        .attr('fill', 'transparent')
        .attr('class', 'cell-bg');

      // Title
      g.append('text')
        .attr('x', cellPad.left)
        .attr('y', cellPad.top - 10)
        .style('font-family', '"Jost", sans-serif')
        .style('font-size', '13px')
        .style('font-weight', '700')
        .attr('fill', '#28211e')
        .text(dish?.name || ps.dishId);

      // Change badge
      const sign = ps.changePercent > 0 ? '+' : '';
      g.append('text')
        .attr('x', cellPad.left + innerW)
        .attr('y', cellPad.top - 10)
        .attr('text-anchor', 'end')
        .style('font-family', '"Jost", sans-serif')
        .style('font-size', '12px')
        .style('font-weight', '700')
        .attr('fill', ps.changePercent > 0 ? '#1a8a8a' : '#e03c34')
        .text(`${sign}${ps.changePercent}%`);

      // X axis ticks
      MONTHS_SHORT.forEach((m, i) => {
        if (i % 3 === 0) {
          g.append('text')
            .attr('x', x(i))
            .attr('y', cellPad.top + innerH + 14)
            .attr('text-anchor', 'middle')
            .style('font-size', '8px')
            .attr('fill', '#afa39c')
            .text(m);
        }
      });

      // Baseline grid
      g.append('line')
        .attr('x1', cellPad.left)
        .attr('x2', cellPad.left + innerW)
        .attr('y1', cellPad.top + innerH)
        .attr('y2', cellPad.top + innerH)
        .attr('stroke', '#e7decd');

      const areaGen = d3.area<number>()
        .x((_, i) => x(i))
        .y0(cellPad.top + innerH)
        .y1(d => y(d))
        .curve(d3.curveMonotoneX);

      const lineGen = d3.line<number>()
        .x((_, i) => x(i))
        .y(d => y(d))
        .curve(d3.curveMonotoneX);

      // Darken color for better visibility
      const darkerColor = d3.color(color)?.darker(0.4)?.toString() || color;

      // 2019 area (always shown)
      g.append('path')
        .datum(ps.pre)
        .attr('d', areaGen)
        .attr('fill', color)
        .attr('opacity', 0)
        .transition().duration(600).delay(idx * 100)
        .attr('opacity', 0.25);

      g.append('path')
        .datum(ps.pre)
        .attr('d', lineGen)
        .attr('fill', 'none')
        .attr('stroke', darkerColor)
        .attr('stroke-width', 2)
        .attr('stroke-dasharray', '4,3')
        .attr('opacity', 0)
        .transition().duration(600).delay(idx * 100)
        .attr('opacity', 0.8);

      // 2019 label
      g.append('text')
        .attr('x', x(11) + 4)
        .attr('y', y(ps.pre[11]))
        .attr('dominant-baseline', 'middle')
        .style('font-size', '9px')
        .style('font-weight', '500')
        .attr('fill', '#68594f')
        .attr('opacity', 0)
        .text('2019')
        .transition().duration(400).delay(idx * 100 + 300)
        .attr('opacity', 1);

      // 2021 overlay (step >= 1)
      if (activeStep >= 1) {
        g.append('path')
          .datum(ps.post)
          .attr('d', areaGen)
          .attr('fill', color)
          .attr('opacity', 0)
          .transition().duration(600).delay(idx * 100 + 400)
          .attr('opacity', 0.35);

        g.append('path')
          .datum(ps.post)
          .attr('d', lineGen)
          .attr('fill', 'none')
          .attr('stroke', darkerColor)
          .attr('stroke-width', 3)
          .attr('opacity', 0)
          .transition().duration(600).delay(idx * 100 + 400)
          .attr('opacity', 1);

        g.append('text')
          .attr('x', x(11) + 4)
          .attr('y', y(ps.post[11]))
          .attr('dominant-baseline', 'middle')
          .style('font-size', '9px')
          .style('font-weight', '700')
          .attr('fill', darkerColor)
          .attr('opacity', 0)
          .text('2021')
          .transition().duration(400).delay(idx * 100 + 700)
          .attr('opacity', 1);
      }

      // Hover interactions
      const preAvg = Math.round(ps.pre.reduce((a, b) => a + b, 0) / 12);
      const postAvg = Math.round(ps.post.reduce((a, b) => a + b, 0) / 12);

      g
        .on('mouseenter', (event) => {
          // Highlight this cell
          g.select('.cell-bg')
            .transition().duration(150)
            .attr('fill', color + '0a');
          g.transition().duration(150)
            .style('transform', `translate(${gx}px, ${gy}px) scale(1.03)`)
            .style('transform-origin', `${gx + cellW / 2}px ${gy + cellH / 2}px`);

          // Dim other cells
          svg.selectAll('g.small-multiple-cell').each(function () {
            const el = d3.select(this);
            if (el.attr('data-idx') !== String(idx)) {
              el.transition().duration(150).attr('opacity', 0.4);
            }
          });

          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip({
            visible: true,
            x: mx,
            y: my - 10,
            dish: dish?.name || ps.dishId,
            color,
            preAvg,
            postAvg,
            changePercent: ps.changePercent,
          });
        })
        .on('mousemove', (event) => {
          const [mx, my] = d3.pointer(event, containerRef.current);
          setTooltip(prev => ({ ...prev, x: mx, y: my - 10 }));
        })
        .on('mouseleave', () => {
          g.select('.cell-bg')
            .transition().duration(150)
            .attr('fill', 'transparent');
          g.attr('style', null);

          svg.selectAll('g.small-multiple-cell')
            .transition().duration(150)
            .attr('opacity', 1);

          setTooltip(prev => ({ ...prev, visible: false }));
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
          <div style={{ fontSize: '0.8rem', color: '#68594f', marginTop: '0.15rem' }}>
            <div>2019 avg: <strong style={{ color: '#28211e' }}>{tooltip.preAvg}</strong></div>
            <div>2021 avg: <strong style={{ color: '#28211e' }}>{tooltip.postAvg}</strong></div>
          </div>
          <div style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: tooltip.changePercent > 0 ? '#23abab' : '#f9564e',
            marginTop: '0.15rem',
          }}>
            {tooltip.changePercent > 0 ? '+' : ''}{tooltip.changePercent}% change
          </div>
        </div>
      )}
    </div>
  );
}
