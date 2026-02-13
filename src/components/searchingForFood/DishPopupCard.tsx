import { stateTrends, dishMap } from '../../data/searchingForFood';

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

interface DishPopupCardProps {
  stateId: string;
  stateName: string;
  x: number;
  y: number;
  containerWidth: number;
  containerHeight: number;
  onClose: () => void;
}

export function DishPopupCard({
  stateId,
  stateName,
  x,
  y,
  containerWidth,
  containerHeight,
  onClose,
}: DishPopupCardProps) {
  const trend = stateTrends.find(s => s.stateId === stateId);
  if (!trend) return null;

  const topDish = trend.topDishes[0];
  if (!topDish) return null;

  const dish = dishMap.get(topDish.dishId);
  if (!dish) return null;

  const imgSrc = `/images/food-guide/dishes/${dish.id}.jpg`;
  const categoryLabel = CATEGORY_LABELS[dish.category] || dish.category;

  // Position: try to place near centroid, clamp to container bounds
  const cardW = 280;
  const cardH = dish.funFact ? 360 : 280;
  let left = x + 15;
  let top = y - cardH / 2;

  if (left + cardW > containerWidth) left = x - cardW - 15;
  if (left < 0) left = 8;
  if (top < 0) top = 8;
  if (top + cardH > containerHeight) top = containerHeight - cardH - 8;

  const metaRows = (
    <>
      <div className="dish-popup-meta">
        <span className="dish-popup-meta-label">Origin</span>
        <span className="dish-popup-meta-value">{dish.region.join(', ')}</span>
      </div>
      <div className="dish-popup-meta">
        <span className="dish-popup-meta-label">Type</span>
        <span className="dish-popup-meta-value">
          {categoryLabel}
          <span className={`dish-popup-veg-badge ${dish.isVeg ? 'veg' : 'nonveg'}`}>
            {dish.isVeg ? 'Veg' : 'Non-veg'}
          </span>
        </span>
      </div>
    </>
  );

  const body = (
    <>
      <div className="dish-popup-header">
        <div className="dish-popup-dish-name">{dish.name}</div>
        <div className="dish-popup-dish-hindi">{dish.nameHindi}</div>
      </div>

      <div className="dish-popup-state-label">
        Most searched in <strong>{stateName}</strong>
      </div>

      <div className="dish-popup-meta-list">
        {metaRows}
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
    </>
  );

  return (
    <>
      {/* Desktop: floating card */}
      <div
        className="dish-popup-card"
        style={{ left, top }}
        onClick={e => e.stopPropagation()}
      >
        <button
          className="dish-popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="dish-popup-hero-img" style={{ backgroundColor: dish.color + '20' }}>
          <img
            src={imgSrc}
            alt={dish.name}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        <div className="dish-popup-body">
          {body}
        </div>
      </div>

      {/* Mobile: bottom sheet */}
      <div
        className="dish-popup-sheet"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="dish-popup-close"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>

        <div className="dish-popup-sheet-inner">
          <div className="dish-popup-hero-img" style={{ backgroundColor: dish.color + '20' }}>
            <img
              src={imgSrc}
              alt={dish.name}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          <div className="dish-popup-body">
            {body}
          </div>
        </div>
      </div>
    </>
  );
}
