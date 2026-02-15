import { createPortal } from 'react-dom';
import { dishMap, weeklyPatterns, seasonalTrends } from '../../data/searchingForFood';

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

interface RichTooltipProps {
  dishId: string;
  x: number;
  y: number;
  visible: boolean;
  /** Extra line of context (e.g. "Sunday: 100"). Supports \n for multi-line. */
  extraLabel?: string;
  /** Structured multi-dish list (replaces extraLabel when provided) */
  items?: { name: string; color: string; value: number }[];
  /** Which sparkline to show */
  sparklineType?: 'weekly' | 'seasonal';
}

function MiniSparkline({ data, color, width = 60, height = 20 }: { data: number[]; color: string; width?: number; height?: number }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => {
    const px = (i / (data.length - 1)) * width;
    const py = height - ((v - min) / range) * (height - 2) - 1;
    return `${px},${py}`;
  }).join(' ');

  return (
    <svg width={width} height={height} style={{ display: 'block' }}>
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RichTooltip({ dishId, x, y, visible, extraLabel, items, sparklineType = 'weekly' }: RichTooltipProps) {
  const dish = dishMap.get(dishId);
  if (!visible || !dish) return null;

  // Get sparkline data
  let sparkData: number[] = [];
  if (sparklineType === 'weekly') {
    const wp = weeklyPatterns.find(w => w.dishId === dishId);
    if (wp) sparkData = [...wp.pattern];
  } else {
    const st = seasonalTrends.find(s => s.dishId === dishId);
    if (st) sparkData = [...st.monthly];
  }

  const content = (
    <div
      className="rich-tooltip"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="rich-tooltip-top">
        <div className="rich-tooltip-img">
          <img
            src={`/images/food-guide/dishes/${dish.id}.jpg`}
            alt={dish.name}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
        <div className="rich-tooltip-info">
          <div className="rich-tooltip-name">{dish.name}</div>
          {dish.nameHindi && (
            <div className="rich-tooltip-hindi">{dish.nameHindi}</div>
          )}
          <div className="rich-tooltip-badges">
            <span className={`rich-tooltip-veg ${dish.isVeg ? 'veg' : 'nonveg'}`}>
              {dish.isVeg ? 'Veg' : 'Non-veg'}
            </span>
            <span className="rich-tooltip-category">
              {CATEGORY_LABELS[dish.category] || dish.category}
            </span>
          </div>
        </div>
      </div>

      {sparkData.length > 0 && (
        <div className="rich-tooltip-sparkline">
          <MiniSparkline data={sparkData} color={dish.color} />
        </div>
      )}

      {items && items.length > 0 ? (
        <div className="rich-tooltip-items">
          {items.sort((a, b) => b.value - a.value).map((item, i) => (
            <div key={i} className="rich-tooltip-item-row">
              <span className="rich-tooltip-item-dot" style={{ background: item.color }} />
              <span className="rich-tooltip-item-name">{item.name}</span>
              <span className="rich-tooltip-item-value">{item.value}</span>
            </div>
          ))}
        </div>
      ) : extraLabel ? (
        <div className="rich-tooltip-extra">
          {extraLabel.includes('\n')
            ? extraLabel.split('\n').map((line, i) => <div key={i}>{line}</div>)
            : extraLabel}
        </div>
      ) : null}

      {dish.funFact && (
        <div className="rich-tooltip-fact">{dish.funFact}</div>
      )}
    </div>
  );

  // Use portal to render in fixed container to avoid SVG clipping
  const container = document.getElementById('rich-tooltip-root');
  if (container) {
    return createPortal(content, container);
  }
  return content;
}
